import React from 'react';
import {cn} from '../utils/classMerge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'blue' | 'ghost' | 'secondary' | 'danger';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({children, variant = 'primary', className = '', ...props}, ref) => {
    const baseStyles = 'px-2 py-1 rounded-lg text-xs disabled:pointer-events-none disabled:opacity-50';

    const variants = {
        primary: 'bg-primary-100 hover:bg-primary-200 text-primary-400',
        blue: 'bg-blue-100 hover:bg-blue-200 text-blue-400',
        ghost: 'hover:bg-secondary-200 text-secondary-400',
        secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-400',
        danger: 'bg-red-100 hover:bg-red-200 text-red-400',
    };

    return (
        <span ref={ref} className={cn(baseStyles, variants[variant], className)} {...props}>
            {children}
        </span>
    );
});

Badge.displayName = 'Badge';
