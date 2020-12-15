/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

const rootDirectory = path.resolve( __dirname, '..', '..' );

if ( rootDirectory !== process.cwd() ) {
	throw new Error( 'This script should be called from the package root directory.' );
}

module.exports = {
	mode: 'development',
	entry: [
		// The assumption is that `rootDirectory` is equal to `process.cwd()`.
		// The base of the CKEditor 5 framework, in order of appearance:
		'./src/utils.js',
		'./src/core.js',
		'./src/engine.js',
		'./src/ui.js',

		// The base packages of the CKEditor 5 Cloud Services:
		'./src/cloud-services-core.js',

		// The Essentials plugin contents:
		'./src/clipboard.js',
		'./src/enter.js',
		'./src/paragraph.js',
		'./src/select-all.js',
		'./src/typing.js',
		'./src/undo.js',

		// Other, common packages:
		'./src/upload.js',
		'./src/widget.js'
	],
	optimization: {
		minimize: false,
		moduleIds: 'named'
	},
	output: {
		path: path.join( rootDirectory, 'build' ),
		filename: 'ckeditor5-dll.js',
		library: [ 'CKEditor5', 'dll' ],
		libraryTarget: 'umd'
	},
	plugins: [
		new webpack.DllPlugin( {
			name: 'CKEditor5.dll',
			context: 'src',
			path: path.join( rootDirectory, 'build', 'ckeditor5-dll.manifest.json' ),
			format: true,
			entryOnly: true
		} )
	],
	module: {
		rules: [
			{
				test: /\.svg$/,
				use: [ 'raw-loader' ]
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: 'style-loader',
						options: {
							injectType: 'singletonStyleTag',
							attributes: {
								'data-cke': true
							}
						}
					},
					{
						loader: 'postcss-loader',
						options: styles.getPostCssConfig( {
							themeImporter: {
								themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
							},
							minify: true
						} )
					}
				]
			},
			{
				test: /\.js$/,
				loader: require.resolve( './dll-loader' )
			}
		]
	}
};
