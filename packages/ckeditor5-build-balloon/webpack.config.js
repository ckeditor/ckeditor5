/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );
const { bundler, styles } = require( '@ckeditor/ckeditor5-dev-utils' );
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );
const UglifyJsWebpackPlugin = require( 'uglifyjs-webpack-plugin' );
const buildConfig = require( './build-config' );

module.exports = {
	devtool: 'source-map',

	entry: path.resolve( __dirname, 'src', 'ckeditor.js' ),

	output: {
		path: path.resolve( __dirname, 'build' ),
		filename: 'ckeditor.js',
		libraryTarget: 'umd',
		libraryExport: 'default',
		library: buildConfig.moduleName
	},

	optimization: {
		minimizer: [
			// Use the newest version of UglifyJsWebpackPlugin plugin that fixes `inline` optimization bug.
			// See https://github.com/webpack-contrib/uglifyjs-webpack-plugin/issues/264.
			new UglifyJsWebpackPlugin( {
				sourceMap: true,
				uglifyOptions: {
					output: {
						// Preserve license comments starting with the exclamation mark (!).
						comments: /^!/
					}
				}
			} )
		]
	},

	plugins: [
		new CKEditorWebpackPlugin( {
			language: buildConfig.config.language,
			additionalLanguages: 'all'
		} ),
		new webpack.BannerPlugin( {
			banner: bundler.getLicenseBanner(),
			raw: true
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
							singleton: true
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
					},
				]
			}
		]
	}
};
