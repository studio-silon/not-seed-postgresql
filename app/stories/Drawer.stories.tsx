import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Drawer} from './Drawer';
import {Button} from './Button';
import {Input} from './Input';

export default {
    title: 'Components/Drawer',
    component: Drawer,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} as Meta<typeof Drawer>;

type Story = StoryObj<typeof Drawer>;

// Basic example
export const Basic: Story = {
    render: () => (
        <Drawer>
            <Drawer.Trigger asChild>
                <Button variant="primary">Open Drawer</Button>
            </Drawer.Trigger>
            <Drawer.Content>
                <Drawer.Header>Basic Drawer</Drawer.Header>
                <Drawer.Body>
                    <p>This is a basic drawer example with minimal content.</p>
                </Drawer.Body>
                <Drawer.Footer>
                    <Drawer.Close>
                        <Button variant="ghost">Cancel</Button>
                    </Drawer.Close>
                    <Button variant="primary">Save Changes</Button>
                </Drawer.Footer>
            </Drawer.Content>
        </Drawer>
    ),
};

// With description
export const WithDescription: Story = {
    render: () => (
        <Drawer>
            <Drawer.Trigger asChild>
                <Button variant="primary">Open Drawer with Description</Button>
            </Drawer.Trigger>
            <Drawer.Content>
                <Drawer.Header>Drawer with Description</Drawer.Header>
                <Drawer.Description>This drawer includes a description section that provides additional context.</Drawer.Description>
                <Drawer.Body>
                    <p>Main content area of the drawer.</p>
                </Drawer.Body>
                <Drawer.Footer>
                    <Drawer.Close>
                        <Button variant="ghost">Close</Button>
                    </Drawer.Close>
                </Drawer.Footer>
            </Drawer.Content>
        </Drawer>
    ),
};

// With snap points
export const WithSnapPoints: Story = {
    render: () => (
        <Drawer>
            <Drawer.Trigger asChild>
                <Button variant="primary">Open Drawer with Snap Points</Button>
            </Drawer.Trigger>
            <Drawer.Content snapPoints={[0.5, 0.9]}>
                <Drawer.Header>Snap Points Drawer</Drawer.Header>
                <Drawer.Body>
                    <p>Try dragging this drawer to different heights.</p>
                    <p className="mt-4">It will snap to 50% and 90% of the screen height.</p>
                </Drawer.Body>
                <Drawer.Footer>
                    <Drawer.Close>
                        <Button variant="ghost">Close</Button>
                    </Drawer.Close>
                </Drawer.Footer>
            </Drawer.Content>
        </Drawer>
    ),
};

// With form
export const WithForm: Story = {
    render: () => (
        <Drawer>
            <Drawer.Trigger asChild>
                <Button variant="primary">Open Form Drawer</Button>
            </Drawer.Trigger>
            <Drawer.Content>
                <Drawer.Header>Edit Profile</Drawer.Header>
                <Drawer.Description>Make changes to your profile settings here.</Drawer.Description>
                <Drawer.Body>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <Input type="text" className="mt-1 block w-full" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <Input type="email" className="mt-1 block w-full" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bio</label>
                            <textarea
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-primary-500 focus:ring-primary-500"
                                rows={3}
                                placeholder="Tell us about yourself"
                            />
                        </div>
                    </form>
                </Drawer.Body>
                <Drawer.Footer>
                    <Drawer.Close>
                        <Button variant="ghost">Cancel</Button>
                    </Drawer.Close>
                    <Button variant="primary">Save Changes</Button>
                </Drawer.Footer>
            </Drawer.Content>
        </Drawer>
    ),
};

// With custom styling
export const CustomStyling: Story = {
    render: () => (
        <Drawer>
            <Drawer.Trigger asChild>
                <Button variant="primary">Open Custom Styled Drawer</Button>
            </Drawer.Trigger>
            <Drawer.Content className="bg-gray-50">
                <Drawer.Header className="bg-primary-100 text-primary-900">Custom Styled Drawer</Drawer.Header>
                <Drawer.Description className="bg-primary-50 italic">This drawer uses custom styling for each section.</Drawer.Description>
                <Drawer.Body className="bg-white shadow-inner">
                    <p>Content with custom background and shadow.</p>
                </Drawer.Body>
                <Drawer.Footer className="bg-gray-100">
                    <Drawer.Close>
                        <Button variant="ghost">Close</Button>
                    </Drawer.Close>
                    <Button variant="primary">Confirm</Button>
                </Drawer.Footer>
            </Drawer.Content>
        </Drawer>
    ),
};

// Controlled drawer
export const Controlled: Story = {
    render: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [isOpen, setIsOpen] = useState(false);

        return (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <Drawer.Trigger asChild>
                    <Button variant="primary">Open Controlled Drawer</Button>
                </Drawer.Trigger>
                <Drawer.Content>
                    <Drawer.Header>Controlled Drawer</Drawer.Header>
                    <Drawer.Body>
                        <p>This drawer's state is controlled externally.</p>
                        <p className="mt-4">Current state: {isOpen ? 'Open' : 'Closed'}</p>
                    </Drawer.Body>
                    <Drawer.Footer>
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>
                            Close
                        </Button>
                    </Drawer.Footer>
                </Drawer.Content>
            </Drawer>
        );
    },
};

// With nested drawers
export const NestedDrawers: Story = {
    render: () => (
        <Drawer>
            <Drawer.Trigger asChild>
                <Button variant="primary">Open Parent Drawer</Button>
            </Drawer.Trigger>
            <Drawer.Content>
                <Drawer.Header>Parent Drawer</Drawer.Header>
                <Drawer.Body>
                    <p>This drawer contains another drawer.</p>
                    <div className="mt-4">
                        <Drawer>
                            <Drawer.Trigger asChild>
                                <Button variant="secondary">Open Child Drawer</Button>
                            </Drawer.Trigger>
                            <Drawer.Content>
                                <Drawer.Header>Child Drawer</Drawer.Header>
                                <Drawer.Body>
                                    <p>This is a nested drawer.</p>
                                </Drawer.Body>
                                <Drawer.Footer>
                                    <Drawer.Close>
                                        <Button variant="ghost">Close</Button>
                                    </Drawer.Close>
                                </Drawer.Footer>
                            </Drawer.Content>
                        </Drawer>
                    </div>
                </Drawer.Body>
                <Drawer.Footer>
                    <Drawer.Close>
                        <Button variant="ghost">Close Parent</Button>
                    </Drawer.Close>
                </Drawer.Footer>
            </Drawer.Content>
        </Drawer>
    ),
};
