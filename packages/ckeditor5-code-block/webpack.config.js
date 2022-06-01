/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

const { builds } = require( '@ckeditor/ckeditor5-dev-utils' );
// const MonacoWebpackPlugin = require( 'monaco-editor-webpack-plugin' );
const path = require( 'path' );

module.exports = builds.getDllPluginWebpackConfig( {
	themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' ),
	packagePath: __dirname,
	manifestPath: require.resolve( 'ckeditor5/build/ckeditor5-dll.manifest.json' ),
	isDevelopmentMode: process.argv.includes( '--mode=development' ),
	// plugins: [ new MonacoWebpackPlugin() ],
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader' ]
			},
			{
				test: /\.ttf$/,
				use: [ 'file-loader' ]
			}
		]
	},
	entry: './index.js',
	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'app.js'
	}
} );

// module.exports = {
// 	entry: './index.js',
// 	output: {
// 		path: path.resolve( __dirname, 'dist' ),
// 		filename: 'app.js'
// 	},
// 	module: {
// 		rules: [
// 			{
// 				test: /\.css$/,
// 				use: [ 'style-loader', 'css-loader' ]
// 			},
// 			{
// 				test: /\.ttf$/,
// 				use: [ 'file-loader' ]
// 			}
// 		]
// 	},
// 	plugins: [ new MonacoWebpackPlugin() ]
// };

// const path = require( 'path' );
// const MonacoWebpackPlugin = require( 'monaco-editor-webpack-plugin' );

// module.exports = {
// 	mode: process.env.NODE_ENV,
// 	entry: './index.js',
// 	output: {
// 		path: path.resolve( __dirname, 'dist' ),
// 		filename: '[name].bundle.js'
// 	},
// 	module: {
// 		rules: [
// 			{
// 				test: /\.css$/,
// 				use: [ 'style-loader', 'css-loader' ]
// 			},
// 			{
// 				test: /\.ttf$/,
// 				use: [ 'file-loader' ]
// 			}
// 		]
// 	},
// 	plugins: [
// 		new MonacoWebpackPlugin( {
// 			languages: [ 'typescript', 'javascript', 'css' ]
// 		} )
// 	]
// };



// module.exports = {
// 	entry: './index.js',
// 	output: {
// 		path: path.resolve( __dirname, 'dist' ),
// 		filename: 'app.js'
// 	},
// 	module: {
// 		rules: [
// 			{
// 				test: /\.css$/,
// 				use: [ 'style-loader', 'css-loader' ]
// 			},
// 			{
// 				test: /\.ttf$/,
// 				use: [ 'file-loader' ]
// 			}
// 		]
// 	},
// 	plugins: [ new MonacoWebpackPlugin() ]
// };
