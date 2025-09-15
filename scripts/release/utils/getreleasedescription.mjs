/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';
import { CKEDITOR5_PACKAGES_PATH } from '../../constants.mjs';

const CKEDITOR5_PATH = upath.join( CKEDITOR5_PACKAGES_PATH, 'ckeditor5' );

/**
 * @param {ReleaseOptions} cliArguments
 * @returns {Promise.<[string, string|null]>}
 */
export default async function getReleaseDescription( cliArguments ) {
	if ( cliArguments.nightlyAlpha ) {
		const CKE5_NEXT_RELEASE_VERSION = process.env.CKE5_NEXT_RELEASE_VERSION.trim();

		return [
			await releaseTools.getNextPreRelease( `${ CKE5_NEXT_RELEASE_VERSION }-alpha`, CKEDITOR5_PATH ), null
		];
	}

	if ( cliArguments.nightlyNext ) {
		const releaseIdentifier = `0.0.0-nightly-next-${ releaseTools.getDateIdentifier() }`;

		return [
			await releaseTools.getNextPreRelease( releaseIdentifier, CKEDITOR5_PATH ), null
		];
	}

	if ( cliArguments.nightly ) {
		return [
			await releaseTools.getNextNightly( CKEDITOR5_PATH ), null
		];
	}

	if ( cliArguments.internal ) {
		return [
			await releaseTools.getNextInternal( CKEDITOR5_PATH ), null
		];
	}

	// Changelog is stored in the repository root directory.
	const version = releaseTools.getLastFromChangelog();

	return [
		version, releaseTools.getChangesForVersion( version )
	];
}
