import {vitePlugin as remix} from '@remix-run/dev';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

declare module '@remix-run/node' {
    interface Future {
        v3_singleFetch: true;
    }
}

export default defineConfig({
    plugins: [
        remix({
            basename: process.env.MODE === 'skin' ? '/api/' : '/',
            future: {
                v3_fetcherPersist: true,
                v3_relativeSplatPath: true,
                v3_throwAbortReason: true,
                v3_singleFetch: process.env.MODE !== 'skin',
                v3_lazyRouteDiscovery: true,
            },
        }),
        tsconfigPaths(),
    ],
    base: process.env.MODE === 'skin' ? '/api/' : '/',
    server: {
        host: '0.0.0.0',
    },
    build: {
        rollupOptions: {
            external: ['pg-hstore'],
        },
        target: 'ES2024',
    },
    define: {
        IS_SKIN_MODE: process.env.MODE === 'skin',
    },
});
