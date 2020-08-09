#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const devEnv = require( '@ckeditor/ckeditor5-dev-env' );

Promise.resolve()
	.then( () => devEnv.generateChangelogForMonoRepository( {
		cwd: process.cwd(),
		packages: 'packages',
		releaseBranch: 'release',
		highlightsPlaceholder: true,
		collaborationFeatures: true,
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
