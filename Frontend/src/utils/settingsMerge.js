/**
 * Deep merge utility for store settings
 * Preserves existing settings while updating only changed values
 */
export const deepMergeSettings = (existing, updates) => {
    if (!existing || typeof existing !== 'object') {
        return updates || {};
    }

    if (!updates || typeof updates !== 'object') {
        return existing;
    }

    const merged = { ...existing };

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            const existingValue = merged[key];
            const updateValue = updates[key];

            // For arrays, replace completely (components, etc.)
            if (Array.isArray(updateValue)) {
                merged[key] = updateValue;
            }
            // For objects, deep merge recursively
            else if (
                updateValue &&
                typeof updateValue === 'object' &&
                !Array.isArray(updateValue)
            ) {
                merged[key] = deepMergeSettings(existingValue, updateValue);
            }
            // For primitives, replace
            else {
                merged[key] = updateValue;
            }
        }
    }

    return merged;
};

/**
 * Merge component content preserving existing content
 */
export const mergeComponentContent = (existing, updates) => {
    if (!existing) return updates || {};
    if (!updates) return existing;

    const merged = { ...existing };

    for (const componentId in updates) {
        if (updates.hasOwnProperty(componentId)) {
            merged[componentId] = {
                ...existing[componentId],
                ...updates[componentId],
            };
        }
    }

    return merged;
};

/**
 * Safe settings update - preserves onboarding answers and other metadata
 */
export const safeSettingsUpdate = (currentSettings, updates) => {
    const merged = deepMergeSettings(currentSettings, updates);

    // Always preserve onboardingAnswers if they exist
    if (currentSettings?.onboardingAnswers) {
        merged.onboardingAnswers = currentSettings.onboardingAnswers;
    }

    // Preserve onboardingCompleted flag
    if (currentSettings?.onboardingCompleted !== undefined) {
        merged.onboardingCompleted = currentSettings.onboardingCompleted;
    }

    // Merge componentContent safely
    if (updates.componentContent || currentSettings?.componentContent) {
        merged.componentContent = mergeComponentContent(
            currentSettings?.componentContent,
            updates.componentContent
        );
    }

    return merged;
};
