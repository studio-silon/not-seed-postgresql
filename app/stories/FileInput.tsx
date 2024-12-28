import React, {useRef, useState} from 'react';
import {cn} from '../utils/classMerge';
import {Upload, X} from 'lucide-react';

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
    variant?: 'default' | 'error';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    error?: string;
    accept?: string;
    maxSize?: number;
    onFileSelect?: (file: File | null) => void;
}

export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
    ({className = '', variant = 'default', size = 'md', error, accept, maxSize, onFileSelect, disabled, ...props}, ref) => {
        const [selectedFile, setSelectedFile] = useState<File | null>(null);
        const [isDragging, setIsDragging] = useState(false);
        const inputRef = useRef<HTMLInputElement | undefined>();

        const baseStyles =
            'flex w-full rounded-md outline-none focus-visible:ring-2 enabled:hover:border enabled:focus:border border-secondary-200 enabled:hover:border-secondary-300/20 bg-secondary-200/20 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

        const variants = {
            default: 'enabled:focus:border-black/10 enabled:focus:ring-black/10',
            error: 'enabled:focus:border-red-500 enabled:focus:ring-red-500/10',
        };

        const sizes = {
            sm: 'min-h-16 p-2 text-xs',
            md: 'min-h-20 p-3 text-sm',
            lg: 'min-h-24 p-4 text-sm',
            xl: 'min-h-32 p-6 text-base',
        };

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(true);
        };

        const handleDragLeave = () => {
            setIsDragging(false);
        };

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            handleFileSelection(file);
        };

        const handleFileSelection = (file: File | null) => {
            if (!file) return;

            if (maxSize && file.size > maxSize) {
                setSelectedFile(null);
                if (onFileSelect) onFileSelect(null);
                const errorMessage = `File size exceeds ${(maxSize / (1024 * 1024)).toFixed(2)}MB limit`;
                if (error) error = errorMessage;
                return;
            }

            setSelectedFile(file);
            if (onFileSelect) onFileSelect(file);
        };

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] || null;
            handleFileSelection(file);
        };

        const clearFile = () => {
            setSelectedFile(null);
            if (onFileSelect) onFileSelect(null);
            if (inputRef.current) inputRef.current.value = '';
        };

        const Wrapper = ({children}: {children: React.ReactNode}) => (
            <div className="relative w-full">
                {children}
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        );

        const fileInputElement = (
            <div
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    'relative flex flex-col items-center justify-center cursor-pointer',
                    isDragging && 'border-black/30 bg-secondary/30',
                    className,
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
            >
                <input
                    ref={(node) => {
                        if (typeof ref === 'function') {
                            ref(node);
                        } else if (ref) {
                            ref.current = node;
                        }
                        inputRef.current = node ?? undefined;
                    }}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={disabled}
                    {...props}
                />

                {selectedFile ? (
                    <div className="flex items-center gap-2 w-full">
                        <span className="truncate flex-1">{selectedFile.name}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                clearFile();
                            }}
                            className="p-1 hover:bg-secondary/20 rounded-full"
                            disabled={disabled}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <>
                        <Upload className="w-6 h-6 mb-2 text-secondary/50" />
                        <div className="text-center">
                            <p className="font-medium">Click to upload or drag and drop</p>
                            <p className="text-sm text-muted-foreground">{accept ? `Supported formats: ${accept}` : 'Any file format'}</p>
                            {maxSize && <p className="text-sm text-muted-foreground">Max size: {(maxSize / (1024 * 1024)).toFixed(2)}MB</p>}
                        </div>
                    </>
                )}
            </div>
        );

        return error !== undefined ? <Wrapper>{fileInputElement}</Wrapper> : fileInputElement;
    },
);

FileInput.displayName = 'FileInput';

export default FileInput;
