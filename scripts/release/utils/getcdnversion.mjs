/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

/**
 * @param {ReleaseOptions} cliArguments
 * @returns {'alpha'|'nightly'|'staging'|'internal'}
 */
export default function getCdnVersion( cliArguments ) {
	if ( cliArguments.nightly ) {
		return 'nightly';
	}

	if ( cliArguments.nightlyAlpha ) {
		return 'alpha';
	}

	if ( cliArguments.internal ) {
		return 'internal';
	}

	return 'staging';
}
