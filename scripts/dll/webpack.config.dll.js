/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const { bundler, styles } = require( '@ckeditor/ckeditor5-dev-utils' );

const ROOT_DIRECTORY = path.resolve( __dirname, '..', '..' );
const IS_DEVELOPMENT_MODE = process.argv.includes( '--dev' );

if ( ROOT_DIRECTORY !== process.cwd() ) {
	throw new Error( 'This script should be called from the package root directory.' );
}

const webpackConfig = {
	mode: IS_DEVELOPMENT_MODE ? 'development' : 'production',
	performance: { hints: false },
	entry: [
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
		path: path.join( ROOT_DIRECTORY, 'build' ),
		filename: 'ckeditor5-dll.js',
		library: [ 'CKEditor5', 'dll' ],
		libraryTarget: 'umd'
	},
	plugins: [
		new webpack.BannerPlugin( {
			banner: bundler.getLicenseBanner(),
			raw: true
		} ),
		new webpack.DllPlugin( {
			name: 'CKEditor5.dll',
			context: 'src',
			path: path.join( ROOT_DIRECTORY, 'build', 'ckeditor5-dll.manifest.json' ),
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

