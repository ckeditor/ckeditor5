/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );

const ROOT_DIRECTORY = path.join( __dirname, '..', '..' );

module.exports = function buildApiDocs() {
	const config = getConfig();

	return require( '@ckeditor/ckeditor5-dev-docs' ).build( config );
};

/**
 * Prepares the configuration for the API docs builder.
 *
 * @returns {Object}
 */
function getConfig() {
	const commonConfig = {
		cwd: ROOT_DIRECTORY,
		outputPath: path.join( ROOT_DIRECTORY, 'docs', 'api', 'output.json' ),
		readmePath: 'README.md',
		validateOnly: process.argv.includes( '--validate-only' ),
		strict: process.argv.includes( '--strict' ),
		type: 'typedoc'
	};

	return {
		...commonConfig,
		tsconfig: path.join( ROOT_DIRECTORY, 'tsconfig.typedoc.json' ),
		sourceFiles: [
			// CKEditor 5 sources.
			'packages/ckeditor5-*/src/**/*.ts',
			'external/ckeditor5-commercial/packages/ckeditor5-*/src/**/*.ts',

			// Ignore libraries or generated files.
			'!packages/ckeditor5-*/src/lib/**/*.ts',
			'!external/ckeditor5-commercial/packages/ckeditor5-*/src/lib/**/*.ts',

			// Ignore not a direct sources.
			'!external/ckeditor5-commercial/packages/ckeditor5-operations-compressor/src/protobufdescriptions.ts',

			// Ignore builds.
			'!packages/ckeditor5-build-*/src/**/*.ts',
			'!external/ckeditor5-commercial/packages/ckeditor5-build-*/src/**/*.ts',

			// Ignore all declarations.
			'!packages/ckeditor5-*/src/**/*.d.ts',
			'!external/ckeditor5-commercial/packages/ckeditor5-*/src/**/*.d.ts',

			// Ignore augmentation files.
			'!packages/ckeditor5-*/src/augmentation.ts',
			'!external/ckeditor5-commercial/packages/ckeditor5-*/src/augmentation.ts'
		]
	};
}
