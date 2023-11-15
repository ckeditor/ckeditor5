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
				const fullTargetPath = path.resolve( translationsTargetFolderPath, translationFile.split( '.' )[ 0 ] + '.js' );

				if ( fullPath.endsWith( '.po' ) ) {
					po2json( fullPath, fullTargetPath, banner );
				}
			}

			if ( translationFilesFromFolder.length ) {
				console.log( `${ translationFilesFromFolder.length } translation files were successfully converted.` );
			}

			return null;
		}
	};
}

function po2json( filePath, targetPath, banner ) {
	PO.load( filePath, function( err, pof ) {
		const translationsObject = convertPoIntoJson( pof );
		const dataToWrite = `${ banner }\n\nexport default ${ JSON.stringify( translationsObject ) };\n`;

		writeFile( targetPath, dataToWrite, { encoding: 'utf8' }, err => {
			if ( err ) {
				console.log( err );
			} /* else {
				console.log( 'File written successfully' );
				console.log( fs.readFileSync( targetPath, 'utf8' ) );
			} */
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
	const translationsObject = {};

	for ( const item of fileContent.items ) {
		translationsObject[ item.msgid ] = item.msgstr[ 0 ];
	}

	return translationsObject;
}
