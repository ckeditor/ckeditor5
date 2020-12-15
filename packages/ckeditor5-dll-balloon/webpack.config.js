/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

const IS_DEVELOPMENT_MODE = process.argv.includes( '--dev' );

const webpackConfig = {
	mode: IS_DEVELOPMENT_MODE ? 'development' : 'production',
	entry: path.resolve( __dirname, 'src', 'ckeditor.js' ),
	optimization: {},
	output: {
		path: path.resolve( __dirname, 'build' ),
		filename: 'dll-balloon.js',
		library: [ 'CKEditor5', 'BalloonEditor' ],
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

if ( !IS_DEVELOPMENT_MODE ) {
	webpackConfig.optimization.minimize = true;

	webpackConfig.optimization.minimizer = [
		new TerserPlugin( {
			terserOptions: {
				output: {
					// Preserve CKEditor 5 license comments.
					comments: /^!/
				}
			},
			extractComments: false
		} )
	];
}

module.exports = webpackConfig;
