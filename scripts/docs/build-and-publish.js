#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

/*

This script allows manually publishing docs on https://ckeditor5.github.io/docs/nightly/ckeditor5/latest/.

It assumes that ckeditor5.github.io is cloned next to ckeditor5.

*/

'use strict';

const path = require( 'path' );
const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );

const mainRepoUrl = 'https://github.com/CKEditor5/ckeditor5.github.io';

// The assumption here is that the script is called from ckeditor5/.
const projectVersion = require( path.join( process.cwd(), 'package.json' ) ).version;

console.log( 'Updating your ckeditor5.github.io clone...' );
exec( 'cd ../ckeditor5.github.io && git pull && cd -' );

console.log( 'Building documentation...' );
exec( 'yarn run docs --production' );

console.log( 'Copying files...' );

// Remove existing documentation.
exec( `rm -rf ../ckeditor5.github.io/docs/nightly/ckeditor5/${ projectVersion }` );
exec( 'rm -rf ../ckeditor5.github.io/docs/nightly/ckeditor5/latest' );

// Copy built documentation to the new destination.
exec( 'cp -R build/docs/* ../ckeditor5.github.io/docs/nightly/' );

// Umberto makes a symlink between the latest version (`projectVersion`) and "latest/" directory.
// The symlink must be deleted in order to copy a documentation for `projectVersion` as `latest`.
exec( 'rm -rf ../ckeditor5.github.io/docs/nightly/ckeditor5/latest' );

// Copy the versioned documentation to latest/.
exec( `cp -R ../ckeditor5.github.io/docs/nightly/ckeditor5/${ projectVersion } ../ckeditor5.github.io/docs/nightly/ckeditor5/latest` );

process.chdir( path.join( process.cwd(), '..', 'ckeditor5.github.io' ) );

// Commit the documentation.
if ( exec( 'git diff --name-only docs/' ).trim().length ) {
	exec( 'git add docs/' );
	exec( 'git commit -m "Documentation build."' );
	exec( 'git push origin master --quiet' );

	const lastCommit = exec( 'git log -1 --format="%h"' );
	console.log( `Successfully published the documentation under ${ mainRepoUrl }/commit/${ lastCommit }` );
} else {
	console.log( 'Nothing to commit. Documentation is up to date.' );
}

process.chdir( path.join( process.cwd(), '..', 'ckeditor5' ) );

function exec( command ) {
	try {
		return tools.shExec( command, { verbosity: 'error' } );
	}
	catch ( error ) {
		console.error( error );

		process.exit( 1 );
	}
}
