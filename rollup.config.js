import fs from 'fs';
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const pkg = JSON.parse(
	fs.readFileSync('./package.json', { encoding: 'utf-8' })
);
const extensions = ['.js', '.jsx'];
const externalGlobals = Object.keys(pkg.dependencies)
    .concat(Object.keys(pkg.peerDependencies));

export default {
  input: 'src/index.js',
  external: externalGlobals,
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
	  globals: Object.fromEntries(
	    externalGlobals.map((externalGlobal) => [externalGlobal, externalGlobal])
	  )
	}
  ]
};
