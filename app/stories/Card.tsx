import React, {ReactNode, HTMLAttributes} from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children: ReactNode;
    hover?: boolean;
}

export const Card: React.FC<CardProps> & {
    Header: typeof CardHeader;
    Title: typeof CardTitle;
    Description: typeof CardDescription;
    Content: typeof CardContent;
    Footer: typeof CardFooter;
} = ({className = '', children, hover = false, ...props}) => {
    return (
        <div
            className={`
                rounded-lg border border-secondary-300/20 
                bg-white/5 backdrop-blur 
                ${hover ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1' : ''}
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
};

interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children: ReactNode;
}

const CardHeader: React.FC<CardSectionProps> = ({className = '', children, ...props}) => {
    return (
        <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
            {children}
        </div>
    );
};

const CardTitle: React.FC<CardSectionProps> = ({className = '', children, ...props}) => {
    return (
        <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
            {children}
        </h3>
    );
};

const CardDescription: React.FC<CardSectionProps> = ({className = '', children, ...props}) => {
    return (
        <p className={`text-sm text-secondary-600 ${className}`} {...props}>
            {children}
        </p>
    );
};

const CardContent: React.FC<CardSectionProps> = ({className = '', children, ...props}) => {
    return (
        <div className={`p-6 pt-0 ${className}`} {...props}>
            {children}
        </div>
    );
};

const CardFooter: React.FC<CardSectionProps> = ({className = '', children, ...props}) => {
    return (
        <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>
            {children}
        </div>
    );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
