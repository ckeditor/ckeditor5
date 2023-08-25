#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const { execSync } = require( 'child_process' );
const upath = require( 'upath' );
const minimatch = require( 'minimatch' );
const minimist = require( 'minimist' );
const IS_COMMUNITY_PR = require( './is-community-pr' );

const {
	CIRCLE_PULL_REQUEST,
	CKE5_IS_NIGHTLY_BUILD,
	CKE5_IS_EXTERNAL_BUILD
} = process.env;

const shortFlowFilePatterns = [
	'docs/**',
	'packages/*/docs/**',
	'*.md',
	'packages/*/*.md'
];

main();

/**
 * Checks whether the short flow should be executed instead of the full flow.
 *
 * Short flow should be executed when all changed files match patterns of docs changes.
 */
function main() {
	const options = getOptions( process.argv.slice( 2 ) );
	const cwd = upath.resolve( options.cwd );

	let changedFilesPaths;

	// For community PRs, always check the entire repository.
	if ( IS_COMMUNITY_PR ) {
		return process.exit( 1 );
	}

	// Nightly builds should always execute the full flow.
	if ( CKE5_IS_NIGHTLY_BUILD === '1' || CKE5_IS_NIGHTLY_BUILD === 'true' ) {
		return process.exit( 1 );
	}

	// When processing a build triggered via API, it was triggered by a change in CKEditor 5.
	// In such a case, run the full flow too.
	if ( CKE5_IS_EXTERNAL_BUILD === '1' || CKE5_IS_EXTERNAL_BUILD === 'true' ) {
		return process.exit( 1 );
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

	const files = changedFilesPaths.trim().split( '\n' );

	return process.exit(
		doAllFilesMatchShortFlow( files ) ? 0 : 1
	);
}

/**
 * Checks whether all the `filePaths` match at least one of the patterns.
 *
 * @param {Array.<String>} filePaths
 * @returns {Boolean}
 */
function doAllFilesMatchShortFlow( filePaths ) {
	return filePaths.every( filepath => {
		return shortFlowFilePatterns.some( pattern => {
			return minimatch.match( [ filepath ], pattern ).length;
		} );
	} );
}

/**
 * @param {Array.<String>} argv
 * @returns {Object} options
 * @returns {String} options.cwd
 */
function getOptions( argv ) {
	return minimist( argv, {
		string: [
			'cwd'
		],
		default: {
			cwd: process.cwd()
		}
	} );
}
