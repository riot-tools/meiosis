import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'index.js',
  plugins: [
    resolve({
      jsnext: true
    })
  ],
  output: [
    {
      name: 'riot-meiosis',
      file: 'riot-meiosis.js',
      format: 'umd'
    }
  ]
};