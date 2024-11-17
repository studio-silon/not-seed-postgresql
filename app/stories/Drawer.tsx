import React from 'react';
import {Drawer as Vaul} from 'vaul';
import {cn} from '../utils/classMerge';

interface DrawerRootProps {
    children: React.ReactNode;
    shouldScaleBackground?: boolean;
    onOpenChange?: (open: boolean) => void;
    open?: boolean;
    modal?: boolean;
    className?: string;
}

export const Drawer = ({children, shouldScaleBackground = true, onOpenChange, open, modal = true, className}: DrawerRootProps) => {
    return (
        <Vaul.Root shouldScaleBackground={shouldScaleBackground} onOpenChange={onOpenChange} open={open} modal={modal} className={cn('relative', className)}>
            {children}
        </Vaul.Root>
    );
};

interface TriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
    className?: string;
}

const Trigger = ({children, asChild, className}: TriggerProps) => {
    console.log(1234);
    return (
        <Vaul.Trigger
            asChild={asChild}
            className={cn(
                'inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400 focus-visible:ring-offset-2',
                className,
            )}
        >
            {children}
        </Vaul.Trigger>
    );
};

interface ContentProps {
    children: React.ReactNode;
    className?: string;
    snapPoints?: number[];
    activeSnapPoint?: number;
    setActiveSnapPoint?: (snapPoint: number) => void;
}

const Content = ({children, snapPoints, activeSnapPoint, setActiveSnapPoint, className}: ContentProps) => {
    return (
        <Vaul.Portal>
            <Vaul.Overlay className="fixed inset-0 bg-black/40" />
            <Vaul.Content
                className={cn('fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-[96%] flex-col rounded-t-lg bg-white', 'duration-300 ease-in-out', className)}
                snapPoints={snapPoints}
                activeSnapPoint={activeSnapPoint}
                onSnapPointChange={setActiveSnapPoint}
            >
                <div className="mx-auto my-3 h-1.5 w-12 rounded-full bg-gray-300" />
                {children}
            </Vaul.Content>
        </Vaul.Portal>
    );
};

interface HeaderProps {
    children: React.ReactNode;
    className?: string;
}

const Header = ({children, className}: HeaderProps) => {
    return (
        <div className={cn('px-6 py-4 border-b border-gray-200', className)}>
            <div className="text-lg font-semibold">{children}</div>
        </div>
    );
};

interface DescriptionProps {
    children: React.ReactNode;
    className?: string;
}

const Description = ({children, className}: DescriptionProps) => {
    return <div className={cn('px-6 py-4 text-sm text-gray-500', className)}>{children}</div>;
};

interface BodyProps {
    children: React.ReactNode;
    className?: string;
}

const Body = ({children, className}: BodyProps) => {
    return <div className={cn('flex-1 overflow-y-auto px-6 py-4', className)}>{children}</div>;
};

interface FooterProps {
    children: React.ReactNode;
    className?: string;
}

const Footer = ({children, className}: FooterProps) => {
    return (
        <div className={cn('border-t border-gray-200 px-6 py-4', className)}>
            <div className="flex items-center justify-end space-x-2">{children}</div>
        </div>
    );
};

interface CloseProps {
    children: React.ReactNode;
    className?: string;
}

const Close = ({children, className}: CloseProps) => {
    return <Vaul.Close className={className}>{children}</Vaul.Close>;
};

Drawer.Trigger = Trigger;
Drawer.Content = Content;
Drawer.Header = Header;
Drawer.Description = Description;
Drawer.Body = Body;
Drawer.Footer = Footer;
Drawer.Close = Close;

export default Drawer;
