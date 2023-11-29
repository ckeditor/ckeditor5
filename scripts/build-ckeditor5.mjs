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

import path from 'path';

import po2js from './translations/rollup-po2js/po2js.mjs';

// Indicates whether to emit source maps
const sourceMap = process.env.DEVELOPMENT || false;

// Current working directory
const cwd = process.cwd();

// Content of the `package.json`
const pkg = JSON.parse( await readFile( path.join( cwd, 'package.json' ) ) );

// List of external dependencies
const external = [
	...Object.keys( pkg.dependencies || {} ),
	...Object.keys( pkg.peerDependencies || {} )
];

// Banner added to the top of the output files
const banner =
`/*!
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */`;

const inputPath = path.join( cwd, 'src', 'index.ts');
const tsConfigPath = path.join( cwd, 'tsconfig.release-ckeditor5.json');

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
	// Output in a new format for NPM usage
	{
		input: inputPath,
		output: {
			format: 'esm',
			file: path.join( cwd, 'dist', 'index.js' ),
			assetFileNames: '[name][extname]',
			sourcemap: sourceMap,
			banner
		},
		plugins: [
			del( {
				targets: path.join( cwd, 'dist' )
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
				tsconfig: tsConfigPath,
				typescript,
				compilerOptions: {
					declarationDir: path.join( cwd, 'dist', 'types' ),
					declaration: true,
					declarationMap: false, // TODO
				},
				sourceMap
			} ),
			po2js( {
				type: 'all',
				destFolder: path.join( cwd, 'dist', 'translations' ),
				banner
			} )
		]
	},

	// Output in a new format for CDN usage
	{
		input: inputPath,
		output: {
			format: 'esm',
			file: path.join( cwd, 'dist', 'index.min.js' ),
			assetFileNames: '[name][extname]',
			sourcemap: sourceMap,
			banner
		},
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
				tsconfig: tsConfigPath,
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
