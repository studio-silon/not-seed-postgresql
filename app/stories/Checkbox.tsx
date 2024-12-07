import React from 'react';
import {cn} from '../utils/classMerge';
import {Check} from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
    label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({className, size = 'md', variant = 'primary', label, ...props}, ref) => {
    const baseStyles = 'peer appearance-none cursor-pointer rounded transition-all';
    const labelStyles = 'relative inline-flex items-center gap-2';

    const variants = {
        primary: 'text-brand-400 checked:bg-brand-400 focus-visible:ring-brand-400',
        secondary: 'text-secondary-500 checked:bg-secondary-500 focus-visible:ring-secondary-500',
        success: 'text-green-500 checked:bg-green-500 focus-visible:ring-green-500',
        danger: 'text-red-500 checked:bg-red-500 focus-visible:ring-red-500',
    };

    const iconVariants = {
        primary: 'text-brand-text',
        secondary: 'text-secondary-text',
        success: 'text-white',
        danger: 'text-white',
    };

    const sizes = {
        sm: {
            checkbox: 'h-4 w-4',
            text: 'text-sm',
            icon: 'w-3 h-3',
        },
        md: {
            checkbox: 'h-5 w-5',
            text: 'text-base',
            icon: 'w-4 h-4',
        },
        lg: {
            checkbox: 'h-6 w-6',
            text: 'text-lg',
            icon: 'w-5 h-5',
        },
    };

    const focusStyles = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

    const checkboxStyles = cn(
        `
            border 
            border-gray-300 
            bg-white 
            checked:border-transparent 
            checked:text-white 
        `,
        focusStyles,
    );

    const iconStyles = cn(
        `
            absolute 
            top-1/2 
            left-1/2 
            -translate-x-1/2 
            -translate-y-1/2 
            hidden 
            peer-checked:block 
            stroke-current 
            stroke-2
        `,
        iconVariants[variant],
    );

    return (
        <label className={cn(labelStyles, className)}>
            <div className="relative flex">
                <input type="checkbox" ref={ref} className={cn(baseStyles, variants[variant], sizes[size].checkbox, checkboxStyles)} {...props} />
                <Check className={cn(iconStyles, sizes[size].icon)} strokeWidth={3} />
            </div>
            {label && <span className={sizes[size].text}>{label}</span>}
        </label>
    );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
