import {useDispatch, useSelector} from 'react-redux';
import {useEffect, useState} from 'react';
import {Toast as ToastUI} from '~/stories/Toast';
import {removeToast, ToastMessage} from '~/redux/toastSlice';
import {AnimatePresence, motion} from 'framer-motion';
import {RootState} from '~/store';

export const Toast = ({id, type, message}: ToastMessage) => {
    const dispatch = useDispatch();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!isVisible) {
            dispatch(removeToast(id));
        }
    }, [isVisible, id, dispatch]);

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
    const toasts = useSelector((state: RootState) => state.toasts.toasts);

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
