import React, {forwardRef} from 'react';

import {cn} from '../utils/classMerge';

import {Button} from './Button';

interface MiniTabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    isActive: boolean;
}

export const MiniTab = forwardRef<HTMLButtonElement, MiniTabProps>(({className = '', isActive, ...props}, ref) => (
    <Button
        ref={ref}
        variant="ghost"
        className={cn('text-xs h-6 py-1 px-2', isActive && 'bg-secondary-100 hover:bg-secondary-200', className)}
        {...props}
    />
));

MiniTab.displayName = 'MiniTab';
