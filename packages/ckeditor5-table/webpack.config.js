/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {
	mode: 'development',
	optimization: {
		minimize: false,
		moduleIds: 'named'
	},
	entry: {
		path: path.resolve( __dirname, 'table.js' )
	},
	output: {
		path: path.resolve( __dirname, 'build' ),
		filename: 'table.js',
		library: [ 'CKEditor5', 'Table' ],
		libraryTarget: 'umd',
		libraryExport: 'default'
	},
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
			}
		]
	},
	plugins: [
		new webpack.DllReferencePlugin( {
			manifest: require( '../../build/ckeditor5-dll.manifest.json' ),
			scope: 'ckeditor5/src'
		} )
	]
};

