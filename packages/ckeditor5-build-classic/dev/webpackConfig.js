/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const webpack = require( 'webpack' );
const getWebpackEs6Config = require( './webpackEs6Config' );

module.exports = function getWebpackConfig( destinationPath, moduleName ) {
	const config = getWebpackEs6Config( destinationPath, moduleName );

	config.output.filename = 'ckeditor.js';

	config.plugins = [
		new webpack.optimize.UglifyJsPlugin()
	];

	config.module.rules.push( {
		test: /\.js$/,
		loader: 'babel-loader',
		options: {
			presets: [
				'es2015'
			]
		}
	} );

	return config;
};
