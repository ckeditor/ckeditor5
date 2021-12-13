#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );
const { updatePackageVersions } = require( '@ckeditor/ckeditor5-dev-env' );

// This script updates all of the ckeditor5 dependencies to the latest version of ckeditor5.
//
// This task must be called before: `npm run release:publish`.
//
// See https://github.com/cksource/ckeditor5-internal/issues/1123

const pathToPackages = path.posix.join( process.cwd(), 'packages' );
// const pathToRelease = path.posix.join( process.cwd(), 'release', 'packages' );

updatePackageVersions( pathToPackages );
// updatePackageVersions( pathToRelease );
