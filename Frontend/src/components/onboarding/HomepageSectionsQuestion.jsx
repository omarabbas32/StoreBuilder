import { Check } from 'lucide-react';

const SECTION_OPTIONS = [
    {
        id: 'hero',
        label: 'Large Hero Banner',
        description: 'Eye-catching banner at the top with image',
        icon: '🎯',
    },
    {
        id: 'product-grid',
        label: 'Product Grid',
        description: 'Showcase your products in a grid layout',
        icon: '🛍️',
    },
    {
        id: 'highlight',
        label: 'Highlight Section',
        description: 'Special offers or announcements',
        icon: '⭐',
    },
    {
        id: 'attributes',
        label: 'Trust Badges',
        description: 'Shipping, returns, security badges',
        icon: '✅',
    },
];

const HomepageSectionsQuestion = ({ value = [], onChange }) => {
    const handleToggle = (sectionId) => {
        if (value.includes(sectionId)) {
            onChange(value.filter((id) => id !== sectionId));
        } else {
            onChange([...value, sectionId]);
        }
    };

    return (
        <div className="question-container">
            <h2>What would you like on your homepage?</h2>
            <p className="question-help">Select all sections you want to include</p>
            <div className="sections-grid">
                {SECTION_OPTIONS.map((section) => {
                    const isSelected = value.includes(section.id);
                    return (
                        <div
                            key={section.id}
                            className={`section-option-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleToggle(section.id)}
                        >
                            <div className="section-icon">{section.icon}</div>
                            <div className="section-content">
                                <h3>{section.label}</h3>
                                <p>{section.description}</p>
                            </div>
                            <div className={`section-checkbox ${isSelected ? 'checked' : ''}`}>
                                {isSelected && <Check size={16} />}
                            </div>
                        </div>
                    );
                })}
            </div>
            {value.length === 0 && (
                <p className="warning-text">Please select at least one section</p>
            )}
        </div>
    );
};

export default HomepageSectionsQuestion;

