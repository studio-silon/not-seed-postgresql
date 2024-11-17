import type {Meta, StoryObj} from '@storybook/react';
import {Button} from './Button';
import {Mail, Send, LoaderCircle} from 'lucide-react';

const meta = {
    title: 'Components/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
            description: 'The visual style variant of the button',
            defaultValue: 'primary',
        },
        size: {
            control: 'radio',
            options: ['sm', 'md', 'lg'],
            description: 'The size of the button',
            defaultValue: 'md',
        },
        isLoading: {
            control: 'boolean',
            description: 'Whether the button is in a loading state',
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the button is disabled',
        },
        leftIcon: {
            control: false,
            description: 'Icon component to render on the left side of the button text',
        },
        rightIcon: {
            control: false,
            description: 'Icon component to render on the right side of the button text',
        },
        onClick: {action: 'clicked'},
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

// Base story
export const Default: Story = {
    args: {
        children: 'Button',
        variant: 'primary',
        size: 'md',
    },
};

// Variant stories
export const Primary: Story = {
    args: {
        children: 'Primary Button',
        variant: 'primary',
    },
};

export const Secondary: Story = {
    args: {
        children: 'Secondary Button',
        variant: 'secondary',
    },
};

export const Outline: Story = {
    args: {
        children: 'Outline Button',
        variant: 'outline',
    },
};

export const Ghost: Story = {
    args: {
        children: 'Ghost Button',
        variant: 'ghost',
    },
};

export const Danger: Story = {
    args: {
        children: 'Danger Button',
        variant: 'danger',
    },
};

// Size stories
export const Small: Story = {
    args: {
        children: 'Small Button',
        size: 'sm',
    },
};

export const Medium: Story = {
    args: {
        children: 'Medium Button',
        size: 'md',
    },
};

export const Large: Story = {
    args: {
        children: 'Large Button',
        size: 'lg',
    },
};

// State stories
export const Loading: Story = {
    args: {
        children: 'Loading',
        isLoading: true,
    },
};

export const Disabled: Story = {
    args: {
        children: 'Disabled',
        disabled: true,
    },
};

// Icon stories
export const WithLeftIcon: Story = {
    args: {
        children: 'Send Email',
        leftIcon: <Mail className="h-4 w-4" />,
    },
};

export const WithRightIcon: Story = {
    args: {
        children: 'Send Message',
        rightIcon: <Send className="h-4 w-4" />,
    },
};

export const WithBothIcons: Story = {
    args: {
        children: 'Processing',
        leftIcon: <LoaderCircle className="h-4 w-4" />,
        rightIcon: <Send className="h-4 w-4" />,
    },
};

// Example of multiple buttons in different states
export const ButtonGrid: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
            </div>
            <div className="flex gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
            </div>
            <div className="flex gap-4">
                <Button isLoading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button leftIcon={<Mail className="h-4 w-4" />}>With Icon</Button>
            </div>
        </div>
    ),
};
