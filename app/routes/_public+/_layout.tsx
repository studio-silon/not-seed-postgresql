import {Outlet} from '@remix-run/react';
import {Navbar} from '~/components/navbar';

export default function App() {
    return (
        <div className="min-h-screen bg-secondary">
            <Navbar />
            <Outlet />
        </div>
    );
}
