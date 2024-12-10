import {useEffect, useState} from 'react';
import {Toast as ToastUI} from '~/stories/Toast';
import {AnimatePresence, motion} from 'framer-motion';
import {Atom, atom, useAtom, useAtomValue} from 'jotai';

export interface ToastMessage {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
}

let toastId = 0;

export const makeToastId = () => ++toastId;

export const toastsAtom = atom<ToastMessage[]>([]);

export const Toast = ({id, type, message}: ToastMessage) => {
    const [isVisible, setIsVisible] = useState(true);
    const [toasts, setToast] = useAtom(toastsAtom);

    useEffect(() => {
        if (!isVisible) {
            setToast(toasts.filter((toast) => toast.id !== id));
        }
    }, [isVisible, id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 7000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <ToastUI
            variant={type}
            isVisible={isVisible}
            onClose={() => {
                setIsVisible(false);
            }}
        >
            {message}
        </ToastUI>
    );
};

export const ToastContainer = () => {
    const toasts = useAtomValue(toastsAtom);

    return (
        <div className="fixed top-4 right-4 gap-2 flex flex-col z-50">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{opacity: 0, scale: 0.9}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.9}}
                        transition={{type: 'spring', duration: 0.3}}
                    >
                        <Toast id={toast.id} type={toast.type} message={toast.message} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
