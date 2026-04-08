#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
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

// Capture the current @latest BEFORE making any changes.
// This is the "true latest" (e.g. 48.x.x) that we will restore to afterwards.
const trueLatestVersion = await releaseTools.getVersionForTag( 'ckeditor5', 'latest' );

console.log( `Current \`@latest\` on npm: ${ trueLatestVersion }.` );

// Step 1: Assign @latest to the hotfix release.
// This is intentional — the standard release procedure always moves the @latest tag
// to the freshly published version, even when it is part of an older (LTS) release line.
console.log( `Moving \`@latest\` → v${ currentVersion }.` );

await releaseTools.reassignNpmTags( {
	npmOwner,
	packages,
	version: currentVersion,
	npmTag: 'latest'
} );

// Step 2: Update the LTS tag (e.g., `lts-v47`) if the current version is part of an LTS release line.
if ( isCurrentVersionLTS ) {
	console.log( `Moving \`lts-v${ currentMajor }\` → v${ currentVersion }.` );

	await releaseTools.reassignNpmTags( {
		npmOwner,
		packages,
		version: currentVersion,
		npmTag: `lts-v${ currentMajor }`
	} );
} else {
	console.log( `Major ${ currentMajor } not listed as LTS; skipping LTS tag update.` );
}

// Step 3: Restore @latest to the "true latest" version captured before step 1.
// This ensures that after the hotfix release, @latest still points to the most recent
// major release on npm (e.g. 48.x.x), regardless of which LTS patch was just released.
// The version is fetched dynamically to account for any concurrent hotfix that may have
// been published in the meantime.
if ( trueLatestVersion && semver.compare( trueLatestVersion, currentVersion ) > 0 ) {
	console.log( `Restoring \`@latest\` → v${ trueLatestVersion } (fetched from npm before the release).` );

	await releaseTools.reassignNpmTags( {
		npmOwner,
		packages,
		version: trueLatestVersion,
		npmTag: 'latest'
	} );
} else {
	console.log( `\`@latest\` stays at v${ currentVersion } — no higher version was found on npm.` );
}

console.log( '✅ Done.' );
