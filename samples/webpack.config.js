/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint browser: false, node: true, strict: true */

const path = require( 'path' );
const CKEditorWebpackPlugin = require( './node_modules/@ckeditor/ckeditor5-dev-tests/ckeditor-webpack-plugin' );

module.exports = {
	context: __dirname,
	target: 'web',

	entry: './webpack-entry-point',

	output: {
		path: path.join( 'build', 'dist' ),
		filename: 'ckeditor.js',
	},

	// TODO is it possible to include that in the CKEditor plugin?
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

	// resolve: {
	// 	modules: [
	// 		path.resolve( __dirname, 'node_modules' ),
	// 		'node_modules'
	// 	]
	// },

	devtool: 'cheap-source-map',

	plugins: [
		new CKEditorWebpackPlugin( {
			packages: {
				'*': path.join( process.cwd(), 'node_modules' )
			}
		} )
	],
};
