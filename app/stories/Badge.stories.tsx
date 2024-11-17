import type {Meta, StoryObj} from '@storybook/react';

import {Badge} from './Badge';

const meta = {
    title: 'Components/Badge',
    component: Badge,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'blue', 'danger'],
            description: 'The visual style variant of the badge',
            defaultValue: 'secondary',
        },
    },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        variant: 'secondary',
        children: 'Badge',
        className: '',
    },
};
