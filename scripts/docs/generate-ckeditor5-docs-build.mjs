/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { glob } from 'glob';
import upath from 'upath';
import fs from 'fs-extra';
import { generateCKEditor5BrowserBuild } from '../nim/utils.mjs';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';

export default async function generateCKEditor5DocsBuild( outputPath ) {
	await generateCKEditor5BrowserBuild( {
		cwd: CKEDITOR5_ROOT_PATH,
		output: outputPath,
		name: '',
		sourceMap: true,
		translations: 'packages/**/*.po',
		logLevel: 'silent'
	} );

	const globPatternsToRemove = [
		'translations/*.d.ts',
		'translations/*.umd.js',
		'ckeditor5-editor.css',
		'ckeditor5-content.css'
	];

	const filesToRemove = await glob( globPatternsToRemove, {
		cwd: upath.dirname( outputPath ),
		absolute: true
	} );

	const filesToRemovePromises = filesToRemove.map( file => fs.remove( file ) );

	await Promise.all( filesToRemovePromises );
}
