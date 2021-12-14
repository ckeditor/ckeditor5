#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

// Updates `@ckeditor/ckeditor5-*` and `ckeditor5` dependencies in `packages/*` and `release/*` directories to the latest version.
// Changes in `packages/*` will be committed as well.
//
// See https://github.com/cksource/ckeditor5-internal/issues/1123
//
// This task must be called before: `npm run release:publish`.
//
// Use:
// npm run release:update-package-versions -- --dry-run

require( '@ckeditor/ckeditor5-dev-env' )
	.updatePackageVersions( {
		cwd: process.cwd(),
		dryRun: process.argv.includes( '--dry-run' )
	} );
