import { Check } from 'lucide-react';

const PRESET_COLORS = [
    '#2563eb', // Blue
    '#7c3aed', // Purple
    '#dc2626', // Red
    '#ea580c', // Orange
    '#16a34a', // Green
    '#0891b2', // Cyan
    '#db2777', // Pink
    '#f59e0b', // Amber
    '#111827', // Dark Gray
];

const BrandColorQuestion = ({ value, onChange }) => {
    const handlePresetClick = (color) => {
        onChange(color);
    };

    const handleCustomColor = (e) => {
        onChange(e.target.value);
    };

    return (
        <div className="question-container">
            <h2>Choose your brand color</h2>
            <p className="question-help">This color will be used throughout your store</p>
            <div className="color-picker-section">
                <div className="preset-colors">
                    {PRESET_COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            className={`color-circle ${value === color ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => handlePresetClick(color)}
                            aria-label={`Select color ${color}`}
                        >
                            {value === color && <Check size={16} color="white" />}
                        </button>
                    ))}
                </div>
                <div className="custom-color-section">
                    <label className="custom-color-label">Or choose a custom color:</label>
                    <div className="custom-color-input-wrapper">
                        <input
                            type="color"
                            value={value || '#2563eb'}
                            onChange={handleCustomColor}
                            className="custom-color-input"
                        />
                        <span className="color-hex">{value || '#2563eb'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandColorQuestion;

