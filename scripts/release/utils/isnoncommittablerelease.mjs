/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @param {ReleaseOptions} cliArguments
 * @returns {boolean}
 */
export default function isNonCommittableRelease( cliArguments ) {
	return [
		cliArguments.nightlyAlpha,
		cliArguments.nightlyNext,
		cliArguments.nightly,
		cliArguments.internal
	].some( value => value === true );
}
