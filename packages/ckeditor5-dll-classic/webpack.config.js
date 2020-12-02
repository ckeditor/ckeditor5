/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = {
	mode: 'development',
	entry: path.resolve( __dirname, 'src', 'ckeditor.js' ),
	optimization: {
		minimize: false,
		moduleIds: 'named'
	},
	output: {
		path: path.resolve( __dirname, 'build' ),
		filename: 'dll-classic.js',
		library: [ 'CKEditor5', 'ClassicEditor' ],
		libraryTarget: 'umd',
		libraryExport: 'default'
	},
	plugins: [
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-core'
		} ),
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-utils'
		} ),
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-dll'
		} )
	]
};
