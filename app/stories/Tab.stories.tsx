import type {Meta, StoryObj} from '@storybook/react';
import {Tab} from './Tab';
import React from 'react';

const meta: Meta<typeof Tab> = {
    title: 'Components/Tab',
    component: Tab,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tab>;

export const Default: Story = {
    render: () => {
        const [activeTab, setActiveTab] = React.useState('all');

        return (
            <Tab className="px-4">
                <Tab.Item isActive={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                    All
                </Tab.Item>
                <Tab.Item isActive={activeTab === 'unread'} onClick={() => setActiveTab('unread')} className="ml-4">
                    Unread
                </Tab.Item>
            </Tab>
        );
    },
};
