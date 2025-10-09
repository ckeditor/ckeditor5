#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import fs from 'fs-extra';
import upath from 'upath';
import semver from 'semver';
import { globSync } from 'glob';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';
import { CKEDITOR5_COMMERCIAL_PACKAGES_PATH, CKEDITOR5_PACKAGES_PATH, CKEDITOR5_ROOT_PATH } from '../constants.mjs';

const GLOB_PATTERNS = [
	CKEDITOR5_PACKAGES_PATH + '/*/package.json',
	CKEDITOR5_COMMERCIAL_PACKAGES_PATH + '/*/package.json'
];

const rootPkgJson = fs.readJsonSync( upath.join( CKEDITOR5_ROOT_PATH, 'package.json' ) );
const currentVersion = rootPkgJson.version;
const currentMajor = semver.major( currentVersion );
const ltsMajors = rootPkgJson[ 'ck-lts-versions' ];
const isCurrentVersionLTS = ltsMajors.includes( currentMajor );

const npmOwner = 'ckeditor';
const packages = globSync( GLOB_PATTERNS, { absolute: true, cwd: CKEDITOR5_ROOT_PATH } )
	.map( packageJsonPath => fs.readJsonSync( packageJsonPath ).name );

const latestPublishedVersion = await releaseTools.getVersionForTag( 'ckeditor5', 'latest' );

console.log( `Current \`@latest\` on npm: ${ latestPublishedVersion }.` );

/**
 * Move @latest only if the just-published version is strictly newer.
 * (No temporary reassignment to older versions.)
 */
const shouldRestoreLatest = !latestPublishedVersion || semver.compare( currentVersion, latestPublishedVersion ) > 0;

if ( shouldRestoreLatest ) {
	console.log( `Moving \`@latest\` → v${ currentVersion }.` );

	await releaseTools.reassignNpmTags( {
		npmOwner,
		packages,
		version: currentVersion,
		npmTag: 'latest'
	} );
} else {
	console.log( `Not touching \`@latest\` (current ${ latestPublishedVersion } is >= ${ currentVersion }).` );
}

/* 2) Update LTS tag if applicable */
if ( isCurrentVersionLTS ) {
	await releaseTools.reassignNpmTags( {
		npmOwner,
		packages,
		version: currentVersion,
		npmTag: `lts-v${ currentMajor }`
	} );
} else {
	console.log( `Major ${ currentMajor } not listed as LTS; skipping LTS tag update.` );
}

console.log( '✅ Done.' );
