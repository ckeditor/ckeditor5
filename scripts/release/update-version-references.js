#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const chalk = require( 'chalk' );
const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );
const { getLastFromChangelog } = require( '@ckeditor/ckeditor5-dev-release-tools' );

// This script updates the version of CKEditor 5 in several places.
//
// It should be called as a post hook, after generating the changelog.

const ROOT_DIRECTORY = path.join( __dirname, '..', '..' );

const cke5version = getLastFromChangelog();
const currentDate = new Date();

const ENTRIES_TO_UPDATE = [
	{
		label: 'CDN',
		file: 'README.md',
		pattern: /(?<=cdn\.ckeditor\.com\/ckeditor5\/)\d+\.\d+\.\d+(?=\/)/,
		value: cke5version
	},
	{
		label: 'version',
		file: path.join( 'packages', 'ckeditor5-utils', 'src', 'version.ts' ),
		pattern: /(?<=const version = ')\d+\.\d+\.\d+(?=';)/,
		value: cke5version
	},
	{
		label: 'release date',
		file: path.join( 'packages', 'ckeditor5-utils', 'src', 'version.ts' ),
		pattern: /(?<=const releaseDate = new Date\( )\d+, \d+, \d+(?= \);)/,
		value: `${ currentDate.getFullYear() }, ${ currentDate.getMonth() }, ${ currentDate.getDate() }`
	}
];

let shouldCommit = false;

console.log( chalk.blue( 'Updating CKEditor 5 version and release date references.\n' ) );

for ( const { file, pattern, value, label } of ENTRIES_TO_UPDATE ) {
	const absolutePath = path.join( ROOT_DIRECTORY, file ).split( path.sep ).join( path.posix.sep );

	if ( !fs.existsSync( absolutePath ) ) {
		console.log( chalk.red( `* Defined file does not exist: "${ chalk.underline( absolutePath ) }"` ) );

		continue;
	}

	const oldFileContent = fs.readFileSync( absolutePath, 'utf-8' );
	const newFileContent = oldFileContent.replace( pattern, value );

	if ( oldFileContent === newFileContent ) {
		console.log( chalk.gray( `* This file is up to date: "${ chalk.underline( absolutePath ) }" (${ label })` ) );

		continue;
	}

	shouldCommit = true;

	fs.writeFileSync( absolutePath, newFileContent, 'utf-8' );
	exec( `git add ${ absolutePath }` );

	console.log( chalk.cyan( `* Updated file: "${ chalk.underline( absolutePath ) }" (${ label })` ) );
}

if ( shouldCommit ) {
	exec( 'git commit -m "Internal: Updated CKEditor 5 version references."' );

	console.log( chalk.green( `\nUpdated CKEditor 5 version references to ${ cke5version }.` ) );
} else {
	console.log( chalk.green( `\nNothing to commit. CKEditor 5 version references are up-to-date (${ cke5version }).` ) );
}

function exec( command ) {
	console.log( chalk.gray( `$ ${ command }` ) );

	return tools.shExec( command, { verbosity: 'error' } );
}
