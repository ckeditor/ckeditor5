/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

module.exports = function buildApiDocs() {
	const ckeditor5Docs = require( '@ckeditor/ckeditor5-dev-docs' );

	return ckeditor5Docs
		.build( {
			// Patterns that do not start with '/' are mounted onto process.cwd() path by default.
			readmePath: 'README.md',
			sourceFiles: [
				'packages/@(ckeditor|ckeditor5)-*/src/**/*.@(js|jsdoc)',
				'!packages/@(ckeditor|ckeditor5)-*/src/lib/**/*.js',
				'!packages/ckeditor5-build-*/src/**/*.js',
				'external/*/packages/@(ckeditor|ckeditor5)-*/src/**/*.@(js|jsdoc)',
				'!external/*/packages/@(ckeditor|ckeditor5)-*/src/lib/**/*.js',
				'!external/*/packages/ckeditor5-build-*/src/**/*.js'
			],
			validateOnly: process.argv.includes( '--validate-only' ),
			strict: process.argv.includes( '--strict' )
		} );
};
