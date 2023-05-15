#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs/promises' );
const { yellow, cyan, underline } = require( 'chalk' );
const upath = require( 'upath' );
const ROOT_DIRECTORY = upath.join( __dirname, '..', '..' );

/**
 * Updates CKEditor 5 version and release date references in several places.
 *
 * @param {Object} options
 * @param {String} options.version The version of CKEditor 5 to set.
 * @param {Date} options.releaseDate The release date to set.
 * @returns {Promise.<Array.<String>>} An array of relative paths to updated files.
 */
module.exports = async function updateVersionReferences( { version, releaseDate } ) {
	const filesToUpdate = [
		{
			label: 'CDN',
			file: 'README.md',
			pattern: /(?<=cdn\.ckeditor\.com\/ckeditor5\/)\d+\.\d+\.\d+(?=\/)/,
			value: version
		},
		{
			label: 'version',
			file: upath.join( 'packages', 'ckeditor5-utils', 'src', 'version.ts' ),
			pattern: /(?<=const version = ')\d+\.\d+\.\d+(?=';)/,
			value: version
		},
		{
			label: 'release date',
			file: upath.join( 'packages', 'ckeditor5-utils', 'src', 'version.ts' ),
			pattern: /(?<=const releaseDate = new Date\( )\d+, \d+, \d+(?= \);)/,
			value: `${ releaseDate.getFullYear() }, ${ releaseDate.getMonth() }, ${ releaseDate.getDate() }`
		}
	];

	const updatedFiles = new Set();

	for ( const { file, pattern, value, label } of filesToUpdate ) {
		const absolutePath = upath.join( ROOT_DIRECTORY, file );

		const oldFileContent = await fs.readFile( absolutePath, 'utf-8' )
			.catch( () => {
				console.log( yellow( `* File does not exist: "${ underline( file ) }" (${ label })` ) );
			} );

		if ( !oldFileContent ) {
			continue;
		}

		const newFileContent = oldFileContent.replace( pattern, value );

		if ( oldFileContent === newFileContent ) {
			console.log( `* File is up to date: "${ underline( file ) }" (${ label })` );
			continue;
		}

		await fs.writeFile( file, newFileContent, 'utf-8' );
		console.log( cyan( `* Updated file: "${ underline( file ) }" (${ label })` ) );

		updatedFiles.add( file );
	}

	return [ ...updatedFiles ];
};
