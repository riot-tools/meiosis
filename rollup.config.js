import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';

import pkg from './package.json';
import tsconfig from './tsconfig.json';

export default [
    {
        input: 'lib/index.ts',
        plugins: [

            del({ targets: 'dist/*' }),

            typescript({
                typescript: require('typescript'),
                tsconfig: 'tsconfig.json',
                tsconfigOverride: tsconfig
            }),

            terser(),
        ],
        output: [
            {
                name: 'RiotMeiosis',
                file: pkg.main,
                format: 'umd',
                sourcemap: true,
                inlineDynamicImports: true,
            },
            {
                name: 'RiotMeiosis',
                file: pkg.browser,
                format: 'iife',
                sourcemap: true,
                inlineDynamicImports: true,
            },
            {
                file: pkg.module,
                format: 'es',
                sourcemap: true
            }
        ],
        external: [
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.peerDependencies || {}),
            ...Object.keys(pkg.devDependencies || {}),
        ]
    }
];