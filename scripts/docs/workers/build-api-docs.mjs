#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { workerData } from 'node:worker_threads';
import path from 'node:path';
import { build } from '@ckeditor/ckeditor5-dev-docs';
import { CKEDITOR5_ROOT_PATH } from '../../constants.mjs';

try {
	console.log( 'Started building API.' );

	await build( {
		cwd: CKEDITOR5_ROOT_PATH,
		outputPath: path.join( CKEDITOR5_ROOT_PATH, 'docs', 'api', 'output.json' ),
		readmePath: 'README.md',
		validateOnly: workerData.validateOnly,
		validatorOptions: {
			strict: workerData.strict
		},
		verbose: workerData.verbose,
		tsconfig: path.join( CKEDITOR5_ROOT_PATH, 'tsconfig.typedoc.json' ),
		sourceFiles: [
			// CKEditor 5 sources.
			'packages/ckeditor5-*/src/**/*.ts',
			'../../packages/ckeditor5-*/src/**/*.ts'
		],
		ignoreFiles: [
			// Ignore libraries or generated files.
			'packages/ckeditor5-*/src/lib/**/*.ts',
			'../../packages/ckeditor5-*/src/lib/**/*.ts',

			// Ignore not a direct sources.
			'../../packages/ckeditor5-operations-compressor/src/protobufdescriptions.ts',

			// Ignore all declarations.
			'packages/ckeditor5-*/src/**/*.d.ts',
			'../../packages/ckeditor5-*/src/**/*.d.ts',

			// Ignore augmentation files.
			'packages/ckeditor5-*/src/augmentation.ts',
			'../../packages/ckeditor5-*/src/augmentation.ts',

			// Ignore the main ckeditor5 package.
			'packages/ckeditor5/**/*'
		]
	} );

	console.log( 'Finished building API.' );
} catch ( error ) {
	console.error( error );
	process.exitCode = 1;
}
