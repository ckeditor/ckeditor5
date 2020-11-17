/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = {
	mode: 'development',
	optimization: {
		moduleIds: 'named'
	},
	output: {
		path: path.resolve( __dirname, 'build' ),
		filename: 'app.js',
		libraryTarget: 'umd'
	},
	plugins: [
		new webpack.DllReferencePlugin( {
			manifest: require( '../dll-build/build/ckeditor-manifest.json' ),
			scope: '@ckeditor/ckeditor5-dll'
		} )
	]
};
