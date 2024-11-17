import type {Meta, StoryObj} from '@storybook/react';
import {MiniTab} from './MiniTab';
import React from 'react';

const meta: Meta<typeof MiniTab> = {
    title: 'Components/MiniTab',
    component: MiniTab,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MiniTab>;

export const Default: Story = {
    render: () => {
        const [activeTab, setActiveTab] = React.useState('all');

        return (
            <div className="flex gap-2">
                <MiniTab isActive={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                    All
                </MiniTab>
                <MiniTab isActive={activeTab === 'unread'} onClick={() => setActiveTab('unread')}>
                    Unread
                </MiniTab>
            </div>
        );
    },
};
