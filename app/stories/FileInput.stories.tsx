import type {Meta, StoryObj} from '@storybook/react';
import {FileInput} from './FileInput';
import React from 'react';

const meta: Meta<typeof FileInput> = {
    title: 'Components/FileInput',
    component: FileInput,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FileInput>;

export const Default: Story = {
    render: () => {
        return <FileInput accept="image" />;
    },
};
