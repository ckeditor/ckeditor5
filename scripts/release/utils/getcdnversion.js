/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

/**
 * @param {ReleaseOptions} cliArguments
 * @param {String} pkgJsonVersion
 * @returns {String}
 */
module.exports = function getCdnVersion( cliArguments, pkgJsonVersion ) {
	if ( cliArguments.nightly ) {
		return 'nightly';
	}

	if ( cliArguments.nightlyAlpha ) {
		return 'alpha';
	}

	return pkgJsonVersion;
};
