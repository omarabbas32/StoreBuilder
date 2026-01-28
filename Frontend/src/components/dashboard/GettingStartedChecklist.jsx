import { useState, useEffect } from 'react';
import { CheckCircle, Circle, X, Package, Palette, FolderOpen, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import useAuthStore from '../../store/authStore';
import './GettingStartedChecklist.css';

const GettingStartedChecklist = ({ totalProducts, totalCategories }) => {
    const navigate = useNavigate();
    const { store } = useAuthStore();
    const [isDismissed, setIsDismissed] = useState(false);
    const [completedTasks, setCompletedTasks] = useState({
        addedProduct: false,
        customizedBrand: false,
        addedCategory: false,
        visitedStore: false,
    });

    useEffect(() => {
        // Load dismissed state from localStorage
        const dismissed = localStorage.getItem('checklist_dismissed');
        if (dismissed === 'true') {
            setIsDismissed(true);
        }

        // Load completed tasks from localStorage
        const saved = localStorage.getItem('checklist_completed');
        if (saved) {
            try {
                setCompletedTasks(JSON.parse(saved));
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, []);

    useEffect(() => {
        // Auto-update checklist based on actual data
        const newCompleted = {
            addedProduct: totalProducts > 0,
            customizedBrand: completedTasks.customizedBrand, // Manual tracking
            addedCategory: totalCategories > 0,
            visitedStore: completedTasks.visitedStore, // Manual tracking
        };

        setCompletedTasks(newCompleted);
        localStorage.setItem('checklist_completed', JSON.stringify(newCompleted));
    }, [totalProducts, totalCategories]);

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('checklist_dismissed', 'true');
    };

    const markTaskComplete = (taskKey) => {
        const updated = { ...completedTasks, [taskKey]: true };
        setCompletedTasks(updated);
        localStorage.setItem('checklist_completed', JSON.stringify(updated));
    };

    const tasks = [
        {
            key: 'addedProduct',
            label: 'Create your first product',
            icon: Package,
            action: () => navigate('/dashboard/products'),
            completed: completedTasks.addedProduct,
        },
        {
            key: 'customizedBrand',
            label: 'Customize your brand',
            icon: Palette,
            action: () => {
                markTaskComplete('customizedBrand');
                navigate('/dashboard/customize');
            },
            completed: completedTasks.customizedBrand,
        },
        {
            key: 'addedCategory',
            label: 'Add a category',
            icon: FolderOpen,
            action: () => navigate('/dashboard/categories'),
            completed: completedTasks.addedCategory,
        },
        {
            key: 'visitedStore',
            label: 'Visit your live storefront',
            icon: ExternalLink,
            action: () => {
                markTaskComplete('visitedStore');
                window.open(`/${store.slug}`, '_blank');
            },
            completed: completedTasks.visitedStore,
        },
    ];

    const completedCount = tasks.filter((t) => t.completed).length;
    const progress = Math.round((completedCount / tasks.length) * 100);

    if (isDismissed) return null;

    return (
        <Card className="getting-started-checklist">
            <div className="checklist-header">
                <div>
                    <h3>🚀 Getting Started</h3>
                    <p className="text-muted">Complete these steps to launch your store</p>
                </div>
                <button className="dismiss-btn" onClick={handleDismiss}>
                    <X size={20} />
                </button>
            </div>

            <div className="progress-section">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="progress-text">{completedCount} of {tasks.length} completed</span>
            </div>

            <div className="checklist-tasks">
                {tasks.map((task) => (
                    <div
                        key={task.key}
                        className={`checklist-task ${task.completed ? 'completed' : ''}`}
                        onClick={!task.completed ? task.action : undefined}
                    >
                        <div className="task-icon">
                            {task.completed ? (
                                <CheckCircle size={20} className="check-icon" />
                            ) : (
                                <Circle size={20} className="circle-icon" />
                            )}
                        </div>
                        <div className="task-content">
                            <span className="task-label">{task.label}</span>
                            {!task.completed && <task.icon size={16} className="task-action-icon" />}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default GettingStartedChecklist;
