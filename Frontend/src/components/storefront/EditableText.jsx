import React from 'react';
import './EditableText.css';

const EditableText = ({
    value,
    componentId,
    field,
    tag: Tag = 'span',
    className = '',
    placeholder = ''
}) => {
    // Check if we are in preview mode via URL parameter
    const isEditMode = new URLSearchParams(window.location.search).get('preview') === 'true';

    const handleBlur = (e) => {
        const newValue = e.target.innerText;
        // Only send update if value actually changed
        if (newValue !== (value || placeholder)) {
            window.parent.postMessage({
                type: 'CONTENT_UPDATE',
                componentId,
                field,
                value: newValue
            }, window.location.origin);
        }
    };

    // If not in preview/edit mode, just render the plain tag
    if (!isEditMode) {
        return <Tag className={className}>{value || placeholder}</Tag>;
    }

    return (
        <Tag
            className={`${className} editable-text`}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            data-placeholder={placeholder}
        >
            {value || placeholder}
        </Tag>
    );
};

export default EditableText;
