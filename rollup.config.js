/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint browser: false, node: true, strict: true */

'use strict';

const path = require( 'path' );
const ckeditorRollupPlugin = require( './ckeditor-rollup-plugin' );
const nodeResolve = require( 'rollup-plugin-node-resolve' );
const stringRollupPlugin = require( 'rollup-plugin-string' );
const sassRollupPlugin = require( 'rollup-plugin-sass' );

export default {
	entry: './webpack-entry-point.js',
	format: 'iife',

	dest: path.join( 'build', 'dist', 'ckeditor.js' ),

	plugins: [
		ckeditorRollupPlugin( {
			useMainPackageModules: true,
			mainPackagePath: process.cwd()
		} ),
		nodeResolve(),

		// TODO is it possible to include that in the CKEditor plugin?
		stringRollupPlugin( {
			include: '**/ckeditor5-*/theme/icons/*.svg'
		} ),

		sassRollupPlugin( {
			insert: true,
			include: '**/*.scss',
			exclude: [],
			options: {
				importer( url /*, prev */ ) {
					if ( url.startsWith( '~' ) ) {
						const path = process.cwd() + '/node_modules/' + url.slice( 1 );

						return {
							file: path
						};
					}
				}
			}
		} )
	]
};
