import React, {forwardRef} from 'react';
import {motion} from 'framer-motion';
import {X, CheckCircle, AlertCircle, Info, AlertTriangle} from 'lucide-react';
import {cn} from '../utils/classMerge';
import {Button} from './Button';

const variants = {
    success: {
        icon: CheckCircle,
        className: 'bg-green-500/20 text-green-600',
    },
    error: {
        icon: AlertCircle,
        className: 'bg-red-500/20 text-red-600',
    },
    warning: {
        icon: AlertTriangle,
        className: 'bg-yellow-500/20 text-yellow-600',
    },
    info: {
        icon: Info,
        className: 'bg-blue-500/20 text-blue-600',
    },
};

export interface ToastProps {
    variant?: keyof typeof variants;
    onClose?: () => void;
    children: React.ReactNode;
    className?: string;
    isVisible?: boolean;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(({variant = 'info', children, onClose, className = '', isVisible = true}, ref) => {
    const IconComponent = variants[variant].icon;

    return (
        <motion.div
            ref={ref}
            className={cn(
                'bg-white/80 w-72 transform transition-all duration-300 ease-in-out hover:scale-[102%]',
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
                className,
            )}
            initial={{scale: 0.9, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            exit={{scale: 0.9, opacity: 0}}
            transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
            }}
        >
            <div className="flex items-center gap-3 rounded-lg border p-4 shadow-lg transition-all hover:scale-[102%]">
                <motion.div
                    className={cn('flex items-center justify-center w-8 h-8 rounded-lg shadow-md', variants[variant].className)}
                    animate={{
                        rotate: [-5, 5, -8, 8, 0, 0, 0, 0],
                    }}
                    transition={{
                        duration: 2,
                        ease: 'easeInOut',
                        repeat: Infinity,
                    }}
                >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                </motion.div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm opacity-90">{children}</p>
                </div>

                <Button variant="ghost" onClick={onClose} className="p-0 w-7 h-7">
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
});

Toast.displayName = 'Toast';
