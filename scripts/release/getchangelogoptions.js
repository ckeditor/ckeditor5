/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const { format } = require( 'date-fns' );
const { PACKAGES_DIRECTORY, CKEDITOR5_ROOT_PATH, CKEDITOR5_COMMERCIAL_PATH } = require( './utils/constants' );

module.exports = function getChangelogOptions( cliArguments ) {
	const changelogOptions = {
		cwd: CKEDITOR5_ROOT_PATH,
		packages: PACKAGES_DIRECTORY,
		releaseBranch: cliArguments.branch,
		formatDate: now => {
			return format( now, 'LLLL d, yyyy' );
		},
		transformScope: name => {
			if ( name === 'ckeditor5' ) {
				return 'https://www.npmjs.com/package/ckeditor5';
			}

			if ( name === 'ckeditor5-collaboration' ) {
				return 'https://www.npmjs.com/package/ckeditor5-collaboration';
			}

			if ( name === 'ckeditor5-premium-feature' || name === 'premium-feature' ) {
				return 'https://www.npmjs.com/package/ckeditor5-premium-feature';
			}

			if ( name === 'build-*' ) {
				return 'https://www.npmjs.com/search?q=keywords%3Ackeditor5-build%20maintainer%3Ackeditor';
			}

			if ( name === 'editor-*' ) {
				return 'https://www.npmjs.com/search?q=keywords%3Ackeditor5-editor%20maintainer%3Ackeditor';
			}

			return 'https://www.npmjs.com/package/@ckeditor/ckeditor5-' + name;
		},
		externalRepositories: [
			{
				cwd: CKEDITOR5_COMMERCIAL_PATH,
				packages: PACKAGES_DIRECTORY,
				skipLinks: true
			}
		]
	};

	if ( !cliArguments.external ) {
		changelogOptions.externalRepositories = [];
	}

	if ( cliArguments.from ) {
		changelogOptions.from = cliArguments.from;
	}

	return changelogOptions;
};
