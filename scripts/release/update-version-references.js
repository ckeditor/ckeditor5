#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs' );
const chalk = require( 'chalk' );
const upath = require( 'upath' );

const ROOT_DIRECTORY = upath.join( __dirname, '..', '..' );

/**
 * Updates CKEditor 5 version and release date references in several places.
 *
 * @param {Object} options
 * @param {String} options.version The version of CKEditor 5 to set.
 * @param {Date} options.releaseDate The release date to set.
 */
module.exports = function updateVersionReferences( { version, releaseDate } ) {
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

	console.log( chalk.blue( `Updating CKEditor 5 version (${ version }) and release date (${ releaseDate }) references.\n` ) );

	for ( const { file, pattern, value, label } of filesToUpdate ) {
		const absolutePath = upath.join( ROOT_DIRECTORY, file );

		if ( !fs.existsSync( absolutePath ) ) {
			console.log( chalk.red( `* File does not exist: "${ chalk.underline( absolutePath ) }" (${ label })` ) );

			continue;
		}

		const oldFileContent = fs.readFileSync( absolutePath, 'utf-8' );
		const newFileContent = oldFileContent.replace( pattern, value );

		if ( oldFileContent === newFileContent ) {
			console.log( chalk.gray( `* File is up to date: "${ chalk.underline( absolutePath ) }" (${ label })` ) );

			continue;
		}

		fs.writeFileSync( absolutePath, newFileContent, 'utf-8' );

		console.log( chalk.cyan( `* Updated file: "${ chalk.underline( absolutePath ) }" (${ label })` ) );
	}
};
