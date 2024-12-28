import React from 'react';
import {Menu} from '@headlessui/react';
import {cn} from '../utils/classMerge';

interface DropdownRootProps {
    children: React.ReactNode;
    className?: string;
}

export const Dropdown = ({children, className}: DropdownRootProps) => {
    return (
        <Menu as="div" className={cn('relative inline-block text-left', className)}>
            {children}
        </Menu>
    );
};

interface TriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
    className?: string;
}

const Trigger = ({children, asChild, className}: TriggerProps) => {
    const Component = asChild ? Menu.Button : 'button';

    return (
        <Menu.Button as={Component} className={className}>
            {children}
        </Menu.Button>
    );
};

interface ContentProps {
    children: React.ReactNode;
    align?: 'left' | 'right';
    className?: string;
}

const Content = ({children, align = 'left', className}: ContentProps) => {
    return (
        <Menu.Items
            className={cn(
                'absolute z-10 mt-2 min-w-[8rem] bg-white origin-top-right rounded-md p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-hidden',
                {
                    'right-0': align === 'right',
                    'left-0': align === 'left',
                },
                className,
            )}
        >
            {children}
        </Menu.Items>
    );
};

interface TextProps {
    children: React.ReactNode;
    className?: string;
}

const Text = ({children, className}: TextProps) => {
    return <div className={cn('px-2 py-1.5 text-sm text-gray-500', className)}>{children}</div>;
};

interface ItemProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    variant?: 'default' | 'danger';
}

const Item = ({children, onClick, disabled, className, variant = 'default'}: ItemProps) => {
    return (
        <Menu.Item disabled={disabled}>
            {({active}) => (
                <button
                    onClick={onClick}
                    className={cn(
                        'flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors',
                        {
                            'bg-secondary-100': active,
                            'text-gray-900': variant === 'default',
                            'text-red-600 hover:bg-red-50': variant === 'danger',
                            'opacity-50 cursor-not-allowed': disabled,
                        },
                        className,
                    )}
                >
                    {children}
                </button>
            )}
        </Menu.Item>
    );
};

interface SeparatorProps {
    className?: string;
}

const Separator = ({className}: SeparatorProps) => {
    return <div className={cn('my-1 h-px bg-gray-200', className)} />;
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Text = Text;
Dropdown.Item = Item;
Dropdown.Separator = Separator;

export default Dropdown;
