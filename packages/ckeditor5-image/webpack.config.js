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
		path: path.resolve( __dirname, 'image.js' )
	},
	output: {
		path: path.resolve( __dirname, 'build' ),
		filename: 'image.js',
		library: [ 'CKEditor5', 'Image' ],
		libraryTarget: 'umd',
		libraryExport: 'default'
	},
	stats: 'verbose',
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
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-clipboard'
		} ),
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-core'
		} ),
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-engine'
		} ),
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-ui'
		} ),
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-upload'
		} ),
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-utils'
		} ),
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-undo'
		} ),
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-widget'
		} )
	]
};

