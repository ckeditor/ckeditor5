#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import path from 'path';
import { build } from '@ckeditor/ckeditor5-dev-docs';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';

buildApiDocs()
	.catch( () => {
		process.exitCode = 1;
	} );

async function buildApiDocs() {
	console.log( 'Started building API.' );

	await build( {
		cwd: CKEDITOR5_ROOT_PATH,
		outputPath: path.join( CKEDITOR5_ROOT_PATH, 'docs', 'api', 'output.json' ),
		readmePath: 'README.md',
		validateOnly: process.argv.includes( '--validate-only' ),
		validatorOptions: {
			strict: process.argv.includes( '--strict' )
		},
		verbose: process.argv.includes( '--verbose' ),
		tsconfig: path.join( CKEDITOR5_ROOT_PATH, 'tsconfig.typedoc.json' ),
		sourceFiles: [
			// CKEditor 5 sources.
			'packages/ckeditor5-*/src/**/*.ts',
			'external/ckeditor5-commercial/packages/ckeditor5-*/src/**/*.ts'
		],
		ignoreFiles: [
			// Ignore libraries or generated files.
			'packages/ckeditor5-*/src/lib/**/*.ts',
			'external/ckeditor5-commercial/packages/ckeditor5-*/src/lib/**/*.ts',

			// Ignore not a direct sources.
			'external/ckeditor5-commercial/packages/ckeditor5-operations-compressor/src/protobufdescriptions.ts',

			// Ignore all declarations.
			'packages/ckeditor5-*/src/**/*.d.ts',
			'external/ckeditor5-commercial/packages/ckeditor5-*/src/**/*.d.ts',

			// Ignore augmentation files.
			'packages/ckeditor5-*/src/augmentation.ts',
			'external/ckeditor5-commercial/packages/ckeditor5-*/src/augmentation.ts'
		]
	} );

	console.log( 'Finished building API.' );
}
