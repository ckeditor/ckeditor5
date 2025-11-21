#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import generateCKEditor5DocsBuild from '../generate-ckeditor5-docs-build.mjs';
import { DOCUMENTATION_ASSETS_PATH } from '../../constants.mjs';

try {
	console.log( 'Started building `ckeditor5`.' );

	await generateCKEditor5DocsBuild( upath.join( DOCUMENTATION_ASSETS_PATH, 'ckeditor5', 'ckeditor5.js' ) );

	console.log( 'Finished building `ckeditor5`.' );
} catch ( error ) {
	console.error( error );
	process.exitCode = 1;
}
