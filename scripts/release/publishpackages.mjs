#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
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

const cliArguments = parseArguments( process.argv.slice( 2 ) );

const { version: latestVersion } = fs.readJsonSync( upath.join( CKEDITOR5_ROOT_PATH, 'package.json' ) );

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
	}

	// In merged monorepo release flow, pushing tags/commits is handled once by
	// `ckeditor5-commercial/scripts/release/publishpackages.mjs`.
], getListrOptions( cliArguments ) );

tasks.run()
	.catch( err => {
		process.exitCode = 1;

		console.error( err );
	} );
