import { Check } from 'lucide-react';

const STYLE_OPTIONS = [
    {
        id: 'modern-minimal',
        label: 'Modern & Minimal',
        description: 'Clean lines and simple design',
        color: '#6366f1',
    },
    {
        id: 'classic-elegant',
        label: 'Classic & Elegant',
        description: 'Timeless and sophisticated',
        color: '#8b5cf6',
    },
    {
        id: 'bold-playful',
        label: 'Bold & Playful',
        description: 'Vibrant and energetic',
        color: '#ec4899',
    },
    {
        id: 'professional-corporate',
        label: 'Professional & Corporate',
        description: 'Professional and trustworthy',
        color: '#3b82f6',
    },
];

const StylePreferenceQuestion = ({ value, onChange }) => {
    return (
        <div className="question-container">
            <h2>What best describes your store?</h2>
            <p className="question-help">Choose the style that matches your brand</p>
            <div className="style-options-grid">
                {STYLE_OPTIONS.map((style) => (
                    <div
                        key={style.id}
                        className={`style-option-card ${value === style.id ? 'selected' : ''}`}
                        onClick={() => onChange(style.id)}
                    >
                        <div className="style-color-indicator" style={{ backgroundColor: style.color }} />
                        <div className="style-content">
                            <h3>{style.label}</h3>
                            <p>{style.description}</p>
                        </div>
                        {value === style.id && (
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

export default StylePreferenceQuestion;

