/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const {
	CKE5_IS_NIGHTLY_BUILD
} = process.env;

/**
 * @returns {Boolean}
 */
module.exports = () => {
	if ( CKE5_IS_NIGHTLY_BUILD === '1' || CKE5_IS_NIGHTLY_BUILD === 'true' ) {
		return true;
	}

	return false;
};
