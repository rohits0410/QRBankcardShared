import React, { forwardRef } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, fullWidth = false, className = '', ...props }, ref) => {
    const inputClass = [
      'input-wrapper',
      fullWidth ? 'input-full' : '',
      error ? 'input-error' : '',
      icon ? 'input-with-icon' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={inputClass}>
        {label && <label className="input-label">{label}</label>}
        <div className="input-container">
          {icon && <span className="input-icon">{icon}</span>}
          <input ref={ref} className="input-field" {...props} />
        </div>
        {error && <span className="input-error-text">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;