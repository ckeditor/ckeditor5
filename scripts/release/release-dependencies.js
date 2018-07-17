#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

// In order to test the whole process, you can use:
// npm run release:dependencies -- --dry-run
// It will create some commits but nothing will be pushed or published.

require( '@ckeditor/ckeditor5-dev-env' )
	.releaseSubRepositories( {
		cwd: process.cwd(),
		packages: 'packages',
		dryRun: process.argv.includes( '--dry-run' )
	} );
