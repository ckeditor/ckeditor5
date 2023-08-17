/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const { execSync } = require( 'child_process' );
const minimatch = require( 'minimatch' );

const {
	TRAVIS,
	TRAVIS_COMMIT_RANGE,
	TRAVIS_EVENT_TYPE,

	CIRCLECI,

	CKE5_IS_NIGHTLY_BUILD,
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
	// We target last commit content by default if we're not processing a pull request.
	let diffTargets = 'HEAD HEAD~1';
	let changedFilesPaths;

	// TODO: To remove once CKEditor 5 migrates to CircleCI.
	if ( TRAVIS ) {
		// Nightly builds should always execute the full flow.
		if ( TRAVIS_EVENT_TYPE === 'cron' ) {
			return false;
		}

		if ( TRAVIS_EVENT_TYPE === 'pull_request' ) {
			// We have to find merge base in case the feature branch is not up-to-date with target branch.
			// Without this step, the comparison would include all changes from merging target branch into feature branch.
			// https://stackoverflow.com/a/25071749
			const [ commitRangeStart, commitRangeEnd ] = TRAVIS_COMMIT_RANGE.split( '...' );
			const mergeBase = execSync( `git merge-base ${ commitRangeStart } ${ commitRangeEnd }`, { cwd } ).toString().trim();

			diffTargets = `${ mergeBase } ${ commitRangeEnd }`;
		}
	} else if ( CIRCLECI ) {
		// Nightly builds should always execute the full flow.
		if ( CKE5_IS_NIGHTLY_BUILD === '1' || CKE5_IS_NIGHTLY_BUILD === 'true' ) {
			return false;
		}

		// If processing a pull request build, find all changed files.
		if ( CIRCLE_PULL_REQUEST ) {
			const prId = CIRCLE_PULL_REQUEST.split( '/' ).pop();

			changedFilesPaths = execSync( `gh pr view ${ prId } --json files --jq '.files.[].path'`, { cwd } ).toString();
		}
	}

	if ( !changedFilesPaths ) {
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
