#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );
const fs = require( 'fs' );
const { generateChangelogForMonoRepository } = require( '@ckeditor/ckeditor5-dev-release-tools' );

const CKEDITOR5_INTERNAL_PATH = path.resolve( __dirname, '..', '..', 'external', 'ckeditor5-internal' );
const COLLABORATION_FEATURES_PATH = path.resolve( __dirname, '..', '..', 'external', 'collaboration-features' );

if ( !fs.existsSync( CKEDITOR5_INTERNAL_PATH ) ) {
	throw new Error( `The script assumes that the directory "${ CKEDITOR5_INTERNAL_PATH }" exists.` );
}

if ( !fs.existsSync( COLLABORATION_FEATURES_PATH ) ) {
	throw new Error( `The script assumes that the directory "${ COLLABORATION_FEATURES_PATH }" exists.` );
}

Promise.resolve()
	.then( () => generateChangelogForMonoRepository( {
		cwd: process.cwd(),
		packages: 'packages',
		releaseBranch: 'release',
		from: 'v37.0.0-alpha.2',
		highlightsPlaceholder: true,
		transformScope: name => {
			if ( name === 'ckeditor5' ) {
				return 'https://www.npmjs.com/package/ckeditor5';
			}

			if ( name === 'build-*' ) {
				return 'https://www.npmjs.com/search?q=keywords%3Ackeditor5-build%20maintainer%3Ackeditor';
			}

			if ( name === 'letters' ) {
				return 'https://www.npmjs.com/package/@ckeditor/letters';
			}

			return 'https://www.npmjs.com/package/@ckeditor/ckeditor5-' + name;
		}
		// Temporary, as we publish only packages from the `ckeditor/ckeditor5` repository.
		// externalRepositories: [
		// 	{
		// 		cwd: CKEDITOR5_INTERNAL_PATH,
		// 		packages: 'packages',
		// 		skipLinks: true,
		// 		from: 'v36.0.1' // TODO: To be removed once a new major version is live.
		// 	},
		// 	{
		// 		cwd: COLLABORATION_FEATURES_PATH,
		// 		packages: 'packages',
		// 		skipLinks: true,
		// 		from: 'v36.0.1' // TODO: To be removed once a new major version is live.
		// 	}
		// ]
	} ) )
	.then( () => {
		console.log( 'Done!' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
