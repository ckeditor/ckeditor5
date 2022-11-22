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

const FILES_TO_UPDATE = [ 'README.md' ];

const cke5version = versionUtils.getLastFromChangelog();

console.log( chalk.blue( 'Updating CKEditor5 version in CDN links.' ) );

for ( const filePath of FILES_TO_UPDATE ) {
	const relativePath = path.join( __dirname, '..', '..', filePath ).split( path.sep ).join( path.posix.sep );

	if ( !fs.existsSync( relativePath ) ) {
		console.log( chalk.red( `Missing file: ${ chalk.underline( relativePath ) }` ) );

		continue;
	}

	const oldFileContent = fs.readFileSync( relativePath, 'utf-8' );
	const newFileContent = oldFileContent.replace( /(?<=cdn\.ckeditor\.com\/ckeditor5\/).*?(?=\/)/, cke5version );
	fs.writeFileSync( relativePath, newFileContent, 'utf-8' );

	exec( `git add ${ relativePath }` );

	console.log( chalk.green( `Updated file: ${ chalk.underline( relativePath ) }` ) );
}

const wereFilesModified = exec( 'git status -s' ).trim().length;

if ( wereFilesModified ) {
	exec( 'git add src/version.ts' );
	exec( 'git commit -m "Internal: Updated version of CKEditor 5 in the CDN links."' );

	console.log( chalk.green( `Updated version of CKEditor5 in the CDN links to ${ cke5version }.` ) );
} else {
	console.log( chalk.yellow( `Nothing to commit. Version of CKEditor5 in the CDN links is up-to-date (${ cke5version }).` ) );
}

function exec( command ) {
	return tools.shExec( command, { verbosity: 'error' } );
}
