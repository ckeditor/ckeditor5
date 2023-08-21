/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const { execSync } = require( 'child_process' );
const minimatch = require( 'minimatch' );
const isNightlyBuild = require( './is-nightly-build' );

const {
	CIRCLE_PULL_REQUEST
} = process.env;

const filePatterns = [
	'docs/**',
	'packages/*/docs/**',
	'*.md',
	'packages/*/*.md'
];

/**
 * Checks whether the short flow should be executed instead of the full flow.
 *
 * Short flow should be executed when all changed files match patterns of docs changes.
 *
 * @returns {Boolean}
 */
module.exports = cwd => {
	let changedFilesPaths;

	// Nightly builds should always execute the full flow.
	if ( isNightlyBuild() ) {
		return false;
	}

	// If processing a pull request build, find all changed files.
	if ( CIRCLE_PULL_REQUEST ) {
		const prId = CIRCLE_PULL_REQUEST.split( '/' ).pop();

		changedFilesPaths = execSync( `gh pr view ${ prId } --json files --jq '.files.[].path'`, { cwd } ).toString();
	} else {
		// We target last commit content by default if we're not processing a pull request.
		const diffTargets = 'HEAD HEAD~1';

		changedFilesPaths = execSync( `git diff --name-only ${ diffTargets }`, { cwd } ).toString();
	}

	return doAllFilesMatchPattern(
		changedFilesPaths.trim().split( '\n' )
	);
};

/**
 * Checks whether all the `filePaths` match at least one of the patterns.
 *
 * @param {Array.<String>} filePaths
 * @returns {Boolean}
 */
function doAllFilesMatchPattern( filePaths ) {
	return filePaths.every( filepath => {
		return filePatterns.some( pattern => {
			return minimatch.match( [ filepath ], pattern ).length;
		} );
	} );
}
