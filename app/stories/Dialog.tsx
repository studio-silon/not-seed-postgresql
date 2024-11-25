import React, {Fragment} from 'react';
import {Dialog as HeadlessDialog, Transition} from '@headlessui/react';
import {cn} from '../utils/classMerge';

interface DialogRootProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export const Dialog = ({isOpen, onClose, children, className}: DialogRootProps) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <HeadlessDialog as="div" className={cn('relative z-10', className)} onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <HeadlessDialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                {children}
                            </HeadlessDialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </HeadlessDialog>
        </Transition>
    );
};

interface TitleProps {
    children: React.ReactNode;
    className?: string;
}

const Title = ({children, className}: TitleProps) => {
    return (
        <HeadlessDialog.Title as="h3" className={cn('text-lg font-medium leading-6 text-gray-900', className)}>
            {children}
        </HeadlessDialog.Title>
    );
};

interface ContentProps {
    children: React.ReactNode;
    className?: string;
}

const Content = ({children, className}: ContentProps) => {
    return <div className={cn('mt-2', className)}>{children}</div>;
};

interface ActionsProps {
    children: React.ReactNode;
    className?: string;
}

const Actions = ({children, className}: ActionsProps) => {
    return <div className={cn('flex mt-4 gap-1', className)}>{children}</div>;
};

Dialog.Title = Title;
Dialog.Content = Content;
Dialog.Actions = Actions;

export default Dialog;
