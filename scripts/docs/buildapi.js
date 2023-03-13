/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );
const parseArguments = require( './parse-arguments' );

const ROOT_DIRECTORY = path.join( __dirname, '..', '..' );

module.exports = function buildApiDocs() {
	const options = parseArguments( process.argv.slice( 2 ) );
	const type = options.ts ? 'typedoc' : 'jsdoc';
	const config = getConfig( type );

	return require( '@ckeditor/ckeditor5-dev-docs' ).build( config );
};

/**
 * Prepares the configuration for the API docs builder.
 *
 * @param {'jsdoc'|'typedoc'} type The requested API type to build.
 * @returns {Object}
 */
function getConfig( type ) {
	const commonConfig = {
		cwd: ROOT_DIRECTORY,
		outputPath: path.join( ROOT_DIRECTORY, 'docs', 'api', 'output.json' ),
		readmePath: 'README.md',
		validateOnly: process.argv.includes( '--validate-only' ),
		strict: process.argv.includes( '--strict' ),
		type
	};

	if ( type === 'typedoc' ) {
		return {
			...commonConfig,
			tsconfig: path.join( ROOT_DIRECTORY, 'tsconfig.typedoc.json' ),
			sourceFiles: [
				'packages/@(ckeditor|ckeditor5)-*/src/**/*.ts',
				'!packages/@(ckeditor|ckeditor5)-*/src/lib/**/*.ts',
				'!packages/ckeditor5-build-*/src/**/*.ts',
				'external/@(ckeditor5-internal|collaboration-features)/packages/@(ckeditor|ckeditor5)-*/src/**/*.ts',
				'!external/@(ckeditor5-internal|collaboration-features)/packages/@(ckeditor|ckeditor5)-*/src/lib/**/*.ts',
				'!external/@(ckeditor5-internal|collaboration-features)/packages/ckeditor5-build-*/src/**/*.ts'
			]
		};
	}

	return {
		...commonConfig,
		sourceFiles: [
			'packages/@(ckeditor|ckeditor5)-*/src/**/*.@(js|jsdoc)',
			'packages/@(ckeditor|ckeditor5)-*/_src/**/*.@(js|jsdoc)',
			'!packages/@(ckeditor|ckeditor5)-*/src/lib/**/*.js',
			'!packages/ckeditor5-build-*/src/**/*.js',
			'external/@(ckeditor5-internal|collaboration-features)/packages/@(ckeditor|ckeditor5)-*/src/**/*.@(js|jsdoc)',
			'external/@(ckeditor5-internal|collaboration-features)/packages/@(ckeditor|ckeditor5)-*/_src/**/*.@(js|jsdoc)',
			'!external/@(ckeditor5-internal|collaboration-features)/packages/@(ckeditor|ckeditor5)-*/src/lib/**/*.js',
			'!external/@(ckeditor5-internal|collaboration-features)/packages/ckeditor5-build-*/src/**/*.js'
		]
	};
}
