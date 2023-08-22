/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const {
	// The number of the associated GitHub or Bitbucket pull request. Only available on forked PRs.
	CIRCLE_PR_NUMBER
} = process.env;

/**
 * @returns {Boolean}
 */
module.exports = () => {
	if ( CIRCLE_PR_NUMBER ) {
		return true;
	}

	return false;
};
