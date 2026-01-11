import Input from '../ui/Input';

const StoreNameQuestion = ({ value, onChange }) => {
    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        onChange({ name, slug });
    };

    return (
        <div className="question-container">
            <h2>What's your store name?</h2>
            <p className="question-help">This will appear as your store's title</p>
            <Input
                label="Store Name"
                value={value?.name || ''}
                onChange={handleNameChange}
                placeholder="My Awesome Store"
                required
                fullWidth
                autoFocus
            />
            {value?.slug && (
                <div className="slug-preview">
                    <span className="slug-label">Your store URL:</span>
                    <span className="slug-value">{value.slug}.storely.com</span>
                </div>
            )}
        </div>
    );
};

export default StoreNameQuestion;

