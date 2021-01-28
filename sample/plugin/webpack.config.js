/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = {
	mode: 'development',
	optimization: {
		minimize: false,
		moduleIds: 'named'
	},
	entry: {
		path: path.resolve( __dirname, 'src/dllconsumerplugin.js' )
	},
	output: {
		path: path.resolve( __dirname, '../../build' ),
		filename: 'dll-consumer-plugin.js',
		library: 'DLLConsumerPlugin',
		libraryTarget: 'umd',
		libraryExport: 'default'
	},
	plugins: [
		new webpack.DllReferencePlugin( {
			manifest: require( '../../build/ckeditor5-dll.manifest.json' ),
			scope: 'ckeditor5/src',
			name: 'CKEditor5.dll'
		} )
	]
};
