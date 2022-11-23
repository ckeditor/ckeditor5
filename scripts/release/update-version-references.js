#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

// This script updates the version of CKEditor 5 in the link to the classic editor
// build found here: https://github.com/ckeditor/ckeditor5#example-installation.
// It should be called as a post hook, after generating changelogs.

const fs = require( 'fs' );
const path = require( 'path' );
const chalk = require( 'chalk' );
const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );
const versionUtils = require( '@ckeditor/ckeditor5-dev-env/lib/release-tools/utils/versions' );

const FILES_TO_UPDATE = [ {
	path: [ 'README.md' ],
	regexp: /(?<=cdn\.ckeditor\.com\/ckeditor5\/)\d+\.\d+\.\d+(?=\/)/
}, {
	path: [ 'packages', 'ckeditor5-utils', 'src', 'version.ts' ],
	regexp: /(?<=const version = ')\d+\.\d+\.\d+(?=';)/
} ];

const cke5version = versionUtils.getLastFromChangelog();
let shouldCommit = false;

console.log( chalk.blue( 'Updating CKEditor5 version references.' ) );

for ( const file of FILES_TO_UPDATE ) {
	const relativePath = path
		.join( __dirname, '..', '..', ...file.path )
		.split( path.sep )
		.join( path.posix.sep );

	if ( !fs.existsSync( relativePath ) ) {
		console.log( chalk.red( `Defined file does not exist: ${ chalk.underline( relativePath ) }` ) );

		continue;
	}

	const oldFileContent = fs.readFileSync( relativePath, 'utf-8' );
	const newFileContent = oldFileContent.replace( file.regexp, cke5version );

	if ( oldFileContent === newFileContent ) {
		console.log( chalk.green( `This file is up to date: ${ chalk.underline( relativePath ) }` ) );

		continue;
	}

	shouldCommit = true;

	fs.writeFileSync( relativePath, newFileContent, 'utf-8' );
	exec( `git add ${ relativePath }` );

	console.log( chalk.green( `Updated file: ${ chalk.underline( relativePath ) }` ) );
}

if ( shouldCommit ) {
	exec( 'git commit -m "Internal: Updated CKEditor5 version references."' );

	console.log( chalk.green( `Updated CKEditor5 version references to ${ cke5version }.` ) );
} else {
	console.log( chalk.green( `Nothing to commit. CKEditor5 version references are up-to-date (${ cke5version }).` ) );
}

function exec( command ) {
	console.log( chalk.gray( `$ ${ command }` ) );

	return tools.shExec( command, { verbosity: 'error' } );
}
