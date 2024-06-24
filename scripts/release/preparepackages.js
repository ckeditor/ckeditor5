#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const upath = require( 'upath' );
const fs = require( 'fs-extra' );
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
const {
	PACKAGES_DIRECTORY,
	RELEASE_DIRECTORY,
	RELEASE_CDN_DIRECTORY,
	RELEASE_ZIP_DIRECTORY,
	RELEASE_NPM_DIRECTORY
} = require( './utils/constants' );

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

			const shouldContinue = await task.prompt( {
				type: 'Confirm',
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

						await fs.ensureDir( `./${ RELEASE_CDN_DIRECTORY }/zip` );

						const zipName = cliArguments.nightly ? 'ckeditor5-nightly' : `ckeditor5-${ latestVersion }`;

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
