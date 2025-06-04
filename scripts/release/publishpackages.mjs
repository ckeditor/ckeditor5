#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import fs from 'fs-extra';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';
import { Listr } from 'listr2';
import { ListrInquirerPromptAdapter } from '@listr2/prompt-adapter-inquirer';
import { confirm } from '@inquirer/prompts';
import validateDependenciesVersions from './utils/validatedependenciesversions.mjs';
import parseArguments from './utils/parsearguments.mjs';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';
import { RELEASE_NPM_DIRECTORY } from './utils/constants.mjs';
import getListrOptions from './utils/getlistroptions.mjs';
import isNonCommittableRelease from './utils/isnoncommittablerelease.mjs';

const cliArguments = parseArguments( process.argv.slice( 2 ) );
const githubToken = await getGitHubToken( cliArguments );

const { version: latestVersion } = fs.readJsonSync( upath.join( CKEDITOR5_ROOT_PATH, 'package.json' ) );
const versionChangelog = releaseTools.getChangesForVersion( latestVersion );

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

					return task.prompt( ListrInquirerPromptAdapter )
						.run( confirm, { message: 'Do you want to continue?' } );
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
		skip: isNonCommittableRelease( cliArguments )
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
		skip: isNonCommittableRelease( cliArguments )
	}
], getListrOptions( cliArguments ) );

tasks.run()
	.catch( err => {
		process.exitCode = 1;

		console.error( err );
	} );

/**
 * @param {ReleaseOptions} cliArguments
 * @returns {Promise.<string|null>}
 */
async function getGitHubToken( cliArguments ) {
	if ( process.env.CKE5_RELEASE_TOKEN ) {
		return process.env.CKE5_RELEASE_TOKEN;
	}

	if ( !isNonCommittableRelease( cliArguments ) ) {
		return releaseTools.provideToken();
	}

	return null;
}
