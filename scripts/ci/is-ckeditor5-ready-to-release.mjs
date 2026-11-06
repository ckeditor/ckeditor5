#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';
import { npm } from '@ckeditor/ckeditor5-dev-utils';
import semver from 'semver';

const changelogVersion = releaseTools.getLastFromChangelog();

if ( getVersionTag( changelogVersion ) !== 'latest' ) {
	console.log( `Aborting due non-latest changelog version (${ changelogVersion }).` );
	process.exit( 1 );
}

// A release commit must not trigger a new release. Its changelog version is already on npm, even while
// the release waits for verification under its `staging-v<version>` tag and `@latest` still points to the previous one.
if ( !( await isVersionAvailable( changelogVersion ) ) ) {
	console.log( `The proposed changelog (${ changelogVersion }) version is already published.` );
	process.exit( 1 );
}

console.log( 'CKEditor 5 is ready to release.' );

function getVersionTag( version ) {
	const [ versionTag ] = semver.prerelease( version ) || [ 'latest' ];

	return versionTag;
}

async function isVersionAvailable( version ) {
	try {
		return await npm.checkVersionAvailability( version, 'ckeditor5' );
	} catch ( error ) {
		// When npm cannot tell, a release commit could look like a new release. Do not trigger anything then.
		console.log( `Cannot check if the proposed changelog (${ version }) version is published: ${ error.message }` );
		process.exit( 1 );
	}
}
