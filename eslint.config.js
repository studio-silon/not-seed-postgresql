import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}']},
    {languageOptions: {globals: {...globals.browser, ...globals.node}}},
    {
        ignores: ['build/**/*', 'public/**/*', '/.cache/**/*', '/app/components/ui'],
    },
    {
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        rules: {
            'react/react-in-jsx-scope': 'off',
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        ['^react', '@remix-run/.*'],
                        ['^@?\\w'],
                        ['~/components/ui/.*'],
                        ['~/components/.*'],
                        ['^(@|components)(/.*|$)'],
                        ['^\\u0000'],
                        ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
                        ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
                        ['^.+\\.?(css)$'],
                    ],
                },
            ],
            'simple-import-sort/exports': 'error',
        },
    },
];
