/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* eslint-env node */

const path = require( 'path' );
const postCssImport = require( 'postcss-import' );
const postCssNext = require( 'postcss-cssnext' );
const cssnano = require( 'cssnano' );
const themeImporter = require( './themeimporter' );

module.exports = {
	plugins: [
		postCssImport(),
		themeImporter( {
			themePath: path.resolve( __dirname, 'node_modules/@ckeditor/ckeditor5-theme-lark' )
		} ),
		postCssNext( {
			// features: {
				// customProperties: {
				// 	variables: {
				// 		fg: "red",
				// 		bg: "green",
				// 		foo: "#456"
				// 	}
				// }
			// }
		} ),
		// cssnano( { autoprefixer: false } )
	]
};
