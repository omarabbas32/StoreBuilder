import { ShoppingBag, Smartphone, Coffee, Wrench, Heart, Download, Package } from 'lucide-react';
import './QuestionStyles.css';

const CATEGORIES = [
    { id: 'fashion', name: 'Fashion & Apparel', icon: ShoppingBag, description: 'Clothing, accessories, jewelry' },
    { id: 'electronics', name: 'Electronics', icon: Smartphone, description: 'Gadgets, computers, phones' },
    { id: 'food', name: 'Food & Beverage', icon: Coffee, description: 'Restaurants, cafes, food delivery' },
    { id: 'services', name: 'Services', icon: Wrench, description: 'Consulting, repairs, bookings' },
    { id: 'handmade', name: 'Handmade & Crafts', icon: Heart, description: 'Artisan goods, custom products' },
    { id: 'digital', name: 'Digital Products', icon: Download, description: 'Software, courses, downloads' },
    { id: 'general', name: 'General Store', icon: Package, description: 'Multiple product categories' },
];

const StoreCategoryQuestion = ({ value, onChange }) => {
    return (
        <div className="question-container">
            <div className="question-header">
                <h2>What type of store are you creating?</h2>
                <p className="question-description">This helps us customize your experience</p>
            </div>

            <div className="question-content">
                <div className="category-grid">
                    {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        const isSelected = value === category.id;

                        return (
                            <div
                                key={category.id}
                                className={`category-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => onChange(category.id)}
                            >
                                <div className="category-icon">
                                    <Icon size={32} />
                                </div>
                                <h3 className="category-name">{category.name}</h3>
                                <p className="category-description">{category.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StoreCategoryQuestion;
