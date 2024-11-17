import type {Meta, StoryObj} from '@storybook/react';
import {Input} from './Input';
import {Search, Eye, Mail} from 'lucide-react';

const meta: Meta<typeof Input> = {
    title: 'Components/Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
    args: {
        placeholder: 'Enter text...',
    },
};

export const Small: Story = {
    args: {
        size: 'sm',
        placeholder: 'Small input',
    },
};

export const Large: Story = {
    args: {
        size: 'lg',
        placeholder: 'Large input',
    },
};

export const WithLeftIcon: Story = {
    args: {
        placeholder: 'Search...',
        leftIcon: <Search size={16} />,
    },
};

export const WithRightIcon: Story = {
    args: {
        placeholder: 'Enter password',
        rightIcon: <Eye size={16} />,
    },
};

export const WithBothIcons: Story = {
    args: {
        placeholder: 'Enter email',
        leftIcon: <Mail size={16} />,
        rightIcon: <Eye size={16} />,
    },
};

export const WithError: Story = {
    args: {
        placeholder: 'Enter email',
        value: 'invalid-email',
        variant: 'error',
        error: 'Please enter a valid email address',
    },
};

export const Disabled: Story = {
    args: {
        placeholder: 'Disabled input',
        disabled: true,
    },
};
