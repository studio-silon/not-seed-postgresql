import type {Meta, StoryObj} from '@storybook/react';
import {Switch} from './Switch';
import {BellRing, Moon, Sun, Wifi} from 'lucide-react';

const meta = {
    title: 'Components/Switch',
    component: Switch,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'success', 'danger'],
            description: 'The visual style variant of the switch',
            defaultValue: 'primary',
        },
        size: {
            control: 'radio',
            options: ['sm', 'md', 'lg'],
            description: 'The size of the switch',
            defaultValue: 'md',
        },
        label: {
            control: 'text',
            description: 'Label text to display next to the switch',
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the switch is disabled',
        },
        checked: {
            control: 'boolean',
            description: 'Whether the switch is checked',
        },
        onChange: {action: 'changed'},
    },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof Switch>;

// Base story
export const Default: Story = {
    args: {
        label: 'Switch',
    },
};

// Variant stories
export const Primary: Story = {
    args: {
        label: 'Primary Switch',
        variant: 'primary',
    },
};

export const Secondary: Story = {
    args: {
        label: 'Secondary Switch',
        variant: 'secondary',
    },
};

export const Success: Story = {
    args: {
        label: 'Success Switch',
        variant: 'success',
    },
};

export const Danger: Story = {
    args: {
        label: 'Danger Switch',
        variant: 'danger',
    },
};

// Size stories
export const Small: Story = {
    args: {
        label: 'Small Switch',
        size: 'sm',
    },
};

export const Medium: Story = {
    args: {
        label: 'Medium Switch',
        size: 'md',
    },
};

export const Large: Story = {
    args: {
        label: 'Large Switch',
        size: 'lg',
    },
};

// State stories
export const Checked: Story = {
    args: {
        label: 'Checked Switch',
        checked: true,
    },
};

export const Disabled: Story = {
    args: {
        label: 'Disabled Switch',
        disabled: true,
    },
};

export const DisabledChecked: Story = {
    args: {
        label: 'Disabled Checked Switch',
        disabled: true,
        checked: true,
    },
};

// Common use cases
export const WithoutLabel: Story = {
    args: {},
};

// Example of multiple switches in different states
export const SwitchGrid: Story = {
    render: () => (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium">바리에이션</h3>
                <div className="flex gap-8">
                    <Switch variant="primary" label="Primary" />
                    <Switch variant="secondary" label="Secondary" />
                    <Switch variant="success" label="Success" />
                    <Switch variant="danger" label="Danger" />
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium">크기</h3>
                <div className="flex gap-8 items-center">
                    <Switch size="sm" label="Small" />
                    <Switch size="md" label="Medium" />
                    <Switch size="lg" label="Large" />
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium">상태</h3>
                <div className="flex gap-8">
                    <Switch checked label="Checked" />
                    <Switch disabled label="Disabled" />
                    <Switch checked disabled label="Disabled Checked" />
                </div>
            </div>
        </div>
    ),
};
