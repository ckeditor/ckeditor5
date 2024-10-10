/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

/**
 * @param {ReleaseOptions} cliArguments
 * @returns {'alpha'|'nightly'|'staging'}
 */
export default function getCdnVersion( cliArguments ) {
	if ( cliArguments.nightly ) {
		return 'nightly';
	}

	if ( cliArguments.nightlyAlpha ) {
		return 'alpha';
	}

	return 'staging';
}
