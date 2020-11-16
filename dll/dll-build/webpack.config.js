/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = {
	entry: {
		CKEditor: [ './src/foo', './src/index', './src/utils' ]
	},
	output: {
		path: path.resolve( __dirname, 'build' ),
		filename: 'ckeditor.dll.js',
		library: 'CKEditor',
		libraryTarget: 'umd'
	},
	plugins: [
		new webpack.DllPlugin( {
			name: 'CKEditor',
			context: 'src',
			path: path.resolve( __dirname, 'build/ckeditor-manifest.json' ),
			format: true,
			entryOnly: false
		} )
	]
};
