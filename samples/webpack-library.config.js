/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint browser: false, node: true, strict: true */

const path = require( 'path' );
const CKEditorWebpackPlugin = require( './ckeditor-webpack-plugin' );
const webpack = require( 'webpack' );

module.exports = {
	context: __dirname,
	target: 'web',

	entry: {
		ClassicEditor: 'ckeditor5-editor-classic/src/classic',
		CKEditorPresetBasic: './ckeditor-preset-basic',
		CKEditorList: 'ckeditor5-list/src/list',
		CKEditorLink: 'ckeditor5-link/src/link',
		CKEditorHeading: 'ckeditor5-heading/src/heading',
	},

	output: {
		path: path.join( 'build', 'dist' ),
		filename: '[name].ckeditor.js',
		library: '[name]',
	},

	devtool: 'cheap-source-map',

	plugins: [
		new CKEditorWebpackPlugin( {
			useMainPackageModules: true,
			mainPackagePath: process.cwd()
		} ),
		new webpack.optimize.CommonsChunkPlugin( {
			name: 'ClassicEditor',
			// children: true,
			minChunks: 2
		} )
	],
};
