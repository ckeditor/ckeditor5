/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import PO from 'pofile';
import { writeFile, readdirSync, readFile, mkdir } from 'node:fs';
import _ from 'lodash-es';

/**
  * @param pathToSearchIn Path where start to search the directories.
 * @returns List of directory names.
 */
export function listDirectories( pathToSearchIn ) {
	return readdirSync( pathToSearchIn, { withFileTypes: true } )
		.filter( item => item.isDirectory() )
		.map( item => item.name );
}

/**
 * @param fileContent Data from `po` file parsed by `PO.parse`.
 * @returns String containing plural function.
 */
function getPluralFunction( fileContent ) {
	const pluralForm = fileContent.headers[ 'Plural-Forms' ];

	if ( pluralForm.indexOf( ' plural=' ) !== -1 ) {
		const pluralFormStringFunction = pluralForm.substring( pluralForm.indexOf( ' plural=' ) + ' plural='.length );

		return `function(n) {return ${ pluralFormStringFunction } }`;
	}

	return null;
}

/**
 * @param fileContent Data from `po` file parsed by `PO.parse`.
 * @returns translations as an object with structure like this: `{ msgid: msgstr }`
 */
function convertPoIntoJson( fileContent ) {
	const dictionary = {};

	if ( fileContent.items.length === 0 ) {
		return;
	}

	for ( const item of fileContent.items ) {
		dictionary[ item.msgid ] = item.msgstr.length === 1 ? item.msgstr[ 0 ] : item.msgstr;
	}

	return { dictionary };
}

/**
 * @param directoryName Name of the directory to create.
 * @returns Promise with created directory name.
 */
export async function createDirectory( directoryName ) {
	return new Promise( ( resolve, reject ) => {
		mkdir( directoryName, { recursive: true }, err => {
			if ( err ) {
				reject( err );
				throw err;
			}

			resolve( directoryName );
		} );
	} );
}

/**
 * @param filePath Path for file that will be read.
 * @param languageKey Language prefix.
 * @returns Promise with unified translation object.
 */
export function getSingleUnifiedTranslationObject( filePath, languageKey ) {
	return new Promise( ( resolve, reject ) => {
		readFile( filePath, 'utf-8', ( error, data ) => {
			if ( error ) {
				reject( error );
			}
			const parsedPoContent = PO.parse( data );

			if ( !parsedPoContent ) {
				resolve();
			}

			const dictionary = convertPoIntoJson( parsedPoContent );
			const pluralFunction = getPluralFunction( parsedPoContent );
			const translationObject = {};

			translationObject[ languageKey ] = dictionary;
			translationObject[ languageKey ].getPluralForm = pluralFunction;

			resolve( translationObject );
		} );
	} );
}

/**
 * @param translationsObject Object with translations where key is the language prefix.
 * @param banner CKEditor5 license banner.
 * @param targetPath Path where file will be saved.
 */
export function gatherDataAndSaveFile( translationsObject, banner, targetPath ) {
	const languageKeys = Object.keys( translationsObject );
	const promisesArray = [];

	languageKeys.forEach( languageKey => {
		const pluralFunction = translationsObject[ languageKey ].getPluralForm;

		delete translationsObject[ languageKey ].getPluralForm;

		const dataToWrite = `${ banner }

const translationObject = {};
translationObject[ '${ languageKey }' ] = ${ JSON.stringify( translationsObject[ languageKey ] ) };
translationObject[ '${ languageKey }' ].getPluralForm = ${ pluralFunction }

export default translationObject;\n`;

		promisesArray.push( new Promise( ( resolve, reject ) => {
			const pathToFile = `${ targetPath }/${ languageKey }.js`;
			writeFile(
				pathToFile,
				dataToWrite,
				{ encoding: 'utf8' },
				error => {
					if ( error ) {
						reject( error );
					}

					resolve( `"${ pathToFile }" created.` );
				} );
		} ) );
	} );

	return Promise.allSettled( promisesArray );
}

/**
 * @param ListOfObjectsToMerge Array of objects to merge.
 * @returns Merged object.
 */
export function mergeObjects( ListOfObjectsToMerge ) {
	return _.merge( ...ListOfObjectsToMerge );
}
