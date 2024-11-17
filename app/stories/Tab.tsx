import React, {forwardRef} from 'react';
import {cn} from '../utils/classMerge';

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

interface TabItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    isActive?: boolean;
    className?: string;
}

type TabComponent = React.ForwardRefExoticComponent<TabsProps & React.RefAttributes<HTMLDivElement>> & {
    Item: React.ForwardRefExoticComponent<TabItemProps & React.RefAttributes<HTMLButtonElement>>;
};

const TabBase = forwardRef<HTMLDivElement, TabsProps>(({children, className, ...props}, ref) => {
    return <div ref={ref} className={cn('flex border-b', className)} {...props}>{children}</div>;
});

const TabItem = forwardRef<HTMLButtonElement, TabItemProps>(({children, isActive, className, ...props}, ref) => {
    return (
        <button
            ref={ref}
            className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                isActive ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-700',
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
});

TabBase.displayName = 'Tab';
TabItem.displayName = 'Tab.Item';

export const Tab = TabBase as TabComponent;
Tab.Item = TabItem;
