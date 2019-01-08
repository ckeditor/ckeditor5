#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

/*

This script is to be used on CI to automatically clean up a repository which keeps the project's documentation.
See: https://github.com/ckeditor/ckeditor5/issues/1392.

*/

// Clean up the repository should be done only for builds on master branch...
if ( process.env.TRAVIS_BRANCH !== 'master' ) {
	process.exit();
}

// ...and when the job was triggered by Cron.
if ( process.env.TRAVIS_EVENT_TYPE !== 'cron' ) {
	process.exit();
}

// Cron which triggered this task is being executed daily.
// Since we want to clean up the repository one per mounth, we need to add an additional check.
if ( new Date().getDate() !== 10 ) {
	process.exit();
}

const fs = require( 'fs' );
const path = require( 'path' );
const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );
const ROOT_PATH = process.cwd();
const DOCS_PATH = path.join( ROOT_PATH, 'ckeditor5.github.io' );

const mainRepoUrl = 'https://github.com/CKEditor5/ckeditor5.github.io';

// The repository should be already cloned. But if it doesn't, let's clone it again.
if ( !fs.existsSync( DOCS_PATH ) ) {
	console.log( 'Cloning ckeditor5.github.io repository...' );
	exec( `git clone ${ mainRepoUrl }.git` );
}

// Change work directory in order to make a commit in CKEditor 5 page's repository.
process.chdir( DOCS_PATH );

exec( `echo "https://${ process.env.GITHUB_TOKEN }:@github.com" > .git/credentials 2> /dev/null` );
exec( 'git config credential.helper "store --file=.git/credentials"' );

// Copy a commit which will be a new root in the repository.
const commit = exec( 'git log --oneline --reverse -5 --format="%h" | head -n 1' ).trim();

// Checkout to the status of the git repo at commit. Create a temporary branch.
exec( `git checkout --orphan temp ${ commit }` );

// Create a new commit that is to be the new root commit.
exec( 'git commit -m "Documentation build."' );

// Rebase the part of history from <commit> to master on the temporary branch.
exec( `git rebase --onto temp ${ commit } master` );

// Remove the temporary branch.
exec( 'git branch -D temp' );

// Pray.
exec( 'git push -f' );

// Change work directory to the previous value.
process.chdir( ROOT_PATH );

function exec( command ) {
	try {
		return tools.shExec( command, { verbosity: 'error' } );
	}
	catch ( error ) {
		console.error( error );

		process.exit( 1 );
	}
}
