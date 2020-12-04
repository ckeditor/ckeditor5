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
	entry: [ './' ],
	optimization: {
		minimize: false,
		moduleIds: 'named'
	},
	output: {
		path: path.resolve( __dirname, 'build' ),
		filename: 'ckeditor5-engine.dll.js',
		library: 'CKEditor5_engine',
		libraryTarget: 'umd'
	},
	plugins: [
		// new webpack.DllReferencePlugin( {
		// 	manifest: require( '../ckeditor5-utils/build/ckeditor5-utils.manifest.json' ),
		// 	scope: '@ckeditor/ckeditor5-utils'
		// } ),
		new webpack.DllPlugin( {
			name: 'CKEditor5_engine',
			context: 'src',
			path: path.resolve( __dirname, 'build/ckeditor5-engine.manifest.json' ),
			format: true,
			entryOnly: false
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
			}
		]
	}
};
