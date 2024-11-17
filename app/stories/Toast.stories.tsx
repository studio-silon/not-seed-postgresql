import type {Meta, StoryObj} from '@storybook/react';

import {Toast} from './Toast';

const meta = {
    title: 'Components/Toast',
    component: Toast,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {
    args: {
        variant: 'success',
        children: 'Toast',
        className: '',
    },
};

export const Error: Story = {
    args: {
        variant: 'error',
        children: 'Toast',
        className: '',
    },
};

export const Warning: Story = {
    args: {
        variant: 'warning',
        children: 'Toast',
        className: '',
    },
};
export const Info: Story = {
    args: {
        variant: 'info',
        children: 'Toast',
        className: '',
    },
};
