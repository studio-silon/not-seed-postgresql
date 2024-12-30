import {useEffect, useState} from 'react';

export function useTheme() {
    const [theme, setTheme] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light'));

    useEffect(() => {
        const root = window.document.body;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        document.startViewTransition(() => {
            setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
        });
    };

    return {theme, toggleTheme};
}
