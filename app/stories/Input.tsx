import React from 'react';
import {cn} from '../utils/classMerge';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    variant?: 'default' | 'error';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({className = '', variant = 'default', size = 'md', leftIcon, rightIcon, error, disabled, ...props}, ref) => {
    const baseStyles =
        'flex w-full rounded-md outline-hidden focus-visible:ring-2 enabled:hover:border enabled:focus:border border-secondary-200 enabled:hover:border-secondary-300/20 bg-secondary-200/20 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-500 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50';

    const variants = {
        default: 'enabled:focus:border-black/10 enabled:focus:ring-black/10',
        error: 'enabled:focus:border-red-500 enabled:focus:ring-red-500/10',
    };

    const sizes = {
        sm: 'h-6 px-3 text-xs',
        md: 'h-8 px-3 text-sm',
        lg: 'h-10 px-4 text-sm',
        xl: 'h-12 px-6 text-base',
    };

    const iconSizes = {
        sm: 'top-1',
        md: 'top-2',
        lg: 'top-3',
        xl: 'top-4',
    };

    const Wrapper = ({children}: {children: React.ReactNode}) => (
        <div className="relative w-full">
            {children}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );

    const inputElement = (
        <div className="relative flex items-center">
            {leftIcon && <span className={cn('absolute left-3 flex items-center text-secondary-500', size === 'sm' && 'left-1', iconSizes[size])}>{leftIcon}</span>}
            <input
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    leftIcon && 'pl-10',
                    leftIcon && size === 'sm' && 'pl-7',
                    rightIcon && 'pr-10',
                    rightIcon && size === 'sm' && 'pr-7',
                    className,
                )}
                disabled={disabled}
                {...props}
            />
            {rightIcon && <span className={cn('absolute right-3 flex items-center text-secondary-500', size === 'sm' && 'right-1', iconSizes[size])}>{rightIcon}</span>}
        </div>
    );

    return error !== undefined ? <Wrapper>{inputElement}</Wrapper> : inputElement;
});

Input.displayName = 'Input';
