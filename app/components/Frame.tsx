export function Frame({children}: {children: React.ReactNode}) {
    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="bg-white rounded-lg p-4 lg:p-6">{children}</div>
        </div>
    );
}
