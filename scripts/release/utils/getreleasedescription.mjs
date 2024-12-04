/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';

/**
 * @param {ReleaseOptions} cliArguments
 * @returns {Promise.<[string, string|null]>}
 */
export default async function getReleaseDescription( cliArguments ) {
	if ( cliArguments.nightlyAlpha ) {
		const CKE5_NEXT_RELEASE_VERSION = process.env.CKE5_NEXT_RELEASE_VERSION.trim();

		return [
			await releaseTools.getNextPreRelease( `${ CKE5_NEXT_RELEASE_VERSION }-alpha` ), null
		];
	}

	if ( cliArguments.nightly ) {
		return [
			await releaseTools.getNextNightly(), null
		];
	}

	if ( cliArguments.internal ) {
		return [
			await releaseTools.getNextInternal(), null
		];
	}

	const version = releaseTools.getLastFromChangelog();

	return [
		version, releaseTools.getChangesForVersion( version )
	];
}
