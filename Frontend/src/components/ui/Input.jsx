import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({
    label,
    type = 'text',
    error,
    helperText,
    required = false,
    fullWidth = false,
    ...props
}, ref) => {
    const inputClasses = [
        'input',
        error && 'input-error',
        fullWidth && 'input-full',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={`input-wrapper ${fullWidth ? 'input-wrapper-full' : ''}`}>
            {label && (
                <label className="input-label">
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}
            <input
                ref={ref}
                type={type}
                className={inputClasses}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `input-error-${label}` : undefined}
                {...props}
            />
            {error && (
                <span id={`input-error-${label}`} className="input-error-text" role="alert">
                    {error}
                </span>
            )}
            {helperText && !error && (
                <span id="input-helper" className="input-helper-text">
                    {helperText}
                </span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
