import React from 'react';
import {cn} from '../utils/classMerge';
import {motion, AnimatePresence} from 'framer-motion';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
    max?: number;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showValue?: boolean;
    animate?: boolean;
    label?: string;
    showAnimation?: 'slide' | 'fade' | 'bounce' | 'spring';
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({value = 0, max = 100, variant = 'primary', size = 'md', showValue = false, animate = true, label, showAnimation = 'slide', className, ...props}, ref) => {
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

        const variants = {
            primary: 'bg-brand-400',
            secondary: 'bg-secondary-500',
            outline: 'bg-secondary-300',
            danger: 'bg-red-600',
        };

        const sizes = {
            sm: 'h-1',
            md: 'h-2',
            lg: 'h-3',
            xl: 'h-4',
        };

        const containerSizes = sizes;

        const animations = {
            slide: {
                width: `${percentage}%`,
                opacity: 1,
                transition: {duration: 0.8, ease: 'easeOut'},
            },
            fade: {
                width: `${percentage}%`,
                opacity: 1,
                transition: {duration: 0.5},
            },
            bounce: {
                width: `${percentage}%`,
                opacity: 1,
                transition: {type: 'spring', stiffness: 260, damping: 20},
            },
            spring: {
                width: `${percentage}%`,
                opacity: 1,
                transition: {type: 'spring', stiffness: 100, damping: 10, mass: 1},
            },
        };

        const numberAnimation = {
            initial: {opacity: 0, y: 10},
            animate: {opacity: 1, y: 0},
            exit: {opacity: 0, y: -10},
            transition: {duration: 0.2},
        };

        return (
            <div className="w-full min-w-24 border rounded-ㅁfull">
                {(label || showValue) && (
                    <div className="flex justify-between items-center mb-2">
                        {label && (
                            <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} className="text-sm font-medium">
                                {label}
                            </motion.div>
                        )}
                        {showValue && (
                            <AnimatePresence mode="wait">
                                <motion.div key={percentage} {...numberAnimation} className="text-sm text-secondary-600">
                                    {Math.round(percentage)}%
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                )}
                <div ref={ref} className={cn('w-full bg-secondary-100 rounded-full overflow-hidden', containerSizes[size], className)} {...props}>
                    <motion.div
                        className={cn('h-full rounded-full', variants[variant], sizes[size])}
                        initial={{width: 0, opacity: 0}}
                        animate={animate ? animations[showAnimation ?? 'slide'] : {width: `${percentage}%`, opacity: 1}}
                    />
                </div>
            </div>
        );
    },
);

Progress.displayName = 'Progress';

export default Progress;
