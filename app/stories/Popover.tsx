import React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import {cn} from '../utils/classMerge';

interface PopoverRootProps {
    children: React.ReactNode;
    className?: string;
}

export const Popover = ({children}: PopoverRootProps) => {
    return <PopoverPrimitive.Root modal={false}>{children}</PopoverPrimitive.Root>;
};

const Trigger = PopoverPrimitive.Trigger;

const Content = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>>(
    ({className, align = 'center', sideOffset = 4, ...props}, ref) => (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                ref={ref}
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    'z-50 w-fit border border-black/5 text-background-text rounded-xl bg-background shadow-lg outline-hidden',
                    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                    className,
                )}
                {...props}
            />
        </PopoverPrimitive.Portal>
    ),
);

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
    return <PopoverPrimitive.Close>{children}</PopoverPrimitive.Close>;
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
