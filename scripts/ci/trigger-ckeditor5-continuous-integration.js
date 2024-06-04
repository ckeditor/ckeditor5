#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const minimist = require( 'minimist' );
const fetch = require( 'node-fetch' );

const {
	CKE5_CIRCLE_TOKEN,
	INTEGRATION_CI_ORGANIZATION,
	INTEGRATION_CI_REPOSITORY
} = process.env;

main()
	.catch( err => {
		console.error( err );

		process.exit( 1 );
	} );

/**
 * This script triggers Travis that verifies whether projects that depend on CKEditor 5 build correctly.
 *
 * In order to integrate the action in a new repository, you need add a few secrets in the new repository:
 *
 *   - INTEGRATION_CI_ORGANIZATION - a name of the organization that keeps the repository where the build should be triggered/
 *   - INTEGRATION_CI_REPOSITORY - a name of the repository where the build should be triggered.
 *   - CKE5_CIRCLE_TOKEN - an authorization token to talk to CircleCI REST API.
 *
 * @returns {Object} CircleCI API response as JSON.
 */
function main() {
	const { repository, commit, branch } = getOptions( process.argv.slice( 2 ) );
	const requestUrl =
		`https://circleci.com/api/v2/project/github/${ INTEGRATION_CI_ORGANIZATION }/${ INTEGRATION_CI_REPOSITORY }/pipeline`;

	const requestOptions = {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Circle-Token': CKE5_CIRCLE_TOKEN
		},
		body: JSON.stringify( {
			branch,
			parameters: {
				triggerRepositorySlug: repository,
				triggerCommitHash: commit,
				isRelease: branch === 'release'
			}
		} )
	};

	return fetch( requestUrl, requestOptions )
		.then( res => res.json() )
		.then( response => {
			if ( response.error_message ) {
				throw new Error( `CI trigger failed: "${ response.error_message }".` );
			}

			console.log( 'CI triggered successfully.' );
		} );
}

/**
 * @param {Array.<String>} argv
 * @returns {Object} options
 * @returns {String} options.commit
 * @returns {String} options.repository
 * @returns {String} [options.branch='master']
 */
function getOptions( argv ) {
	return minimist( argv, {
		string: [
			'commit',
			'repository',
			'branch'
		],
		alias: {
			b: 'branch',
			c: 'commit',
			r: 'repository'
		},
		default: {
			branch: 'master'
		}
	} );
}
