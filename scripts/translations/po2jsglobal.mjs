/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */
import PO from 'pofile';
import { writeFile, readdirSync, readFile, mkdir, existsSync } from 'node:fs';
import path from 'path';
import _ from 'lodash-es';

// Current working directory
const cwd = process.cwd();

const globalTranslationsObject = {};
const globalPluralObject = {};

export default function po2jsglobal( options = {} ) {
	const translationsTargetFolderPath = options.destFolder || `${ cwd }/dist/translations`;
	const banner = options.banner || '';

	return {
		name: 'ck5-po2jsglobal',
		async buildEnd() {
			const packagesList = listDirectories( `${ cwd }/packages/` );
			const languageDirectoriesList = packagesList.map( directoryName => `${ cwd }/packages/${ directoryName }/lang/translations` );
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
						promisesArray.push( parseFile( fullPath, languageKey ) );
					}
				}
			} );

			await Promise.all( promisesArray );

			if ( !existsSync( translationsTargetFolderPath ) ) {
				await createDestDir( translationsTargetFolderPath );
			}

			createTranslationFiles( globalTranslationsObject, globalPluralObject, banner, translationsTargetFolderPath );

			return null;
		}
	};
}

function parseFile( filePath, languageKey ) {
	return new Promise( ( resolve, reject ) => {
		readFile( filePath, 'utf-8', ( error, data ) => {
			if ( error ) {
				reject( error );
			}
			const parsedPoContent = PO.parse( data );

			if ( !parsedPoContent ) {
				resolve();
			}

			addToGlobalTranslationObject( parsedPoContent, languageKey );

			resolve( parsedPoContent );
		} );
	} );
}

function createTranslationFiles( translations, plurals, banner, targetPath ) {
	const languageKeys = Object.keys( translations );

	languageKeys.forEach( languageKey => {
		const pluralFunction = plurals[ languageKey ];
		const dataToWrite = `${ banner }

const translationObject = {};
translationObject[ '${ languageKey }' ] = ${ JSON.stringify( translations[ languageKey ] ) };
translationObject[ '${ languageKey }' ].getPluralForm = ${ pluralFunction }

export default translationObject;\n`;

		writeFile(
			`${ targetPath }/${ languageKey }.js`,
			dataToWrite,
			{ encoding: 'utf8' },
			err => {
				if ( err ) {
					console.log( err );
				}
			} );
	} );
}

async function createDestDir( dirName ) {
	return new Promise( ( resolve, reject ) => {
		mkdir( dirName, { recursive: true }, err => {
			if ( err ) {
				console.log( 'error', dirName );
				reject( err );
				throw err;
			}

			resolve( dirName );
		} );
	} );
}

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

function getPluralFunction( fileContent ) {
	const pluralForm = fileContent.headers[ 'Plural-Forms' ];

	if ( pluralForm.indexOf( ' plural=' ) !== -1 ) {
		const pluralFormStringFunction = pluralForm.substring( pluralForm.indexOf( ' plural=' ) + ' plural='.length );

		return `function(n) {return ${ pluralFormStringFunction } }`;
	}

	return null;
}

function listDirectories( pathToSearchIn ) {
	return readdirSync( pathToSearchIn, { withFileTypes: true } )
		.filter( dirent => dirent.isDirectory() )
		.map( dirent => dirent.name );
}

function addToGlobalTranslationObject( data, prefix ) {
	const dictionary = convertPoIntoJson( data );
	const pluralFunction = getPluralFunction( data );
	const existData = prefix in globalTranslationsObject ? globalTranslationsObject[ prefix ] : {};

	const mergedData = _.merge( dictionary, existData );
	globalTranslationsObject[ prefix ] = mergedData;
	globalPluralObject[ prefix ] = pluralFunction;

	return globalTranslationsObject;
}
