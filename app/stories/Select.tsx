import React from 'react';
import {cn} from '../utils/classMerge';
import {ChevronDown} from 'lucide-react';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    variant?: 'default' | 'error';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
    leftIcon?: React.ReactNode;
    error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({className = '', children, variant = 'default', size = 'md', leftIcon, error, disabled, ...props}, ref) => {
    const baseStyles =
        'flex w-full rounded-md outline-hidden focus-visible:ring-2 enabled:hover:border enabled:focus:border border-secondary-200 enabled:hover:border-secondary-300/20 bg-secondary-200/20 transition-colors placeholder:text-secondary-500 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 appearance-none';

    const variants = {
        default: 'enabled:focus:border-black/10 enabled:focus:ring-black/10',
        error: 'enabled:focus:border-red-500 enabled:focus:ring-red-500/10',
    };

    const sizes = {
        sm: 'h-6 pl-3 pr-8 text-xs',
        md: 'h-8 pl-3 pr-8 text-sm',
        lg: 'h-10 pl-4 pr-10 text-sm',
        xl: 'h-12 pl-6 pr-12 text-base',
    };

    const iconSizes = {
        sm: 'top-1',
        md: 'top-2',
        lg: 'top-3',
        xl: 'top-4',
    };

    const chevronSizes = {
        sm: 'h-3 w-3 right-1',
        md: 'h-4 w-4 right-2',
        lg: 'h-4 w-4 right-3',
        xl: 'h-5 w-5 right-4',
    };

    const Wrapper = ({children}: {children: React.ReactNode}) => (
        <div className="relative w-full">
            {children}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );

    const selectElement = (
        <div className="relative flex items-center">
            {leftIcon && <span className={cn('absolute left-3 flex items-center text-secondary-500', size === 'sm' && 'left-1', iconSizes[size])}>{leftIcon}</span>}
            <select
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], leftIcon && 'pl-10', leftIcon && size === 'sm' && 'pl-7', className)}
                disabled={disabled}
                {...props}
            >
                {children}
            </select>
            <ChevronDown className={cn('absolute text-secondary-500 pointer-events-none', chevronSizes[size])} />
        </div>
    );

    return error !== undefined ? <Wrapper>{selectElement}</Wrapper> : selectElement;
});

Select.displayName = 'Select';
