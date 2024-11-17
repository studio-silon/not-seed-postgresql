import React, {useState} from 'react';
import {Meta, StoryObj} from '@storybook/react';
import Dialog from './Dialog';
import {Button} from './Button';

export default {
    title: 'Components/Dialog',
    component: Dialog,
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
} as Meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
    render: (args) => {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <>
                <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
                <Dialog {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
                    <Dialog.Title>Dialog Title</Dialog.Title>
                    <Dialog.Content>
                        <p>This is the content of the dialog.</p>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onClick={() => setIsOpen(false)}>Close</Button>
                    </Dialog.Actions>
                </Dialog>
            </>
        );
    },
};
Default.args = {};
