import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '');
    process.env = {...process.env, ...env};

    return {
        plugins: [react()],
        css: {
            postcss: {
                plugins: [tailwindcss()],
            },
        },
    };
});
