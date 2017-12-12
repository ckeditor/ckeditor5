/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );

const assertIsInstalled = require( './../utils/assertisinstalled' );

module.exports = function buildApiDocs() {
	assertIsInstalled( '@ckeditor/ckeditor5-dev-docs' );

	const ckeditor5Docs = require( '@ckeditor/ckeditor5-dev-docs' );

	return ckeditor5Docs
		.build( {
			readmePath: path.join( process.cwd(), 'README.md' ),
			sourceFiles: [
				process.cwd() + '/packages/ckeditor5-*/src/**/*.@(js|jsdoc)',
				'!' + process.cwd() + '/packages/ckeditor5-*/src/lib/**/*.js',
				'!' + process.cwd() + '/packages/ckeditor5-build-*/src/**/*.js'
			],
			validateOnly: process.argv.includes( '--validate-only' )
		} );
};
