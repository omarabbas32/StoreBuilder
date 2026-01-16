import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy } from 'lucide-react';

const SortableComponentItem = ({ component, onToggleVisibility, onDuplicate }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: component.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
        position: 'relative'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`visibility-toggle-item ${isDragging ? 'dragging' : ''}`}
        >
            <div className="drag-handle" {...attributes} {...listeners}>
                <GripVertical size={20} />
            </div>
            <div className="toggle-info">
                <span className="toggle-name">{component.name || component.type.replace('-', ' ')}</span>
                <span className="toggle-desc">Show this section on homepage</span>
            </div>
            <div className="item-actions">
                <button
                    className="action-icon-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(component.id);
                    }}
                    title="Duplicate"
                >
                    <Copy size={16} />
                </button>
                <button
                    className={`toggle-switch ${!component.disabled ? 'active' : ''}`}
                    onClick={() => onToggleVisibility(component.id, !!component.disabled)}
                >
                    <div className="switch-knob"></div>
                </button>
            </div>
        </div>
    );
};

export default SortableComponentItem;
