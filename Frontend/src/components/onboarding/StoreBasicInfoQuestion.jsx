import { useState } from 'react';
import Input from '../ui/Input';
import './QuestionStyles.css';

const StoreBasicInfoQuestion = ({ value, onChange }) => {
    const [slugEdited, setSlugEdited] = useState(false);

    const handleNameChange = (e) => {
        const name = e.target.value;

        // Auto-generate slug only if user hasn't manually edited it
        if (!slugEdited) {
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            onChange({ ...value, name, slug });
        } else {
            onChange({ ...value, name });
        }
    };

    const handleSlugChange = (e) => {
        setSlugEdited(true);
        const slug = e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-');
        onChange({ ...value, slug });
    };

    return (
        <div className="question-container">
            <div className="question-header">
                <h2>Let's start with your store details</h2>
                <p className="question-description">Choose a name and URL for your online store</p>
            </div>

            <div className="question-content">
                <Input
                    label="Store Name"
                    value={value?.name || ''}
                    onChange={handleNameChange}
                    placeholder="My Awesome Store"
                    required
                    fullWidth
                    autoFocus
                />

                <Input
                    label="Store URL (slug)"
                    value={value?.slug || ''}
                    onChange={handleSlugChange}
                    placeholder="my-awesome-store"
                    required
                    fullWidth
                    helperText="This will be your store's unique web address"
                />

                {value?.slug && (
                    <div className="slug-preview">
                        <span className="slug-label">Your store will be available at:</span>
                        <div className="slug-url">
                            <span className="slug-domain">https://</span>
                            <span className="slug-value">{value.slug}</span>
                            <span className="slug-domain">.storely.app</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreBasicInfoQuestion;
