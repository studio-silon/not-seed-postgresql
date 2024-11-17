import React, {useState} from 'react';
import {Combobox as HeadlessCombobox} from '@headlessui/react';
import {cn} from '../utils/classMerge';
import {ChevronDown, Check} from 'lucide-react';

interface ComboboxProps<T> {
    value?: T;
    onChange: (value: T) => void;
    options: T[];
    displayValue?: (item: T) => string;
    setSearchTerm?: (item: string) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'default' | 'error';
    rightIcon?: React.ReactNode;
}

export const Combobox = <T extends unknown>({
    value,
    onChange,
    options,
    displayValue = (item: T) => String(item),
    className = '',
    setSearchTerm,
    placeholder,
    disabled,
    error,
    size = 'md',
    variant = 'default',
    rightIcon,
}: ComboboxProps<T>) => {
    const [query, setQuery] = useState('');

    const filteredOptions = query === '' ? options : options.filter((option) => displayValue(option).toLowerCase().includes(query.toLowerCase()));

    const baseStyles =
        'flex w-full rounded-md outline-none focus-visible:ring-2 enabled:hover:border enabled:focus:border border-secondary-200 enabled:hover:border-secondary-300/20 bg-secondary-200/20 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

    const variants = {
        default: 'enabled:focus:border-black/10 enabled:focus:ring-black/10',
        error: 'enabled:focus:border-red-500 enabled:focus:ring-red-500/10',
    };

    const sizes = {
        sm: 'h-6 px-3 text-xs',
        md: 'h-8 px-3 text-sm',
        lg: 'h-10 px-4 text-sm',
        xl: 'h-12 px-6 text-base',
    };

    const Wrapper = ({children}: {children: React.ReactNode}) => (
        <div className="relative w-full">
            {children}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );

    const combobox = (
        <HeadlessCombobox value={value} onChange={onChange} disabled={disabled}>
            <div className="relative">
                <div className="relative flex items-center">
                    <HeadlessCombobox.Input
                        className={cn(baseStyles, variants[variant], sizes[size], 'pr-10', className)}
                        displayValue={displayValue}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            if (setSearchTerm) setSearchTerm(event.target.value);
                        }}
                        placeholder={placeholder}
                    />
                    <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDown className="h-4 w-4 text-secondary-500" aria-hidden="true" />
                    </HeadlessCombobox.Button>
                </div>
                <HeadlessCombobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {filteredOptions.length === 0 && query !== '' ? (
                        <div className="relative cursor-default select-none px-4 py-2 text-secondary-500">Nothing found.</div>
                    ) : (
                        filteredOptions.map((option, index) => (
                            <HeadlessCombobox.Option
                                key={index}
                                value={option}
                                className={({active}) => cn('relative cursor-pointer select-none py-2 pl-10 pr-4', active ? 'bg-secondary-100' : 'text-gray-900')}
                            >
                                {({selected, active}) => (
                                    <>
                                        <span className={cn('block truncate', selected ? 'font-medium' : 'font-normal')}>{displayValue(option)}</span>
                                        {selected ? (
                                            <span className={cn('absolute inset-y-0 left-0 flex items-center pl-3', active ? 'text-secondary-600' : 'text-secondary-400')}>
                                                <Check className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                        ) : null}
                                    </>
                                )}
                            </HeadlessCombobox.Option>
                        ))
                    )}
                </HeadlessCombobox.Options>
            </div>
        </HeadlessCombobox>
    );

    return error !== undefined ? <Wrapper>{combobox}</Wrapper> : combobox;
};
