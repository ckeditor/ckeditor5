#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const releaseTools = require( '@ckeditor/ckeditor5-dev-release-tools' );
const { provideToken } = require( '@ckeditor/ckeditor5-dev-release-tools/lib/utils/cli' );
const { Listr } = require( 'listr2' );
const validateDependenciesVersions = require( './utils/validatedependenciesversions' );

// const parseArguments = require( './utils/parsearguments' );
// const cliArguments = parseArguments( process.argv.slice( 2 ) );
// [--npm-tag rc|alpha|...]
// const RELEASE_DIRECTORY = 'release';

const latestVersion = releaseTools.getLastFromChangelog();
const versionChangelog = releaseTools.getChangesForVersion( latestVersion );
const RELEASE_DIRECTORY = 'release';

const taskOptions = {
	rendererOptions: {
		collapseSubtasks: false
	}
};

let githubToken;

const tasks = new Listr( [
	{
		title: 'Validating CKEditor 5 packages.',
		task: () => {
			return validateDependenciesVersions( {
				packagesDirectory: RELEASE_DIRECTORY,
				version: latestVersion
			} );
		}
	},
	{
		title: 'Publishing packages.',
		task: () => {
			// TODO: Integrate a script created in #13957.
			return Promise.resolve();
		}
	},
	{
		title: 'Creating the release page.',
		task: async ( _, task ) => {
			const releaseUrl = await releaseTools.createGithubRelease( {
				token: githubToken,
				version: latestVersion,
				repositoryOwner: 'ckeditor',
				repositoryName: 'ckeditor5',
				description: versionChangelog
			} );

			task.output = `Release page: ${ releaseUrl }`;
		}
	},
	{
		title: 'Pushing changes.',
		task: () => {
			return releaseTools.push( {
				releaseBranch: 'release',
				version: latestVersion
			} );
		}
	}
], taskOptions );

( async () => {
	try {
		githubToken = await provideToken();

		await tasks.run();
	} catch ( err ) {
		console.error( err );
	}
} )();
