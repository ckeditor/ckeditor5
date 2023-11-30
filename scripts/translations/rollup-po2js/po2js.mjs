/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */
import { readdirSync, existsSync } from 'node:fs';
import path from 'path';
import chalk from 'chalk';

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
	const translationsTargetDirectoryPath = options.destDirectory || `${ cwd }/dist/translations`;
	const po2jsType = options.type || 'single';
	const translationsSourceDirectoryPath = options.sourceDirectory || `${ cwd }/lang/translations`;
	const banner = options.banner || '';

	return {
		name: 'rollup-plugin-cke5-po2js',
		async buildEnd() {
			let languageDirectoriesList = [];

			if ( po2jsType === 'all' ) {
				const packagesList = listDirectories( `${ cwd }/packages/` );
				languageDirectoriesList = packagesList.map( directoryName => `${ cwd }/packages/${ directoryName }/lang/translations` );
			} else {
				languageDirectoriesList.push( translationsSourceDirectoryPath );
			}

			const promisesArray = [];

			languageDirectoriesList.forEach( languageDirectory => {
				if ( !existsSync( languageDirectory ) ) {
					return null;
				}

				const translationFilesFromDirectory = readdirSync( languageDirectory );

				for ( const translationFile of translationFilesFromDirectory ) {
					const fullPath = path.resolve( languageDirectory, translationFile );
					const languageKey = translationFile.split( '.' )[ 0 ];

					if ( fullPath.endsWith( '.po' ) ) {
						promisesArray.push( getSingleUnifiedTranslationObject( fullPath, languageKey ) );
					}
				}
			} );

			const listOfUnifiedTranslationObjects = await Promise.all( promisesArray );

			if ( !existsSync( translationsTargetDirectoryPath ) ) {
				await createDirectory( translationsTargetDirectoryPath );
			}

			const mergedTranslationObject = mergeObjects( listOfUnifiedTranslationObjects );

			gatherDataAndSaveFile( mergedTranslationObject, banner, translationsTargetDirectoryPath )
				.then( results => {
					results.forEach( result => {
						if ( result.status === 'rejected' ) {
							console.log( chalk.red( JSON.stringify( result.reason ) ) );
						} else {
							console.log( chalk.green( result.value ) );
						}
					} );
				} );

			return null;
		}
	};
}
