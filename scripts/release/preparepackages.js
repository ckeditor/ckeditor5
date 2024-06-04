#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const upath = require( 'upath' );
const { EventEmitter } = require( 'events' );
const releaseTools = require( '@ckeditor/ckeditor5-dev-release-tools' );
const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );
const { Listr } = require( 'listr2' );
const updateVersionReferences = require( './utils/updateversionreferences' );
const buildPackageUsingRollupCallback = require( './utils/buildpackageusingrollupcallback' );
const buildTsAndDllForCkeditor5Root = require( './utils/buildtsanddllforckeditor5root' );
const getCKEditor5PackageJson = require( './utils/getckeditor5packagejson' );
const parseArguments = require( './utils/parsearguments' );
const isCKEditor5PackageFactory = require( './utils/isckeditor5packagefactory' );
const compileTypeScriptCallback = require( './utils/compiletypescriptcallback' );
const updatePackageEntryPoint = require( './utils/updatepackageentrypoint' );
const prepareDllBuildsCallback = require( './utils/preparedllbuildscallback' );
const buildCKEditor5BuildsCallback = require( './utils/buildckeditor5buildscallback' );
const getListrOptions = require( './utils/getlistroptions' );
const { PACKAGES_DIRECTORY, RELEASE_DIRECTORY } = require( './utils/constants' );

const cliArguments = parseArguments( process.argv.slice( 2 ) );

// `executeInParallel()` is executed thrice.
EventEmitter.defaultMaxListeners = ( cliArguments.concurrency * 3 + 1 );

let latestVersion;
let versionChangelog;

const taskOptions = {
	rendererOptions: {
		collapseSubtasks: false
	}
};

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
			// Nightly releases are not described in the changelog.
			if ( cliArguments.nightly || cliArguments.nightlyAlpha ) {
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
		title: 'Preparation phase.',
		task: ( _, task ) => {
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
		task: ( _, task ) => {
			return task.newListr( [
				{
					title: 'Preparing the "ckeditor5" package files.',
					task: () => {
						return buildTsAndDllForCkeditor5Root();
					}
				},
				{
					title: 'Preparing "ckeditor5-build-*" builds.',
					task: ( ctx, task ) => {
						return releaseTools.executeInParallel( {
							packagesDirectory: PACKAGES_DIRECTORY,
							packagesDirectoryFilter: packageDirectory => {
								return upath.basename( packageDirectory ).startsWith( 'ckeditor5-build-' );
							},
							listrTask: task,
							taskToExecute: buildCKEditor5BuildsCallback,
							concurrency: 2
						} );
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
							listrTask: task,
							taskToExecute: prepareDllBuildsCallback,
							concurrency: cliArguments.concurrency
						} );
					}
				}
			], taskOptions );
		}
	},
	{
		title: 'Clean up phase.',
		task: ( _, task ) => {
			return task.newListr( [
				{
					title: 'Removing files that will not be published.',
					task: () => {
						return releaseTools.cleanUpPackages( {
							packagesDirectory: RELEASE_DIRECTORY,
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
					`${ PACKAGES_DIRECTORY }/ckeditor5-build-*/build/**`,
					...ctx.updatedFiles
				]
			} );
		},
		skip: () => {
			// Nightly releases are not stored in the repository.
			if ( cliArguments.nightly || cliArguments.nightlyAlpha ) {
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

( async () => {
	try {
		if ( cliArguments.nightlyAlpha ) {
			const CKE5_NEXT_RELEASE_VERSION = process.env.CKE5_NEXT_RELEASE_VERSION.trim();

			latestVersion = await releaseTools.getNextPreRelease( `${ CKE5_NEXT_RELEASE_VERSION }-alpha` );
		} else if ( cliArguments.nightly ) {
			latestVersion = await releaseTools.getNextNightly();
		} else {
			latestVersion = releaseTools.getLastFromChangelog();
			versionChangelog = releaseTools.getChangesForVersion( latestVersion );
		}

		console.log( 'Version', latestVersion );

		await tasks.run();
	} catch ( err ) {
		process.exitCode = 1;

		console.error( err );
	}
} )();
