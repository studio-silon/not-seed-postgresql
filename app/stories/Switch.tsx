import React from 'react';
import {cn} from '../utils/classMerge';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
    label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({className, size = 'md', variant = 'primary', label, ...props}, ref) => {
    const baseStyles = 'peer relative appearance-none cursor-pointer rounded-full transition-all';
    const labelStyles = 'relative inline-flex items-center gap-2';

    const variants = {
        primary: 'bg-gray-200 checked:bg-brand-400 focus-visible:ring-brand-400',
        secondary: 'bg-gray-200 checked:bg-secondary-500 focus-visible:ring-secondary-500',
        success: 'bg-gray-200 checked:bg-green-500 focus-visible:ring-green-500',
        danger: 'bg-gray-200 checked:bg-red-500 focus-visible:ring-red-500',
    };

    const sizes = {
        sm: {
            switch: 'h-4 w-7',
            thumb: 'after:h-3 after:w-3 after:left-0.5 checked:after:translate-x-3',
            text: 'text-sm',
        },
        md: {
            switch: 'h-5 w-9',
            thumb: 'after:h-4 after:w-4 after:left-0.5 checked:after:translate-x-4',
            text: 'text-base',
        },
        lg: {
            switch: 'h-6 w-11',
            thumb: 'after:h-5 after:w-5 after:left-0.5 checked:after:translate-x-5',
            text: 'text-lg',
        },
    };

    const thumbStyles = `
      after:content-[''] 
      after:absolute 
      after:top-1/2 
      after:-translate-y-1/2
      after:rounded-full 
      after:bg-white 
      after:shadow-sm 
      after:transition-all
    `;

    const focusStyles = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

    return (
        <label className={cn(labelStyles, className)}>
            <input type="checkbox" ref={ref} className={cn(baseStyles, variants[variant], sizes[size].switch, thumbStyles, sizes[size].thumb, focusStyles)} {...props} />
            {label && <span className={sizes[size].text}>{label}</span>}
        </label>
    );
});

Switch.displayName = 'Switch';

export default Switch;
