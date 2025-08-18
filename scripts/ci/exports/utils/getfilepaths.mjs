/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import { globSync } from 'glob';
import { CKEDITOR5_COMMERCIAL_PATH, CKEDITOR5_ROOT_PATH } from '../../../constants.mjs';

// Prepare absolute paths to TypeScript files to be used in the declaration generation process.
export function getFilePaths() {
	const typeScriptFilesGlobPaths = [
		upath.join( CKEDITOR5_ROOT_PATH, 'packages/*/src/**/*.ts' ),
		upath.join( CKEDITOR5_COMMERCIAL_PATH, 'packages/*/src/**/*.ts' )

		// The below might be included but it is not needed as it's partly an external package
		// and possible missing re-exports would need to be re-exported by some other package.
		// upath.join( process.cwd(), 'external/ckeditor-cloud-services-collaboration/src/**/*.ts' )
	];

	return globSync( typeScriptFilesGlobPaths )
		.map( upath.normalize )
		.filter( file => file.includes( 'ckeditor-cloud-services-collaboration' ) || !file.endsWith( '.d.ts' ) )
		.filter( file => !file.includes( 'packages/ckeditor5/' ) )
		.filter( file => !file.includes( 'ckeditor5-build' ) )
		.filter( file => !file.includes( 'ckeditor5-icons/' ) )
		.filter( file => !file.includes( 'ckeditor5-operations-compressor/' ) )
		.filter( file => !file.includes( 'ckeditor5-collaboration/' ) ) // DLL re-exports
		.filter( file => !file.includes( 'ckeditor5-premium-features/' ) ) // NIM re-exports
		.sort();
}
