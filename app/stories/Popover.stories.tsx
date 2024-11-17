import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Popover} from './Popover';
import {Button} from './Button';
import {X} from 'lucide-react';

const meta = {
    title: 'Components/Popover',
    component: Popover,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <div className="p-32">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
    render: () => (
        <Popover>
            <Popover.Trigger asChild>
                <Button>Open Popover</Button>
            </Popover.Trigger>
            <Popover.Content>
                <Popover.Header>Welcome Back</Popover.Header>
                <Popover.Text>This is a simple popover with some content. You can put anything you want in here.</Popover.Text>
            </Popover.Content>
        </Popover>
    ),
};

export const WithFooter: Story = {
    render: () => (
        <Popover>
            <Popover.Trigger asChild>
                <Button>With Footer</Button>
            </Popover.Trigger>
            <Popover.Content>
                <Popover.Header>Confirmation</Popover.Header>
                <Popover.Text>Are you sure you want to delete this item? This action cannot be undone.</Popover.Text>
                <Popover.Footer>
                    <Popover.Close>
                        <Button variant="outline">Cancel</Button>
                    </Popover.Close>
                    <Popover.Close>
                        <Button variant="danger">Delete</Button>
                    </Popover.Close>
                </Popover.Footer>
            </Popover.Content>
        </Popover>
    ),
};

export const WithCloseButton: Story = {
    render: () => (
        <Popover>
            <Popover.Trigger asChild>
                <Button>With Close Button</Button>
            </Popover.Trigger>
            <Popover.Content>
                <div className="absolute right-2 top-2">
                    <Popover.Close>
                        <button className="rounded-full p-1 hover:bg-gray-100">
                            <X className="h-4 w-4" />
                        </button>
                    </Popover.Close>
                </div>
                <Popover.Header>Notifications</Popover.Header>
                <Popover.Text>You have 3 unread messages.</Popover.Text>
            </Popover.Content>
        </Popover>
    ),
};

export const Positions: Story = {
    render: () => (
        <div className="flex gap-4">
            <Popover>
                <Popover.Trigger asChild>
                    <Button>Top</Button>
                </Popover.Trigger>
                <Popover.Content side="top">
                    <Popover.Text>This popover appears on top</Popover.Text>
                </Popover.Content>
            </Popover>

            <Popover>
                <Popover.Trigger asChild>
                    <Button>Bottom</Button>
                </Popover.Trigger>
                <Popover.Content side="bottom">
                    <Popover.Text>This popover appears on bottom</Popover.Text>
                </Popover.Content>
            </Popover>

            <Popover>
                <Popover.Trigger asChild>
                    <Button>Left</Button>
                </Popover.Trigger>
                <Popover.Content side="left">
                    <Popover.Text>This popover appears on the left</Popover.Text>
                </Popover.Content>
            </Popover>

            <Popover>
                <Popover.Trigger asChild>
                    <Button>Right</Button>
                </Popover.Trigger>
                <Popover.Content side="right">
                    <Popover.Text>This popover appears on the right</Popover.Text>
                </Popover.Content>
            </Popover>
        </div>
    ),
};

export const Alignments: Story = {
    render: () => (
        <div className="flex gap-4">
            <Popover>
                <Popover.Trigger asChild>
                    <Button>Start</Button>
                </Popover.Trigger>
                <Popover.Content align="start">
                    <Popover.Text>This popover is aligned to the start</Popover.Text>
                </Popover.Content>
            </Popover>

            <Popover>
                <Popover.Trigger asChild>
                    <Button>Center</Button>
                </Popover.Trigger>
                <Popover.Content align="center">
                    <Popover.Text>This popover is aligned to the center</Popover.Text>
                </Popover.Content>
            </Popover>

            <Popover>
                <Popover.Trigger asChild>
                    <Button>End</Button>
                </Popover.Trigger>
                <Popover.Content align="end">
                    <Popover.Text>This popover is aligned to the end</Popover.Text>
                </Popover.Content>
            </Popover>
        </div>
    ),
};
