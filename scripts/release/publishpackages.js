#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const upath = require( 'upath' );
const releaseTools = require( '@ckeditor/ckeditor5-dev-release-tools' );
const { provideToken } = require( '@ckeditor/ckeditor5-dev-release-tools/lib/utils/cli' );
const { Listr } = require( 'listr2' );
const validateDependenciesVersions = require( './utils/validatedependenciesversions' );
const parseArguments = require( './utils/parsearguments' );
const { CKEDITOR5_ROOT_PATH, RELEASE_NPM_DIRECTORY } = require( './utils/constants' );
const getListrOptions = require( './utils/getlistroptions' );

const cliArguments = parseArguments( process.argv.slice( 2 ) );

const { version: latestVersion } = require( upath.join( CKEDITOR5_ROOT_PATH, 'package.json' ) );
const versionChangelog = releaseTools.getChangesForVersion( latestVersion );

let githubToken;

const tasks = new Listr( [
	{
		title: 'Validating CKEditor 5 packages.',
		task: () => {
			return validateDependenciesVersions( {
				packagesDirectory: RELEASE_NPM_DIRECTORY,
				version: latestVersion
			} );
		}
	},
	{
		title: 'Publishing packages.',
		task: async ( _, task ) => {
			return releaseTools.publishPackages( {
				packagesDirectory: RELEASE_NPM_DIRECTORY,
				npmOwner: 'ckeditor',
				npmTag: cliArguments.npmTag,
				listrTask: task,
				confirmationCallback: () => {
					if ( cliArguments.ci ) {
						return true;
					}

					return task.prompt( { type: 'Confirm', message: 'Do you want to continue?' } );
				},
				optionalEntries: {
					// The `#default` key is used for all packages that do not have own definition.
					default: [
						// Some of CKEditor 5 features do not contain the UI layer.
						// Hence, it is not required to publish the directory.
						'lang',
						// Some of CKEditor 5 features do not define styles or icons.
						'theme',
						// The CKEditor 5 framework does not define features.
						'ckeditor5-metadata.json'
					],

					// Package-specific definition of optional files and directories.
					'@ckeditor/ckeditor5-theme-lark': [
						// Like in defaults, this package does not contain the UI layer. Hence, it is not required to publish the directory.
						'lang',
						// This package does not contain any source code, but only styles in the `theme` directory.
						// Hence, `theme` is not optional.
						'src',
						// Like in defaults, this package does not define features.
						'ckeditor5-metadata.json'
					]
				},
				requireEntryPoint: true,
				optionalEntryPointPackages: [
					'ckeditor5'
				]
			} );
		},
		retry: 3
	},
	{
		title: 'Checking if packages that returned E409 error code were uploaded correctly.',
		task: async ( _, task ) => {
			return releaseTools.verifyPackagesPublishedCorrectly( {
				packagesDirectory: RELEASE_NPM_DIRECTORY,
				version: latestVersion,
				onSuccess: text => {
					task.output = text;
				}
			} );
		}
	},
	{
		title: 'Pushing changes.',
		task: () => {
			return releaseTools.push( {
				releaseBranch: cliArguments.branch,
				version: latestVersion
			} );
		},
		// Nightly releases are not stored in the repository.
		skip: cliArguments.nightly || cliArguments.nightlyAlpha
	},
	{
		title: 'Creating the release page.',
		task: async ( _, task ) => {
			const releaseUrl = await releaseTools.createGithubRelease( {
				token: githubToken,
				version: latestVersion,
				description: versionChangelog
			} );

			task.output = `Release page: ${ releaseUrl }`;
		},
		options: {
			persistentOutput: true
		},
		// Nightly releases are not described in the changelog.
		skip: cliArguments.nightly || cliArguments.nightlyAlpha
	}
], getListrOptions( cliArguments ) );

( async () => {
	try {
		if ( process.env.CKE5_RELEASE_TOKEN ) {
			githubToken = process.env.CKE5_RELEASE_TOKEN;
		} else if ( !( cliArguments.nightly || cliArguments.nightlyAlpha ) ) {
			githubToken = await provideToken();
		}

		await tasks.run();
	} catch ( err ) {
		process.exitCode = 1;

		console.error( err );
	}
} )();
