#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

// This script updates all of the ckeditor5 dependencies to the latest version of ckeditor5.
//
// This task must be called before: `npm run release:publish`.
//
// Use:
// npm run release:update-package-versions -- --dry-run
//
// See https://github.com/cksource/ckeditor5-internal/issues/1123

require( '@ckeditor/ckeditor5-dev-env' )
	.updatePackageVersions( {
		cwd: process.cwd(),
		dryRun: process.argv.includes( '--dry-run' )
	} );
