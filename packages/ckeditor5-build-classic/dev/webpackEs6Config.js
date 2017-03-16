/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = require( 'path' );
const webpack = require( 'webpack' );
const BabiliPlugin = require( 'babili-webpack-plugin' );

module.exports = function getWebpackConfig( destinationPath, moduleName ) {
	return {
		devtool: 'cheap-source-map',

		entry: [
			path.resolve( __dirname, '..', 'ckeditor.js' )
		],

		output: {
			path: path.resolve( __dirname, '..', destinationPath ),
			filename: 'ckeditor.es6.js',
			libraryTarget: 'umd',
			library: moduleName
		},

		plugins: [
			new BabiliPlugin()
		],

		module: {
			rules: [
				{
					// test: **/ckeditor5-*/theme/icons/*.svg
					test: /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg$/,
					use: [ 'raw-loader' ]
				},
				{
					// test: **/ckeditor5-*/theme/**/*.scss
					test: /\.scss$/,
					use: [ 'style-loader', 'css-loader', 'sass-loader' ]
				}
			]
		},

		resolveLoader: {
			modules: [
				'node_modules'
			]
		}
	};
};
