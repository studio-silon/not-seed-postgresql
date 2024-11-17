import React from 'react';
import {Popover as HeadlessPopover} from '@headlessui/react';
import {cn} from '../utils/classMerge';

interface PopoverRootProps {
    children: React.ReactNode;
    className?: string;
}

export const Popover = ({children, className}: PopoverRootProps) => {
    return <HeadlessPopover className={cn('relative inline-block', className)}>{children}</HeadlessPopover>;
};

interface TriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

const Trigger = ({children, asChild}: TriggerProps) => {
    const Component = asChild ? HeadlessPopover.Button : 'button';

    return <HeadlessPopover.Button as={Component}>{children}</HeadlessPopover.Button>;
};

interface ContentProps {
    children: React.ReactNode;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
}

const Content = ({children, align = 'center', side = 'bottom', className}: ContentProps) => {
    return (
        <HeadlessPopover.Panel
            className={cn(
                'absolute z-50 min-w-[18rem] rounded-xl bg-white shadow-lg ring-1 ring-black/5 outline-none',
                'animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
                {
                    'left-0': align === 'start',
                    'right-0 translate-x-0': align === 'end',
                    'left-1/2 -translate-x-1/2': align === 'center',
                    'top-[calc(100%+4px)]': side === 'bottom',
                    'bottom-[calc(100%+4px)]': side === 'top',
                    'left-[calc(100%+4px)]': side === 'right',
                    'right-[calc(100%+4px)]': side === 'left',
                },
                className,
            )}
        >
            {children}
        </HeadlessPopover.Panel>
    );
};

interface HeaderProps {
    children: React.ReactNode;
    className?: string;
}

const Header = ({children, className}: HeaderProps) => {
    return <div className={cn('p-4 text-base font-semibold border-b', className)}>{children}</div>;
};

interface TextProps {
    children: React.ReactNode;
    className?: string;
}

const Text = ({children, className}: TextProps) => {
    return <div className={cn('p-4 text-sm text-gray-500', className)}>{children}</div>;
};

interface FooterProps {
    children: React.ReactNode;
    className?: string;
}

const Footer = ({children, className}: FooterProps) => {
    return <div className={cn('px-4 py-2 border-t flex items-center justify-end gap-2', className)}>{children}</div>;
};

interface CloseProps {
    children: React.ReactNode;
}

const Close = ({children}: CloseProps) => {
    return <HeadlessPopover.Button>{children}</HeadlessPopover.Button>;
};

interface SeparatorProps {
    className?: string;
}

const Separator = ({className}: SeparatorProps) => {
    return <div className={cn('h-px bg-gray-200', className)} />;
};

Popover.Trigger = Trigger;
Popover.Content = Content;
Popover.Header = Header;
Popover.Text = Text;
Popover.Footer = Footer;
Popover.Close = Close;
Popover.Separator = Separator;

export default Popover;
