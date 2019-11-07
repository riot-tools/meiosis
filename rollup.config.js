import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'lib/index.js',
  plugins: [
    resolve({
      jsnext: true
    })
  ],
  output: [
    {
      name: 'RiotMeiosis',
      file: 'index.umd.js',
      format: 'umd'
    },
    {
      name: 'RiotMeiosis',
      file: 'index.esm.js',
      format: 'esm'
    }
  ]
};