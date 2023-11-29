/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */
import { readdirSync, existsSync } from 'node:fs';
import path from 'path';

import {
	listDirectories,
	createDirectory,
	getSingleUnifiedTranslationObject,
	gatherDataAndSaveFile,
	mergeObjects
} from './utils.mjs';

// Current working directory
const cwd = process.cwd();

export default function po2js( options = {} ) {
	const translationsTargetFolderPath = options.destFolder || `${ cwd }/dist/translations`;
	const po2jsType = options.type || 'single';
	const translationsSourceFolderPath = options.sourceFolder || `${ cwd }/lang/translations`;
	const banner = options.banner || '';

	return {
		name: 'rollup-plugin-cke5-po2js',
		async buildEnd() {
			let languageDirectoriesList = [];

			if ( po2jsType === 'all' ) {
				const packagesList = listDirectories( `${ cwd }/packages/` );
				languageDirectoriesList = packagesList.map( directoryName => `${ cwd }/packages/${ directoryName }/lang/translations` );
			} else {
				languageDirectoriesList.push( translationsSourceFolderPath );
			}
			const promisesArray = [];

			languageDirectoriesList.forEach( languageDirectory => {
				if ( !existsSync( languageDirectory ) ) {
					return null;
				}

				const translationFilesFromFolder = readdirSync( languageDirectory );

				for ( const translationFile of translationFilesFromFolder ) {
					const fullPath = path.resolve( languageDirectory, translationFile );
					const languageKey = translationFile.split( '.' )[ 0 ];

					if ( fullPath.endsWith( '.po' ) ) {
						promisesArray.push( getSingleUnifiedTranslationObject( fullPath, languageKey ) );
					}
				}
			} );

			const listOfUnifiedTranslationObjects = await Promise.all( promisesArray );

			if ( !existsSync( translationsTargetFolderPath ) ) {
				await createDirectory( translationsTargetFolderPath );
			}

			const mergedTranslationObject = mergeObjects( listOfUnifiedTranslationObjects );

			gatherDataAndSaveFile( mergedTranslationObject, banner, translationsTargetFolderPath );

			return null;
		}
	};
}
