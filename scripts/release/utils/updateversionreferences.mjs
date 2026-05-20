/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import fs from 'node:fs/promises';
import upath from 'upath';
import { CKEDITOR5_ROOT_PATH } from '../../constants.mjs';

/**
 * Files that may have CKEditor 5 version / release-date references replaced during a release.
 * Paths are relative to `CKEDITOR5_ROOT_PATH` (`external/ckeditor5/` in the merged monorepo).
 *
 * Each entry's `value` and `skip` are callbacks taking `{ version, releaseDate }`, so the
 * structure can live at module scope and be consumed by `updateVersionReferences` below as
 * well as exported (see `VERSION_REFERENCE_FILES`) for the post-merge single-commit release
 * flow in `ckeditor5-commercial/scripts/release/preparepackages.mjs`.
 */
const FILES_TO_UPDATE = [
	{
		file: 'README.md',
		pattern: /(?<=cdn\.ckeditor\.com\/ckeditor5\/)\d+\.\d+\.\d+(?=\/)/,
		value: ( { version } ) => version,
		// Update CDN URL only when releasing a stable release.
		skip: ( { version } ) => !version.match( /^\d+.\d+.\d+$/ )
	},
	{
		file: upath.join( 'packages', 'ckeditor5-utils', 'src', 'version.ts' ),
		pattern: /(?<=const version = ')[^']+(?=';)/,
		value: ( { version } ) => version
	},
	{
		file: upath.join( 'packages', 'ckeditor5-utils', 'src', 'version.ts' ),
		pattern: /(?<=const releaseDate = new Date\( )\d+, \d+, \d+(?= \);)/,
		value: ( { releaseDate } ) => `${ releaseDate.getFullYear() }, ${ releaseDate.getMonth() }, ${ releaseDate.getDate() }`
	}
];

/**
 * Deduplicated list of repo-relative paths covered by `updateVersionReferences`. Imported by the
 * commercial release script so the single post-merge commit captures every file this function
 * may modify, without having to maintain a parallel hand-written mirror.
 *
 * @type {Array.<string>}
 */
export const VERSION_REFERENCE_FILES = [ ...new Set( FILES_TO_UPDATE.map( entry => entry.file ) ) ];

/**
 * Updates CKEditor 5 version and release date references in several places.
 *
 * @param {Object} options
 * @param {String} options.version The version of CKEditor 5 to set.
 * @param {Date} options.releaseDate The release date to set.
 * @returns {Promise.<Array.<String>>} An array of relative paths to updated files.
 */
export default async function updateVersionReferences( { version, releaseDate } ) {
	const updatedFiles = new Set();

	for ( const { file, pattern, value, skip } of FILES_TO_UPDATE ) {
		if ( skip && skip( { version, releaseDate } ) ) {
			continue;
		}

		const absolutePath = upath.join( CKEDITOR5_ROOT_PATH, file );

		if ( !( await checkFileExists( absolutePath ) ) ) {
			continue;
		}

		const oldFileContent = await fs.readFile( file, 'utf-8' );
		const newFileContent = oldFileContent.replace( pattern, value( { version, releaseDate } ) );

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
