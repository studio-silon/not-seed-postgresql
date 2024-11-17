import type {Meta, StoryObj} from '@storybook/react';

import {Progress} from './Progress';

const meta = {
    title: 'Components/Progress',
    component: Progress,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Progress',
        className: '',
        value: 80,
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Progress',
        className: '',
        value: 80,
    },
};

export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Progress',
        className: '',
        value: 80,
    },
};

export const Danger: Story = {
    args: {
        variant: 'danger',
        children: 'Progress',
        className: '',
        value: 80,
    },
};
