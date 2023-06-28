/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

// Patterns that define all possible CKEditor 5 dependencies.
const PATTERNS_TO_MATCH = [
	/^@ckeditor\/ckeditor5-(.*)/,
	/^ckeditor5(-collaboration)?$/
];

// Packages that match the CKEditor 5 patterns, but should not be updated, because they aren't a dependency of the project.
const PATTERNS_TO_SKIP = [
	/^@ckeditor\/ckeditor5-dev$/,
	/^@ckeditor\/ckeditor5-dev-.*/,
	'@ckeditor/ckeditor5-angular',
	'@ckeditor/ckeditor5-react',
	'@ckeditor/ckeditor5-vue',
	'@ckeditor/ckeditor5-vue2',
	'@ckeditor/ckeditor5-inspector',
	// Packages not belonging to the CKEditor 5 repository.
	'@ckeditor/ckeditor5-mermaid'
];

/**
 * Checks whether provided package name is the CKEditor 5 dependency.
 *
 * @param {String} packageName Package name to check.
 * @returns {Boolean}
 */
module.exports = function isCKEditor5Package( packageName ) {
	const match = PATTERNS_TO_MATCH.some( pattern => packageName.match( pattern ) );
	const shouldSkip = PATTERNS_TO_SKIP.some( pattern => packageName.match( pattern ) );

	return ( match && !shouldSkip );
};
