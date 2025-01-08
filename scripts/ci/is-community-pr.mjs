#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

const {
	// The number of the associated GitHub or Bitbucket pull request. Only available on forked PRs.
	CIRCLE_PR_NUMBER
} = process.env;

export default main();

function main() {
	if ( CIRCLE_PR_NUMBER ) {
		return true;
	}

	return false;
}
