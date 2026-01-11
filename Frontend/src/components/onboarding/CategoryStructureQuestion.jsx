import { Check } from 'lucide-react';

const STRUCTURE_OPTIONS = [
    {
        id: 'flat',
        label: 'Flat List',
        description: 'All categories at the same level',
        icon: '📋',
    },
    {
        id: 'hierarchical',
        label: 'Hierarchical',
        description: 'Categories with subcategories',
        icon: '🌳',
    },
];

const CategoryStructureQuestion = ({ value, onChange }) => {
    return (
        <div className="question-container">
            <h2>How do you want to organize products?</h2>
            <p className="question-help">Choose your category structure</p>
            <div className="structure-options-grid">
                {STRUCTURE_OPTIONS.map((option) => (
                    <div
                        key={option.id}
                        className={`structure-option-card ${value === option.id ? 'selected' : ''}`}
                        onClick={() => onChange(option.id)}
                    >
                        <div className="structure-icon">{option.icon}</div>
                        <div className="structure-content">
                            <h3>{option.label}</h3>
                            <p>{option.description}</p>
                        </div>
                        {value === option.id && (
                            <div className="selected-badge">
                                <Check size={20} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryStructureQuestion;

