#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const upath = require( 'upath' );
const releaseTools = require( '@ckeditor/ckeditor5-dev-release-tools' );
const { globSync } = require( 'glob' );
const rootPkgJson = require( '../../package.json' );

const ROOT_DIRECTORY = upath.join( __dirname, '..', '..' );
const GLOB_PATTERNS = [
	'package.json',
	'packages/*/package.json',
	'external/ckeditor5-internal/packages/*/package.json',
	'external/collaboration-features/packages/*/package.json',
	'external/ckeditor-cloud-services-collaboration/package.json'
];

releaseTools.reassignNpmTags( {
	npmOwner: 'ckeditor',
	version: rootPkgJson.version,
	packages: globSync( GLOB_PATTERNS, { absolute: true, cwd: ROOT_DIRECTORY } )
		.map( packageJsonPath => require( packageJsonPath ).name )
} );
