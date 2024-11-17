import type {Meta, StoryObj} from '@storybook/react';
import {Textarea} from './Textarea';
import {Search, Eye, Mail} from 'lucide-react';

const meta: Meta<typeof Textarea> = {
    title: 'Components/Textarea',
    component: Textarea,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
    args: {
        placeholder: 'Enter text...',
    },
};

export const Small: Story = {
    args: {
        size: 'sm',
        placeholder: 'Small textarea',
    },
};

export const Large: Story = {
    args: {
        size: 'lg',
        placeholder: 'Large textarea',
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
        placeholder: 'Disabled textarea',
        disabled: true,
    },
};
