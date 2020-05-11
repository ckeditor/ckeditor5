/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );

module.exports = function buildApiDocs() {
	const ckeditor5Docs = require( '@ckeditor/ckeditor5-dev-docs' );

	return ckeditor5Docs
		.build( {
			readmePath: path.join( process.cwd(), 'README.md' ),
			sourceFiles: [
				process.cwd() + '/packages/@(ckeditor|ckeditor5)-*/src/**/*.@(js|jsdoc)',
				'!' + process.cwd() + '/packages/@(ckeditor|ckeditor5)-*/src/lib/**/*.js',
				'!' + process.cwd() + '/packages/ckeditor5-build-*/src/**/*.js',
				process.cwd() + '/external/**/packages/@(ckeditor|ckeditor5)-*/src/**/*.@(js|jsdoc)',
				'!' + process.cwd() + '/external/**/packages/@(ckeditor|ckeditor5)-*/src/lib/**/*.js',
				'!' + process.cwd() + '/external/**/packages/ckeditor5-build-*/src/**/*.js'
			],
			validateOnly: process.argv.includes( '--validate-only' )
		} );
};
