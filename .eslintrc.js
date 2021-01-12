/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs' );

const dllPackages = fs.readdirSync( 'src' ).map( directory => directory.replace( /\.js$/, '' ) );

module.exports = {
	extends: 'ckeditor5',
	settings: {
		dllPackages
	},
	rules: {
		'ckeditor5-rules/ckeditor-dll-import': 'error'
	},
	overrides: [
		{
			files: [ '**/tests/**/*.js' ],
			rules: {
				'no-unused-expressions': 'off',
				'ckeditor5-rules/ckeditor-dll-import': 'off'
			}
		},
		{
			files: [ '**/docs/**/*.js' ],
			rules: {
				'ckeditor5-rules/ckeditor-dll-import': 'off'
			}
		}
	]
};
