#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs' );
const { generateChangelogForMonoRepository } = require( '@ckeditor/ckeditor5-dev-release-tools' );
const { PACKAGES_DIRECTORY, CKEDITOR5_ROOT_PATH, CKEDITOR5_COMMERCIAL_PATH } = require( './utils/constants' );
const parseArguments = require( './utils/parsearguments' );

const cliArguments = parseArguments( process.argv.slice( 2 ) );

if ( !fs.existsSync( CKEDITOR5_COMMERCIAL_PATH ) ) {
	throw new Error( `The script assumes that the directory "${ CKEDITOR5_COMMERCIAL_PATH }" exists.` );
}

const changelogOptions = {
	cwd: CKEDITOR5_ROOT_PATH,
	packages: PACKAGES_DIRECTORY,
	releaseBranch: cliArguments.branch,
	transformScope: name => {
		if ( name === 'ckeditor5' ) {
			return 'https://www.npmjs.com/package/ckeditor5';
		}

		if ( name === 'build-*' ) {
			return 'https://www.npmjs.com/search?q=keywords%3Ackeditor5-build%20maintainer%3Ackeditor';
		}

		if ( name === 'editor-*' ) {
			return 'https://www.npmjs.com/search?q=keywords%3Ackeditor5-editor%20maintainer%3Ackeditor';
		}

		if ( name === 'letters' ) {
			return 'https://www.npmjs.com/package/@ckeditor/letters';
		}

		return 'https://www.npmjs.com/package/@ckeditor/ckeditor5-' + name;
	},
	externalRepositories: [
		{
			cwd: CKEDITOR5_COMMERCIAL_PATH,
			packages: PACKAGES_DIRECTORY,
			skipLinks: true
		}
	]
};

if ( cliArguments.from ) {
	changelogOptions.from = cliArguments.from;
}

generateChangelogForMonoRepository( changelogOptions )
	.then( () => {
		console.log( 'Done!' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
