import { Check } from 'lucide-react';

const DISPLAY_OPTIONS = [
    {
        id: 'grid-4',
        label: 'Grid (4 columns)',
        description: 'Show more products at once',
        preview: '⬛ ⬛ ⬛ ⬛',
    },
    {
        id: 'grid-3',
        label: 'Grid (3 columns)',
        description: 'Balanced product display',
        preview: '⬛ ⬛ ⬛',
    },
    {
        id: 'list',
        label: 'List View',
        description: 'Detailed product information',
        preview: '⬛\n⬛\n⬛',
    },
    {
        id: 'minimal',
        label: 'Minimal Cards',
        description: 'Simple and clean design',
        preview: '⬛ ⬛ ⬛',
    },
];

const ProductDisplayQuestion = ({ value, onChange }) => {
    return (
        <div className="question-container">
            <h2>How should products be displayed?</h2>
            <p className="question-help">Choose your preferred product layout</p>
            <div className="display-options-grid">
                {DISPLAY_OPTIONS.map((option) => (
                    <div
                        key={option.id}
                        className={`display-option-card ${value === option.id ? 'selected' : ''}`}
                        onClick={() => onChange(option.id)}
                    >
                        <div className="display-preview">{option.preview}</div>
                        <div className="display-content">
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

export default ProductDisplayQuestion;

