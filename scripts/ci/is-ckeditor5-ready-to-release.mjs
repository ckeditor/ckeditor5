#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { execSync } from 'child_process';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';
import semver from 'semver';

// `@staging` and `@latest` share usually the same versions.
//
// However, while publishing a new release, the `@staging` tag will contain the new release,
// while `@latest` still points to the previous one, because we need to verify the release before making it public.
//
// To avoid triggering a new job (from a release commit), we must use the `@staging` tag.
const latestPublishedVersion = execSync( 'npm view ckeditor5@staging version', { encoding: 'utf-8' } ).trim();
const changelogVersion = releaseTools.getLastFromChangelog();

if ( getVersionTag( changelogVersion ) !== 'latest' ) {
	console.log( `Aborting due non-latest changelog version (${ changelogVersion }).` );
	process.exit( 1 );
}

if ( changelogVersion === latestPublishedVersion ) {
	console.log( 'Nothing to release.' );
	process.exit( 1 );
}

if ( semver.lt( changelogVersion, latestPublishedVersion ) ) {
	console.log( `The proposed changelog (${ changelogVersion }) version is lower than the published one (${ latestPublishedVersion }).` );
	process.exit( 1 );
}

console.log( 'CKEditor 5 is ready to release.' );

/**
 * Returns an npm tag based on the specified release version.
 *
 * @param {String} version
 * @returns {String}
 */
function getVersionTag( version ) {
	const [ versionTag ] = semver.prerelease( version ) || [ 'latest' ];

	return versionTag;
}
