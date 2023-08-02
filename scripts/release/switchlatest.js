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
	'external/ckeditor5-commercial/packages/*/package.json'
];

const cloudServicesCollaborationPkg = require( '../../external/ckeditor-cloud-services-collaboration/package.json' );

Promise.resolve()
	// CKEditor 5 packages.
	.then( () => releaseTools.reassignNpmTags( {
		npmOwner: 'ckeditor',
		version: rootPkgJson.version,
		packages: globSync( GLOB_PATTERNS, { absolute: true, cwd: ROOT_DIRECTORY } )
			.map( packageJsonPath => require( packageJsonPath ).name )
	} ) )
	// CKEditor Cloud Services package is versioned independently of CKEditor 5.
	.then( () => releaseTools.reassignNpmTags( {
		npmOwner: 'ckeditor',
		version: cloudServicesCollaborationPkg.version,
		packages: [
			cloudServicesCollaborationPkg.name
		]
	} ) );

