/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const childProcess = require( 'child_process' );
const minimatch = require( 'minimatch' );

const {
	TRAVIS_COMMIT_RANGE,
	TRAVIS_EVENT_TYPE
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
	// We target last commit content by default if we're not processing a pull request.
	let diffTargets = 'HEAD HEAD~1';

	if ( TRAVIS_EVENT_TYPE === 'pull_request' ) {
		// We have to find merge base in case the feature branch is not up to date with target branch.
		// Without this step, the comparison would include all changes from merging target branch into feature branch.
		// https://stackoverflow.com/a/25071749
		const [ commitRangeStart, commitRangeEnd ] = TRAVIS_COMMIT_RANGE.split( '...' );
		const mergeBase = childProcess.execSync( `git merge-base ${ commitRangeStart } ${ commitRangeEnd }`, { cwd } ).toString().trim();
		diffTargets = `${ mergeBase } ${ commitRangeEnd }`;
	}

	const changedFilesPaths = childProcess.execSync( `git diff --name-only ${ diffTargets }`, { cwd } ).toString().trim().split( '\n' );

	return doAllFilesMatchPattern( changedFilesPaths );
};

/**
 * Checks whether all of the filePaths match at least one of the patterns.
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
