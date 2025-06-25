/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import fs from 'fs/promises';
import upath from 'upath';
import { CKEDITOR5_ROOT_PATH } from '../../constants.mjs';

/**
 * Updates CKEditor 5 version and release date references in several places.
 *
 * @param {Object} options
 * @param {String} options.version The version of CKEditor 5 to set.
 * @param {Date} options.releaseDate The release date to set.
 * @returns {Promise.<Array.<String>>} An array of relative paths to updated files.
 */
export default async function updateVersionReferences( { version, releaseDate } ) {
	const filesToUpdate = [
		{
			file: 'README.md',
			pattern: /(?<=cdn\.ckeditor\.com\/ckeditor5\/)\d+\.\d+\.\d+(?=\/)/,
			value: version,
			// Update CDN URL only when releasing a stable release.
			skip: !version.match( /^\d+.\d+.\d+$/ )
		},
		{
			file: upath.join( 'packages', 'ckeditor5-utils', 'src', 'version.ts' ),
			pattern: /(?<=const version = ')[^']+(?=';)/,
			value: version
		},
		{
			file: upath.join( 'packages', 'ckeditor5-utils', 'src', 'version.ts' ),
			pattern: /(?<=const releaseDate = new Date\( )\d+, \d+, \d+(?= \);)/,
			value: `${ releaseDate.getFullYear() }, ${ releaseDate.getMonth() }, ${ releaseDate.getDate() }`
		}
	];

	const updatedFiles = new Set();

	for ( const { file, pattern, value, skip } of filesToUpdate ) {
		if ( skip ) {
			continue;
		}

		const absolutePath = upath.join( CKEDITOR5_ROOT_PATH, file );

		if ( !( await checkFileExists( absolutePath ) ) ) {
			continue;
		}

		const oldFileContent = await fs.readFile( file, 'utf-8' );
		const newFileContent = oldFileContent.replace( pattern, value );

		if ( oldFileContent === newFileContent ) {
			continue;
		}

		await fs.writeFile( absolutePath, newFileContent );
		updatedFiles.add( file );
	}

	return [ ...updatedFiles ];
}

function checkFileExists( file ) {
	return fs.access( file, fs.constants.F_OK )
		.then( () => true )
		.catch( () => false );
}
