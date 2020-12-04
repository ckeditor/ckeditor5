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
		filename: 'dll-decoupled-document.js',
		library: [ 'CKEditor5', 'DecoupledEditor' ],
		libraryTarget: 'umd',
		libraryExport: 'default'
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
			scope: '@ckeditor/ckeditor5-editor-decoupled'
		} ),
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-enter'
		} ),
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-paragraph'
		} ),
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-select-all'
		} ),
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-typing'
		} ),
		new webpack.DllReferencePlugin( {
			manifest: require( '../../packages/ckeditor5-dll/build/ckeditor5-dll.manifest.json' ),
			scope: '@ckeditor/ckeditor5-undo'
		} )
	]
};
