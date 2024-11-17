import React from 'react';
import {cn} from '../utils/classMerge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({children, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, className = '', disabled, ...props}, ref) => {
        const baseStyles =
            'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[102%]';

        const variants = {
            primary: 'bg-brand-400 text-brand-text hover:bg-brand-500 focus-visible:ring-brand-600',
            secondary: 'bg-secondary-500 text-secondary-text hover:bg-secondary-400 focus-visible:ring-secondary-600',
            outline: 'border border-secondary-300 bg-transparent hover:bg-secondary-100 focus-visible:ring-secondary-500',
            ghost: 'hover:bg-secondary/10 hover:text-secondary-900 focus-visible:ring-secondary-500',
            danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
        };

        const sizes = {
            sm: 'h-6 px-2 text-xs',
            md: 'h-8 px-3 text-sm',
            lg: 'h-10 px-4 text-sm',
            xl: 'h-12 px-4 text-base',
        };

        return (
            <button ref={ref} className={cn(baseStyles, variants[variant], sizes[size], className)} disabled={disabled || isLoading} {...props}>
                {isLoading && (
                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {rightIcon && <span className="ml-2">{rightIcon}</span>}
            </button>
        );
    },
);

Button.displayName = 'Button';
