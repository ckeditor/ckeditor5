/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @param {ReleaseOptions} cliArguments
 * @param {String} version The version that is released. It names the CDN directory of a stable release.
 * @returns {'alpha'|'nightly'|'nightly-next'|'internal'|String} One of the channel names, or `staging-v<version>`
 * for a stable release.
 */
export default function getCdnVersion( cliArguments, version ) {
	if ( cliArguments.nightly ) {
		return 'nightly';
	}

	if ( cliArguments.nightlyNext ) {
		return 'nightly-next';
	}

	if ( cliArguments.nightlyAlpha ) {
		return 'alpha';
	}

	if ( cliArguments.internal ) {
		return 'internal';
	}

	// The npm dist-tag uses the same name. Each version gets its own name, so release lines released
	// on the same day do not overwrite each other's packages and CDN files.
	return `staging-v${ version }`;
}
