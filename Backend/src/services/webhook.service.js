const crypto = require('crypto');
const AppError = require('../utils/AppError');

/**
 * WebhookService - Manages webhook subscriptions and delivery
 */
class WebhookService {
    constructor({ prisma }) {
        this.prisma = prisma;
        this.MAX_RETRIES = 3;
        this.RETRY_DELAYS = [1000, 5000, 30000]; // 1s, 5s, 30s
    }

    /**
     * Generate HMAC signature for payload
     */
    generateSignature(payload, secret) {
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(JSON.stringify(payload));
        return hmac.digest('hex');
    }

    /**
     * Generate a random secret for new subscriptions
     */
    generateSecret() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Create a new webhook subscription
     */
    async createSubscription(storeId, data) {
        const secret = this.generateSecret();

        const subscription = await this.prisma.webhookSubscription.create({
            data: {
                store_id: storeId,
                url: data.url,
                secret,
                events: data.events || ['order.created', 'stock.low'],
                is_active: true
            }
        });

        return {
            ...subscription,
            secret // Return secret only on creation
        };
    }

    /**
     * Get all subscriptions for a store
     */
    async getSubscriptions(storeId) {
        return this.prisma.webhookSubscription.findMany({
            where: { store_id: storeId },
            select: {
                id: true,
                url: true,
                events: true,
                is_active: true,
                created_at: true,
                updated_at: true
            }
        });
    }

    /**
     * Get subscription by ID
     */
    async getSubscriptionById(subscriptionId, storeId) {
        const subscription = await this.prisma.webhookSubscription.findFirst({
            where: {
                id: subscriptionId,
                store_id: storeId
            }
        });

        if (!subscription) {
            throw new AppError('Webhook subscription not found', 404);
        }

        return subscription;
    }

    /**
     * Update a webhook subscription
     */
    async updateSubscription(subscriptionId, storeId, data) {
        await this.getSubscriptionById(subscriptionId, storeId);

        return this.prisma.webhookSubscription.update({
            where: { id: subscriptionId },
            data: {
                url: data.url,
                events: data.events,
                is_active: data.is_active,
                updated_at: new Date()
            }
        });
    }

    /**
     * Delete a webhook subscription
     */
    async deleteSubscription(subscriptionId, storeId) {
        await this.getSubscriptionById(subscriptionId, storeId);

        await this.prisma.webhookSubscription.delete({
            where: { id: subscriptionId }
        });

        return { success: true };
    }

    /**
     * Regenerate secret for a subscription
     */
    async regenerateSecret(subscriptionId, storeId) {
        await this.getSubscriptionById(subscriptionId, storeId);

        const newSecret = this.generateSecret();

        await this.prisma.webhookSubscription.update({
            where: { id: subscriptionId },
            data: {
                secret: newSecret,
                updated_at: new Date()
            }
        });

        return { secret: newSecret };
    }

    /**
     * Trigger webhooks for a specific event
     */
    async trigger(storeId, event, payload) {
        const subscriptions = await this.prisma.webhookSubscription.findMany({
            where: {
                store_id: storeId,
                is_active: true,
                events: { has: event }
            }
        });

        const results = await Promise.allSettled(
            subscriptions.map(sub => this.deliver(sub, event, payload))
        );

        return results.map((result, index) => ({
            subscriptionId: subscriptions[index].id,
            status: result.status,
            error: result.status === 'rejected' ? result.reason.message : null
        }));
    }

    /**
     * Deliver webhook to a single subscription
     */
    async deliver(subscription, event, payload, attempt = 1) {
        const timestamp = Date.now();
        const fullPayload = {
            event,
            timestamp,
            data: payload
        };

        const signature = this.generateSignature(fullPayload, subscription.secret);

        try {
            const response = await fetch(subscription.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Storely-Signature': signature,
                    'X-Storely-Timestamp': timestamp.toString(),
                    'X-Storely-Event': event
                },
                body: JSON.stringify(fullPayload),
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });

            // Log the delivery
            await this.logDelivery(subscription.id, event, fullPayload, response.status, null, attempt);

            if (!response.ok && attempt < this.MAX_RETRIES) {
                // Schedule retry
                await this.scheduleRetry(subscription, event, payload, attempt + 1);
            }

            return { success: response.ok, statusCode: response.status };
        } catch (error) {
            // Log the failure
            await this.logDelivery(subscription.id, event, fullPayload, null, error.message, attempt);

            if (attempt < this.MAX_RETRIES) {
                await this.scheduleRetry(subscription, event, payload, attempt + 1);
            }

            throw error;
        }
    }

    /**
     * Schedule a retry with delay
     */
    async scheduleRetry(subscription, event, payload, attempt) {
        const delay = this.RETRY_DELAYS[attempt - 1] || this.RETRY_DELAYS[this.RETRY_DELAYS.length - 1];

        setTimeout(() => {
            this.deliver(subscription, event, payload, attempt).catch(err => {
                console.error(`[Webhook] Retry ${attempt} failed for ${subscription.id}:`, err.message);
            });
        }, delay);
    }

    /**
     * Log webhook delivery attempt
     */
    async logDelivery(subscriptionId, event, payload, statusCode, errorMessage, attempts) {
        try {
            await this.prisma.webhookLog.create({
                data: {
                    subscription_id: subscriptionId,
                    event,
                    payload,
                    status_code: statusCode,
                    response: errorMessage,
                    attempts
                }
            });
        } catch (err) {
            console.error('[Webhook] Failed to log delivery:', err.message);
        }
    }

    /**
     * Get delivery logs for a subscription
     */
    async getLogs(subscriptionId, storeId, limit = 50) {
        await this.getSubscriptionById(subscriptionId, storeId);

        return this.prisma.webhookLog.findMany({
            where: { subscription_id: subscriptionId },
            orderBy: { created_at: 'desc' },
            take: limit
        });
    }

    /**
     * Send a test webhook
     */
    async sendTest(subscriptionId, storeId) {
        const subscription = await this.getSubscriptionById(subscriptionId, storeId);

        const testPayload = {
            test: true,
            message: 'This is a test webhook from Storely',
            timestamp: new Date().toISOString()
        };

        return this.deliver(subscription, 'test', testPayload);
    }
}

module.exports = WebhookService;
