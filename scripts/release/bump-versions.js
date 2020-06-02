#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

// This scripts preparing all packages to release:
//   - checking what should be released,
//   - validates the whole process (whether the changes could be published),
//   - tagging new versions.
//
// You can test the whole process using `dry-run` mode. It won't change anything in the project
// and any repository.
//
// This task must be called before: `npm run release:publish`.
//
// Use:
// npm run release:bump-version -- --dry-run

require( '@ckeditor/ckeditor5-dev-env' )
	.bumpVersions( {
		cwd: process.cwd(),
		packages: 'packages',
		releaseBranch: 'release',
		dryRun: process.argv.includes( '--dry-run' )
	} );
