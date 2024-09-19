/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

/**
 * @param {ReleaseOptions} cliArguments
 * @param {String} pkgJsonVersion
 * @returns {String}
 */
export default function getcdnversion( cliArguments, pkgJsonVersion ) {
	if ( cliArguments.nightly ) {
		return 'nightly';
	}

	if ( cliArguments.nightlyAlpha ) {
		return 'alpha';
	}

	return pkgJsonVersion;
}
