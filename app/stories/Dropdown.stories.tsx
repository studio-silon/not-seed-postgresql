import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Dropdown} from './Dropdown';
import {Button} from './Button';
import {Settings, User, LogOut, ChevronDown} from 'lucide-react';

const meta = {
    title: 'Components/Dropdown',
    component: Dropdown,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <div className="p-4">
                <Story />
            </div>
        ),
    ],
    tags: ['autodocs'],
} satisfies Meta<typeof Dropdown>;

export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
    render: () => (
        <Dropdown>
            <Dropdown.Trigger asChild>
                <Button variant="outline">
                    Options
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </Dropdown.Trigger>

            <Dropdown.Content>
                <Dropdown.Text>Signed in as John</Dropdown.Text>
                <Dropdown.Separator />
                <Dropdown.Item onClick={() => console.log('Profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                </Dropdown.Item>
                <Dropdown.Item onClick={() => console.log('Settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </Dropdown.Item>
                <Dropdown.Separator />
                <Dropdown.Item variant="danger" onClick={() => console.log('Logout')}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Dropdown.Item>
            </Dropdown.Content>
        </Dropdown>
    ),
};

export const RightAligned: Story = {
    render: () => (
        <Dropdown>
            <Dropdown.Trigger asChild>
                <Button>
                    Right Aligned
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </Dropdown.Trigger>

            <Dropdown.Content align="right">
                <Dropdown.Item>Option 1</Dropdown.Item>
                <Dropdown.Item>Option 2</Dropdown.Item>
                <Dropdown.Item>Option 3</Dropdown.Item>
            </Dropdown.Content>
        </Dropdown>
    ),
};

export const WithDisabledItems: Story = {
    render: () => (
        <Dropdown>
            <Dropdown.Trigger asChild>
                <Button variant="secondary">
                    With Disabled Items
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </Dropdown.Trigger>

            <Dropdown.Content>
                <Dropdown.Item>Enabled Option</Dropdown.Item>
                <Dropdown.Item disabled>Disabled Option</Dropdown.Item>
                <Dropdown.Separator />
                <Dropdown.Item>Another Option</Dropdown.Item>
            </Dropdown.Content>
        </Dropdown>
    ),
};
