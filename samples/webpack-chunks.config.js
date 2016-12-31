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
		core: './webpack-entry-point',
		pluginList: 'ckeditor5-list/src/list',
		pluginLink: 'ckeditor5-link/src/link',
	},

	output: {
		path: path.join( 'build', 'dist' ),
		filename: '[name].ckeditor.js',
	},

	devtool: 'cheap-source-map',

	plugins: [
		new CKEditorWebpackPlugin( {
			useMainPackageModules: true,
			mainPackagePath: process.cwd()
		} ),
		new webpack.optimize.CommonsChunkPlugin( {
			names: [ 'core' ],
			// children: true
			// minChunks: Infinity
		} )
	],
};
