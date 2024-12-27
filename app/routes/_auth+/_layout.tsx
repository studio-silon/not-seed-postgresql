import {Outlet} from '@remix-run/react';

export default function App() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Outlet />
            </div>
        </div>
    );
}
