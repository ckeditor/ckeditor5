#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import fs from 'fs-extra';
import { EventEmitter } from 'events';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';
import { tools } from '@ckeditor/ckeditor5-dev-utils';
import { Listr } from 'listr2';
import { ListrInquirerPromptAdapter } from '@listr2/prompt-adapter-inquirer';
import { confirm } from '@inquirer/prompts';

import updateVersionReferences from './utils/updateversionreferences.mjs';
import buildPackageUsingRollupCallback from './utils/buildpackageusingrollupcallback.mjs';
import buildTsAndDllForCKEditor5Root from './utils/buildtsanddllforckeditor5root.mjs';
import getCKEditor5PackageJson from './utils/getckeditor5packagejson.mjs';
import parseArguments from './utils/parsearguments.mjs';
import isCKEditor5PackageFactory from './utils/isckeditor5packagefactory.mjs';
import compileTypeScriptCallback from './utils/compiletypescriptcallback.mjs';
import updatePackageEntryPoint from './utils/updatepackageentrypoint.mjs';
import prepareDllBuildsCallback from './utils/preparedllbuildscallback.mjs';
import getListrOptions from './utils/getlistroptions.mjs';
import getCdnVersion from './utils/getcdnversion.mjs';
import isNonCommittableRelease from './utils/isnoncommittablerelease.mjs';
import getReleaseDescription from './utils/getreleasedescription.mjs';
import {
	PACKAGES_DIRECTORY,
	RELEASE_DIRECTORY,
	RELEASE_CDN_DIRECTORY,
	RELEASE_ZIP_DIRECTORY,
	RELEASE_NPM_DIRECTORY
} from './utils/constants.mjs';

const cliArguments = parseArguments( process.argv.slice( 2 ) );
const [ latestVersion, versionChangelog ] = await getReleaseDescription( cliArguments );
const taskOptions = {
	rendererOptions: {
		collapseSubtasks: false
	}
};

// The number of `executeInParallel()` executions.
EventEmitter.defaultMaxListeners = ( cliArguments.concurrency * 5 + 1 );

const tasks = new Listr( [
	{
		title: 'Verify the repository.',
		task: async () => {
			const errors = await releaseTools.validateRepositoryToRelease( {
				version: latestVersion,
				changes: versionChangelog,
				branch: cliArguments.branch
			} );

			if ( !errors.length ) {
				return;
			}

			return Promise.reject( 'Aborted due to errors.\n' + errors.map( message => `* ${ message }` ).join( '\n' ) );
		},
		skip: () => {
			if ( isNonCommittableRelease( cliArguments ) ) {
				return true;
			}

			// When compiling the packages only, do not validate the release.
			if ( cliArguments.compileOnly ) {
				return true;
			}

			return false;
		}
	},
	{
		title: 'Check the release directory.',
		task: async ( ctx, task ) => {
			const isAvailable = await fs.exists( RELEASE_DIRECTORY );

			if ( !isAvailable ) {
				return fs.ensureDir( RELEASE_DIRECTORY );
			}

			const isEmpty = ( await fs.readdir( RELEASE_DIRECTORY ) ).length === 0;

			if ( isEmpty ) {
				return Promise.resolve();
			}

			// Do not ask when running on CI.
			if ( cliArguments.ci ) {
				return fs.emptyDir( RELEASE_DIRECTORY );
			}

			const shouldContinue = await task.prompt( ListrInquirerPromptAdapter )
				.run( confirm, {
					message: 'The release directory must be empty. Continue and remove all files?'
				} );

			if ( !shouldContinue ) {
				return Promise.reject( 'Aborting as requested.' );
			}

			return fs.emptyDir( RELEASE_DIRECTORY );
		}
	},
	{
		title: 'Preparation phase.',
		task: ( ctx, task ) => {
			return task.newListr( [
				{
					title: 'Updating "version" value.',
					task: () => {
						return releaseTools.updateVersions( {
							packagesDirectory: PACKAGES_DIRECTORY,
							version: latestVersion
						} );
					}
				},
				{
					title: 'Updating dependencies.',
					task: async () => {
						return releaseTools.updateDependencies( {
							// We do not use caret ranges by purpose. See: #14046.
							version: latestVersion,
							packagesDirectory: PACKAGES_DIRECTORY,
							shouldUpdateVersionCallback: await isCKEditor5PackageFactory()
						} );
					}
				},
				{
					title: 'Updating references.',
					task: async ctx => {
						ctx.updatedFiles = await updateVersionReferences( {
							version: latestVersion,
							releaseDate: new Date()
						} );
					}
				}
			], taskOptions );
		},
		skip: () => {
			// When compiling the packages only, do not update any values.
			if ( cliArguments.compileOnly ) {
				return true;
			}

			return false;
		}
	},
	{
		title: 'Compilation phase.',
		task: ( ctx, task ) => {
			return task.newListr( [
				{
					title: 'Preparing the "ckeditor5" package files.',
					task: () => {
						return buildTsAndDllForCKEditor5Root();
					}
				},
				{
					title: 'Compiling TypeScript in `ckeditor5-*` packages.',
					task: ( ctx, task ) => {
						return releaseTools.executeInParallel( {
							packagesDirectory: PACKAGES_DIRECTORY,
							listrTask: task,
							taskToExecute: compileTypeScriptCallback,
							concurrency: cliArguments.concurrency
						} );
					}
				},
				{
					title: 'Building the `dist/` directory for `ckeditor5-*` packages.',
					task: ( ctx, task ) => {
						return releaseTools.executeInParallel( {
							packagesDirectory: PACKAGES_DIRECTORY,
							listrTask: task,
							taskToExecute: buildPackageUsingRollupCallback,
							concurrency: cliArguments.concurrency
						} );
					}
				},
				{
					title: 'Copying CKEditor 5 packages to the release directory.',
					task: () => {
						return releaseTools.prepareRepository( {
							outputDirectory: RELEASE_DIRECTORY,
							packagesDirectory: PACKAGES_DIRECTORY,
							rootPackageJson: getCKEditor5PackageJson(),
							packagesToCopy: cliArguments.packages
						} );
					}
				},
				{
					title: 'Updating entries in `package.json`.',
					task: ( ctx, task ) => {
						return releaseTools.executeInParallel( {
							packagesDirectory: RELEASE_DIRECTORY,
							listrTask: task,
							taskToExecute: updatePackageEntryPoint,
							concurrency: cliArguments.concurrency
						} );
					}
				},
				{
					title: 'Preparing DLL builds.',
					task: ( ctx, task ) => {
						return releaseTools.executeInParallel( {
							packagesDirectory: RELEASE_DIRECTORY,
							packagesDirectoryFilter: packageDirectory => {
								return upath.basename( packageDirectory ).startsWith( 'ckeditor5' );
							},
							listrTask: task,
							taskToExecute: prepareDllBuildsCallback,
							concurrency: cliArguments.concurrency,
							taskOptions: {
								RELEASE_CDN_DIRECTORY
							}
						} );
					}
				},
				{
					title: 'Moving packages to npm release directory.',
					task: async () => {
						const movePromises = ( await fs.readdir( RELEASE_DIRECTORY ) )
							.filter( packageSlug => packageSlug.startsWith( 'ckeditor5' ) )
							.map( packageSlug => {
								return fs.move(
									upath.join( RELEASE_DIRECTORY, packageSlug ),
									upath.join( RELEASE_NPM_DIRECTORY, packageSlug )
								);
							} );

						return Promise.all( movePromises );
					}
				},
				{
					title: 'Preparing CDN files.',
					task: async () => {
						// Complete the DLL build by adding the root, `ckeditor5` package.
						await fs.copy( `${ RELEASE_NPM_DIRECTORY }/ckeditor5/build`, `./${ RELEASE_CDN_DIRECTORY }/dll/ckeditor5-dll/` );

						// CKEditor 5 CDN.
						await fs.copy( './dist/browser', `./${ RELEASE_CDN_DIRECTORY }/` );
						await fs.copy( './dist/translations', `./${ RELEASE_CDN_DIRECTORY }/translations/` );

						// CKEditor 5 ZIP.
						await fs.copy( './dist/browser', `./${ RELEASE_ZIP_DIRECTORY }/ckeditor5/` );
						await fs.copy( './dist/translations', `./${ RELEASE_ZIP_DIRECTORY }/ckeditor5/translations/` );
						await fs.copy( './scripts/release/assets/zip', `./${ RELEASE_ZIP_DIRECTORY }/` );
						await fs.copy( './LICENSE.md', `./${ RELEASE_ZIP_DIRECTORY }/LICENSE.md` );
						await fs.copy( './COPYING.GPL', `./${ RELEASE_ZIP_DIRECTORY }/COPYING.GPL` );

						await fs.ensureDir( `./${ RELEASE_CDN_DIRECTORY }/zip` );

						const cdnVersion = getCdnVersion( cliArguments );
						const zipName = `ckeditor5-${ cdnVersion === 'staging' ? latestVersion : cdnVersion }`;

						await tools.shExec(
							`zip -r ../../${ RELEASE_CDN_DIRECTORY }/zip/${ zipName }.zip ./*`,
							{ verbosity: 'error', cwd: RELEASE_ZIP_DIRECTORY }
						);
					}
				}
			], taskOptions );
		}
	},
	{
		title: 'Clean up phase.',
		task: ( ctx, task ) => {
			return task.newListr( [
				{
					title: 'Removing files that will not be published to npm.',
					task: () => {
						return releaseTools.cleanUpPackages( {
							packagesDirectory: RELEASE_NPM_DIRECTORY,
							packageJsonFieldsToRemove: defaults => [ ...defaults, 'engines' ]
						} );
					}
				},
				{
					title: 'Removing local typings.',
					task: () => {
						return tools.shExec( 'yarn run release:clean', { async: true, verbosity: 'silent' } );
					}
				}
			], taskOptions );
		}
	},
	{
		title: 'Commit & tag phase.',
		task: ctx => {
			return releaseTools.commitAndTag( {
				version: latestVersion,
				files: [
					'package.json',
					`${ PACKAGES_DIRECTORY }/*/package.json`,
					...ctx.updatedFiles
				]
			} );
		},
		skip: () => {
			if ( isNonCommittableRelease( cliArguments ) ) {
				return true;
			}

			// When compiling the packages only, do not commit anything.
			if ( cliArguments.compileOnly ) {
				return true;
			}

			return false;
		}
	}
], getListrOptions( cliArguments ) );

console.log( 'Version', latestVersion );

tasks.run()
	.catch( err => {
		process.exitCode = 1;

		console.error( err );
	} );
