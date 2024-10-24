/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

/**
 * @param {ReleaseOptions} cliArguments
 * @returns {boolean}
 */
export default function isNonCommittableRelease( cliArguments ) {
	return [
		cliArguments.nightlyAlpha,
		cliArguments.nightly,
		cliArguments.internal
	].some( value => value === true );
}
