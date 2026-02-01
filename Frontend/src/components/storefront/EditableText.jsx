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

    console.log(`[EditableText] field=${field} isEditMode=${isEditMode}`);

    const handleBlur = (e) => {
        const newValue = e.target.innerText;
        console.log(`[EditableText] Blur - field=${field} newValue=${newValue}`);
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

    const handleClick = (e) => {
        if (isEditMode) {
            e.stopPropagation();
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
            onClick={handleClick}
            data-placeholder={placeholder}
        >
            {value || placeholder}
        </Tag>
    );
};

export default EditableText;
