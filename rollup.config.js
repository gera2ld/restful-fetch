import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/index.js',
  dest: 'lib/index.js',
  format: 'cjs',
  plugins: [babel({
    exclude: 'node_modules/**',
  })],
}
