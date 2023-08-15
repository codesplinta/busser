import fs from 'fs';
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const pkg = JSON.parse(
	fs.readFileSync('./package.json', { encoding: 'utf-8' })
);
const extensions = ['.js', '.jsx'];

export default {
  input: 'src/index.js',
  external: ['react', 'react-dom', 'react-router', 'react-router-dom'],
  plugins: [
	nodeResolve({
	  extensions
	}),
	babel({
	  extensions,
	  babelHelpers: 'bundled',
	  exclude: 'node_modules/**'
	}),
	terser()
  ],
  output: [
	{
	  name: pkg.name,
	  file: pkg.main,
	  format: 'cjs',
	  sourcemap: true
	},
	{
	  name: pkg.name,
	  file: pkg.module,
	  format: 'es',
	  sourcemap: true
	},
	{
	  name: pkg.name,
	  file: pkg.umd,
	  format: 'umd',
	  sourcemap: true,
	  globals: {
	    react: 'react',
	    'react-dom': 'react-dom',
	    'react-router': 'react-router',
	    'react-router-dom': 'react-router-dom'
	  }
	}
  ]
};
