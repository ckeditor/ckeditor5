/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */
import PO from 'pofile';
import { writeFile, readdirSync, mkdir, existsSync } from 'node:fs';
import path from 'path';

// Current working directory
const cwd = process.cwd();

export default function po2js( options = {} ) {
	const translationsSourceFolderPath = options.sourceFolder || `${ cwd }/lang/translations`;
	const translationsTargetFolderPath = options.destFolder || `${ cwd }/dist/translations`;
	const banner = options.banner || '';

	return {
		name: 'ck5-po2js',
		async buildEnd() {
			if ( !existsSync( translationsSourceFolderPath ) ) {
				return null;
			}

			if ( !existsSync( translationsTargetFolderPath ) ) {
				await createDestDir( translationsTargetFolderPath );
			}

			const translationFilesFromFolder = readdirSync( translationsSourceFolderPath );

			for ( const translationFile of translationFilesFromFolder ) {
				const fullPath = path.resolve( translationsSourceFolderPath, translationFile );
				const languageKey = translationFile.split( '.' )[ 0 ];
				const fullTargetPath = path.resolve( translationsTargetFolderPath, languageKey + '.js' );

				if ( fullPath.endsWith( '.po' ) ) {
					po2json( fullPath, fullTargetPath, languageKey, banner );
				}
			}

			if ( translationFilesFromFolder.length ) {
				console.log( `${ translationFilesFromFolder.length } translation files were successfully converted.` );
			}

			return null;
		}
	};
}

function po2json( filePath, targetPath, languageKey, banner ) {
	PO.load( filePath, function( err, pof ) {
		const translationsObject = convertPoIntoJson( pof );

		if ( !translationsObject ) {
			return;
		}

		const pluralFunction = getPluralFunction( pof );
		const dataToWrite = `${ banner }

const translationObject = {};
translationObject[ '${ languageKey }' ] = ${ JSON.stringify( translationsObject ) };
translationObject[ '${ languageKey }' ].getPluralForm = ${ pluralFunction }

export default translationObject;\n`;

		writeFile( targetPath, dataToWrite, { encoding: 'utf8' }, err => {
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
