#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const devEnv = require( '@ckeditor/ckeditor5-dev-env' );

Promise.resolve()
	.then( () => devEnv.generateChangelogForSubRepositories( {
		cwd: process.cwd(),
		packages: 'packages',
		highlightsPlaceholder: true,
		collaborationFeatures: true,
		from: '87c56114028c00b1e45b6ecba3bead575c6c1afe', // TODO: Remove the line after the nearest release.
		transformScope: name => {
			if ( name === 'ckeditor5' ) {
				return 'https://www.npmjs.com/package/ckeditor5';
			}

			if ( name === 'build-*' ) {
				return 'https://www.npmjs.com/search?q=keywords%3Ackeditor5-build%20maintainer%3Ackeditor';
			}

			if ( name === 'cloud-services-core' ) {
				return 'https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core';
			}

			return 'https://www.npmjs.com/package/@ckeditor/ckeditor5-' + name;
		}
	} ) )
	.then( () => {
		console.log( 'Done!' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
