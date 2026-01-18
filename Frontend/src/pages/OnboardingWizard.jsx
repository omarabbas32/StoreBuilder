import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import useAuthStore from '../store/authStore';
import onboardingService from '../services/onboardingService';
import storeService from '../services/storeService';
import StoreNameQuestion from '../components/onboarding/StoreNameQuestion';
import LogoUploadQuestion from '../components/onboarding/LogoUploadQuestion';
import StylePreferenceQuestion from '../components/onboarding/StylePreferenceQuestion';
import BrandColorQuestion from '../components/onboarding/BrandColorQuestion';
import HomepageSectionsQuestion from '../components/onboarding/HomepageSectionsQuestion';
import ProductDisplayQuestion from '../components/onboarding/ProductDisplayQuestion';
import CategoryStructureQuestion from '../components/onboarding/CategoryStructureQuestion';
import './OnboardingWizard.css';

const TOTAL_STEPS = 7;

const OnboardingWizard = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const { store, setStore } = useAuthStore();
    const { success, error: showError } = useToast();

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState({
        name: '',
        slug: '',
        logo_url: '',
        style_preference: 'modern-minimal',
        brandColor: '#2563eb',
        enabledSections: ['hero', 'product-grid'],
        productDisplayStyle: 'grid-4',
        categoryStructure: 'flat',
    });

    useEffect(() => {
        loadStoreData();
    }, [storeId]);

    useEffect(() => {
        if (store?.settings?.onboardingCompleted) {
            navigate('/dashboard', { replace: true });
        }
    }, [store?.settings?.onboardingCompleted, navigate]);

    useEffect(() => {
        // Persist answers to localStorage
        localStorage.setItem('onboarding_answers', JSON.stringify(answers));
    }, [answers]);

    useEffect(() => {
        // Load answers from localStorage if available
        const saved = localStorage.getItem('onboarding_answers');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setAnswers((prev) => ({ ...prev, ...parsed }));
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, []);

    const loadStoreData = async () => {
        setLoading(true);
        if (storeId) {
            const result = await storeService.getStoreById(storeId);
            if (result.success && result.data) {
                const storeData = result.data;
                setAnswers((prev) => ({
                    ...prev,
                    name: storeData.name || prev.name,
                    slug: storeData.slug || prev.slug,
                }));
                setStore(storeData);
            }
        } else if (store) {
            setAnswers((prev) => ({
                ...prev,
                name: store.name || prev.name,
                slug: store.slug || prev.slug,
            }));
        }
        setLoading(false);
    };

    const updateAnswer = (field, value) => {
        if (field === 'name' || field === 'slug') {
            setAnswers((prev) => ({
                ...prev,
                ...value,
            }));
        } else {
            setAnswers((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return answers.name && answers.slug;
            case 1:
                return true; // Logo is optional
            case 2:
                return answers.style_preference;
            case 3:
                return answers.brandColor;
            case 4:
                return answers.enabledSections && answers.enabledSections.length > 0;
            case 5:
                return answers.productDisplayStyle;
            case 6:
                return answers.categoryStructure;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (canProceed() && currentStep < TOTAL_STEPS - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!canProceed()) {
            showError('Please complete all required fields');
            return;
        }

        setSubmitting(true);

        // Prepare answers for submission
        const submissionAnswers = {
            name: answers.name,
            slug: answers.slug,
            logo_url: answers.logo_url,
            style_preference: answers.style_preference,
            brandColor: answers.brandColor,
            enabledSections: answers.enabledSections,
            productDisplayStyle: answers.productDisplayStyle,
            categoryStructure: answers.categoryStructure,
        };

        const targetStoreId = storeId || store?.id;
        if (!targetStoreId) {
            showError('Store ID is required. Please create a store first.');
            setSubmitting(false);
            navigate('/dashboard');
            return;
        }

        const result = await onboardingService.submitOnboardingAnswers(
            targetStoreId,
            submissionAnswers
        );

        if (result.success) {
            // Clear saved answers
            localStorage.removeItem('onboarding_answers');
            setStore(result.data);
            success('Store setup completed!');
            navigate('/dashboard');
        } else {
            showError(result.error || 'Failed to complete setup');
        }

        setSubmitting(false);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <StoreNameQuestion
                        value={{ name: answers.name, slug: answers.slug }}
                        onChange={(value) => updateAnswer('name', value)}
                    />
                );
            case 1:
                return (
                    <LogoUploadQuestion
                        value={answers.logo_url}
                        onChange={(value) => updateAnswer('logo_url', value)}
                    />
                );
            case 2:
                return (
                    <StylePreferenceQuestion
                        value={answers.style_preference}
                        onChange={(value) => updateAnswer('style_preference', value)}
                    />
                );
            case 3:
                return (
                    <BrandColorQuestion
                        value={answers.brandColor}
                        onChange={(value) => updateAnswer('brandColor', value)}
                    />
                );
            case 4:
                return (
                    <HomepageSectionsQuestion
                        value={answers.enabledSections}
                        onChange={(value) => updateAnswer('enabledSections', value)}
                    />
                );
            case 5:
                return (
                    <ProductDisplayQuestion
                        value={answers.productDisplayStyle}
                        onChange={(value) => updateAnswer('productDisplayStyle', value)}
                    />
                );
            case 6:
                return (
                    <CategoryStructureQuestion
                        value={answers.categoryStructure}
                        onChange={(value) => updateAnswer('categoryStructure', value)}
                    />
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="onboarding-wizard loading">
                <Loader2 className="spinning" size={48} />
            </div>
        );
    }

    const stepLabels = [
        'Store Name',
        'Logo',
        'Style',
        'Brand Color',
        'Homepage',
        'Product Display',
        'Categories',
    ];

    return (
        <div className="onboarding-wizard">
            <div className="wizard-container">
                <div className="wizard-header">
                    <h1>Set up your store</h1>
                    <p className="wizard-subtitle">Let's customize your store in just a few steps</p>
                </div>

                <div className="wizard-progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
                        />
                    </div>
                    <div className="progress-text">
                        Step {currentStep + 1} of {TOTAL_STEPS}
                    </div>
                </div>

                <Card className="wizard-content">
                    {renderStep()}
                </Card>

                <div className="wizard-navigation">
                    <Button
                        variant="secondary"
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                    >
                        <ChevronLeft size={20} />
                        Previous
                    </Button>

                    {currentStep < TOTAL_STEPS - 1 ? (
                        <Button
                            onClick={handleNext}
                            disabled={!canProceed()}
                        >
                            Next
                            <ChevronRight size={20} />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={!canProceed() || submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="spinning" size={20} />
                                    Completing...
                                </>
                            ) : (
                                'Complete Setup'
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;

