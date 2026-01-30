import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Copy } from 'lucide-react';

const SortableComponentItem = ({ component, index, onToggleVisibility, onDuplicate }) => {
    return (
        <Draggable draggableId={component.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`visibility-toggle-item ${snapshot.isDragging ? 'dragging' : ''}`}
                    style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.9 : 1,
                    }}
                >
                    <div className="drag-handle" {...provided.dragHandleProps}>
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
            )}
        </Draggable>
    );
};

export default SortableComponentItem;
