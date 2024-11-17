import React, {forwardRef} from 'react';
import {Button} from './Button';
import {cn} from '../utils/classMerge';

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    isActive: boolean;
    variant?: 'ghost' | 'danger';
    children: React.ReactNode;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(({className = '', variant = 'ghost', isActive, children, ...props}, ref) => (
    <Button
        ref={ref}
        variant={variant}
        size="sm"
        className={cn(
            'size-8 p-0',
            isActive && variant === 'ghost' && 'bg-secondary-100 hover:bg-secondary-200',
            isActive && variant === 'danger' && 'bg-red-500 hover:bg-red-400',
            className,
        )}
        {...props}
    >
        {children}
    </Button>
));

Toggle.displayName = 'Toggle';
