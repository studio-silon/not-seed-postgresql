'use client';

import * as React from 'react';

import {Check, ChevronsUpDown} from 'lucide-react';

import {Button} from '~/components/ui/button';
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from '~/components/ui/command';
import {Popover, PopoverContent, PopoverTrigger} from '~/components/ui/popover';

import {cn} from '~/lib/utils';

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
    size?: 'sm' | 'lg' | 'default' | 'icon';
    variant?: 'default' | 'error';
    rightIcon?: React.ReactNode;
}

export function Combobox<T extends unknown>({
    value,
    onChange,
    options,
    displayValue = (item: T) => String(item),
    className,
    setSearchTerm,
    placeholder = 'Select an option...',
    disabled,
    error,
    size = 'default',
    variant = 'default',
}: ComboboxProps<T>) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');

    const filteredOptions = query === '' ? options : options.filter((option) => displayValue(option).toLowerCase().includes(query.toLowerCase()));

    const selectedLabel = value ? displayValue(value) : placeholder;

    const buttonClassName = cn('flex w-full justify-between', variant === 'error' && 'border-red-500', className);

    const Wrapper = ({children}: {children: React.ReactNode}) => (
        <div className="relative w-full">
            {children}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );

    const combobox = (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size={size} role="combobox" aria-expanded={open} className={buttonClassName} disabled={disabled}>
                    {selectedLabel}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput
                        placeholder={`Search ${placeholder.toLowerCase()}...`}
                        onValueChange={(search) => {
                            setQuery(search);
                            setSearchTerm?.(search);
                        }}
                    />
                    <CommandList>
                        <CommandEmpty>Nothing found.</CommandEmpty>
                        <CommandGroup>
                            {filteredOptions.map((option, index) => (
                                <CommandItem
                                    key={index}
                                    value={displayValue(option)}
                                    onSelect={() => {
                                        onChange(option);
                                        setOpen(false);
                                    }}
                                >
                                    {displayValue(option)}
                                    <Check className={cn('ml-auto h-4 w-4', value === option ? 'opacity-100' : 'opacity-0')} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );

    return error !== undefined ? <Wrapper>{combobox}</Wrapper> : combobox;
}
