import {Outlet} from '@remix-run/react';
import {Navbar} from '~/components/navbar';
import {RecentCard} from '~/components/recent-card';

export default function App() {
    return (
        <div className="min-h-screen bg-secondary">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Outlet />
                    </div>
                    <div className="flex h-fit w-aull md:min-w-58">
                        <RecentCard />
                    </div>
                </div>
            </div>
        </div>
    );
}
