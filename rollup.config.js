const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const { terser } = require('rollup-plugin-terser');
const babel = require('rollup-plugin-babel');
const typescript = require('@rollup/plugin-typescript')

const pkg = require('./package.json');

const moduleName = 'RiotMeiosis';

const extensions = ['.js', '.jsx', '.ts', '.tsx']
const emptyFile = 'export default undefined'

// ignore builtin requires
function ignore() {
    return {
        transform(code, id) {
            if (!id.includes('commonjs-external')) return

            return {
                code: emptyFile,
                map: null
            }
        }
    }
};

const iifeAfterWrite = () => ({
    generateBundle(_, bundle) {

        const { code } = bundle['iife.js'];
        bundle['iife.js'].code = code.replace(/\s$/, `${moduleName} = Object.assign(${moduleName}.default, ${moduleName});\n`);
    }
});

const cjsAfterWrite = () => ({
    generateBundle(_, bundle) {

        const { code } = bundle['cjs.js'];
        bundle['cjs.js'].code = code.replace(/\s$/, `module.exports = Object.assign(exports.default, exports);\n`);
    }
});

const plugins = [
    ignore(),
    json(),
    typescript(),
    nodeResolve({ extensions }),
    commonjs(),
    babel({
        extensions,
        ignore: [/[/\\]core-js/, /@babel[/\\]runtime/]
    }),
    terser()
];

const output = (format, etc = {}) => ({
    banner: `/* ${moduleName}, @license MIT */`,
    name: moduleName,
    sourcemap: true,
    format,
    file: `dist/${format}.js`,
    ...etc
});

module.exports = {
    input: 'lib/index.ts',
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    output: [
        output('iife', { plugins: [iifeAfterWrite()] }),
        output('cjs', { plugins: [cjsAfterWrite()] }),
        output('es'),
    ],
    onwarn: function(error) {
        if (/external dependency|Circular dependency/.test(error.message)) return
        console.error(error.message) // eslint-disable-line
    },
    plugins
}