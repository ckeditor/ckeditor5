/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { readFile } from 'fs/promises';

import typescript from 'typescript';
import del from 'rollup-plugin-delete';
import styles from 'rollup-plugin-styles';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import svgPlugin from 'rollup-plugin-svg-import';
import typescriptPlugin from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

import postcssNesting from 'postcss-nesting';
import postcssMixins from 'postcss-mixins';
import postcssImport from 'postcss-import';

import po2js from './translations/po2js.mjs';

// Indicates whether to emit source maps
const sourceMap = process.env.DEVELOPMENT || false;

// Current working directory
const cwd = process.cwd();

// Content of the `package.json`
const pkg = JSON.parse( await readFile(`${ cwd }/package.json`) );

// List of external dependencies
const external = [
	...Object.keys(pkg.dependencies || {}),
	...Object.keys(pkg.peerDependencies || {})
];

// Banner added to the top of the output files
const banner =
`/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */`;

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
	// Output in a new format for NPM usage
	{
		input: `${ cwd }/src/index.ts`,
		output: {
			format: 'esm',
			file: `${ cwd }/dist/index.js`,
			assetFileNames: '[name][extname]',
			sourcemap: sourceMap,
			banner
		},
		external,
		plugins: [
			del( {
				targets: `${ cwd }/dist`
			} ),
			commonjs(),
			nodeResolve(),
			svgPlugin( {
				stringify: true
			} ),
			styles( {
				mode: [ 'extract', 'styles.css' ],
				plugins: [
					postcssNesting,
					postcssMixins,
					postcssImport
				],
				minimize: true,
				sourceMap
			} ),
			typescriptPlugin( {
				tsconfig: `${ cwd }/tsconfig.json`,
				typescript,
				compilerOptions: {
					declarationDir: `${ cwd }/dist/types`,
					declaration: true,
					declarationMap: false, // TODO
				},
				sourceMap
			} ),
			// po2js( {
			// 	sourceFolder: `${cwd}/lang/translations`,
			// 	destFolder: `${cwd}/dist/translations`,
			// 	banner
			// } )
		]
	},

	// Output in a new format for CDN usage
	{
		input: `${ cwd }/src/index.ts`,
		output: {
			format: 'esm',
			file: `${ cwd }/dist/index.min.js`,
			assetFileNames: '[name][extname]',
			sourcemap: sourceMap,
			banner
		},
		external: [
			/^@ckeditor/,
			/^ckeditor5/
		],
		plugins: [
			commonjs(),
			nodeResolve(),
			svgPlugin( {
				stringify: true
			} ),
			styles( {
				mode: [ 'extract', 'styles.css' ],
				plugins: [
					postcssNesting,
					postcssMixins,
					postcssImport
				],
				minimize: true,
				sourceMap: false
			} ),
			typescriptPlugin( {
				tsconfig: `${ cwd }/tsconfig.json`,
				typescript,
				sourceMap: false
			} ),
			terser( {
				format: {
					// Remove all comments except third-party licenses and the license banner from above (starting with `!`).
					comments: ( node, comment ) => /@license/.test( comment.value ) && ( /^!/.test( comment.value ) || !/CKSource/.test( comment.value ) )
				}
			} )
		]
	}
];
