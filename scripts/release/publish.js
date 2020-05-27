#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

// This scripts publish changes.
//
// You can test the whole process using `dry-run` mode. It won't change anything in the project
// and any repository. Nothing will be pushed. Instead of `npm publish`, the `npm pack` command will be called.
//
// Note: This task based on versions published on NPM and GitHub. If something went wrong, you can call this script one more time.
//
// This task should be executed after: `npm run release:bump-version`.
//
// Use:
// npm run release:publish --dry-run

/* eslint-disable max-len */

require( '@ckeditor/ckeditor5-dev-env' )
	.releaseSubRepositories( {
		cwd: process.cwd(),
		packages: 'packages',
		emptyReleases: [
			'ckeditor5'
		],
		packageJsonForEmptyReleases: {
			ckeditor5: {
				description: 'A set of ready-to-use rich text editors created with a powerful framework. Made with real-time collaborative editing in mind.'
			}
		},
		dryRun: process.argv.includes( '--dry-run' )
	} );

/* eslint-enable max-len */
