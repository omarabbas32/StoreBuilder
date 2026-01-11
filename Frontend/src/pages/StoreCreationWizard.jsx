import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import StoreBasicInfoQuestion from '../components/onboarding/StoreBasicInfoQuestion';
import StoreCategoryQuestion from '../components/onboarding/StoreCategoryQuestion';
import storeService from '../services/storeService';
import useAuthStore from '../store/authStore';
import './StoreCreationWizard.css';

const TOTAL_STEPS = 2;

const StoreCreationWizard = () => {
    const navigate = useNavigate();
    const { setStore } = useAuthStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({
        storeInfo: { name: '', slug: '' },
        category: '',
    });

    const updateAnswer = (field, value) => {
        setAnswers(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return answers.storeInfo.name && answers.storeInfo.slug;
            case 2:
                return answers.category;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (canProceed() && currentStep < TOTAL_STEPS) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };



    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const storeData = {
                name: answers.storeInfo.name,
                slug: answers.storeInfo.slug,
                description: `A ${answers.category} store`,
                settings: {
                    category: answers.category,
                    onboardingCompleted: false,
                    primaryColor: '#2563eb',
                    logo_url: '',
                    components: [
                        { id: 'navbar-1', type: 'navbar', name: 'Navigation Bar' },
                        { id: 'hero-1', type: 'hero', name: 'Hero Section' },
                        { id: 'product-grid-1', type: 'product-grid', name: 'Product Grid' },
                        { id: 'footer-1', type: 'footer', name: 'Footer' }
                    ],
                    componentContent: {
                        'hero-1': {
                            title: `Welcome to ${answers.storeInfo.name}`,
                            subtitle: 'Discover amazing products',
                            ctaText: 'Shop Now',
                            layout: 'centered'
                        },
                        'product-grid-1': {
                            selectedProductIds: [],
                            title: 'Featured Collection',
                            subtitle: 'Hand-picked selections just for you'
                        }
                    }
                },
            };

            const result = await storeService.createStore(storeData);

            if (result.success) {
                const newStore = result.data;
                setStore(newStore);
                // Redirect to full onboarding wizard
                navigate(`/onboarding/${newStore.id}`);
            } else {
                // Handle specific errors like duplicate slug
                if (result.error?.includes('duplicate key value violates unique constraint') || result.error?.includes('already exists')) {
                    setError('This store URL (slug) is already taken. Please try a different one.');
                } else {
                    setError(result.error || 'Failed to create store');
                }
                setLoading(false);
            }
        } catch (err) {
            console.error('Error creating store:', err);
            setError('Failed to create store. Please try again.');
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <StoreBasicInfoQuestion
                        value={answers.storeInfo}
                        onChange={(value) => updateAnswer('storeInfo', value)}
                    />
                );
            case 2:
                return (
                    <StoreCategoryQuestion
                        value={answers.category}
                        onChange={(value) => updateAnswer('category', value)}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="store-creation-wizard">
            <div className="wizard-container">
                <div className="wizard-header">
                    <h1>Create Your Store</h1>
                    <div className="wizard-progress">
                        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                            <div
                                key={i}
                                className={`progress-step ${i + 1 <= currentStep ? 'active' : ''} ${i + 1 < currentStep ? 'completed' : ''}`}
                            >
                                {i + 1 < currentStep ? (
                                    <Check size={16} />
                                ) : (
                                    <span>{i + 1}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="wizard-step-label">Step {currentStep} of {TOTAL_STEPS}</p>
                </div>

                <div className="wizard-content">
                    {renderStep()}
                    {error && <p className="wizard-error-message">{error}</p>}
                </div>

                <div className="wizard-footer">
                    <Button
                        variant="secondary"
                        onClick={handlePrevious}
                        disabled={currentStep === 1 || loading}
                    >
                        <ChevronLeft size={20} />
                        Previous
                    </Button>

                    <div className="footer-actions">
                        {currentStep < TOTAL_STEPS ? (
                            <Button
                                onClick={handleNext}
                                disabled={!canProceed() || loading}
                            >
                                Next
                                <ChevronRight size={20} />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Creating Store...
                                    </>
                                ) : (
                                    'Create Store'
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreCreationWizard;
