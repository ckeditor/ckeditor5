#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );
const { EventEmitter } = require( 'events' );
const releaseTools = require( '@ckeditor/ckeditor5-dev-release-tools' );
const { Listr } = require( 'listr2' );
const updateVersionReferences = require( './utils/updateversionreferences' );
const buildTsAndDllForCkeditor5Root = require( './utils/buildtsanddllforckeditor5root' );
const getCKEditor5PackageJson = require( './utils/getckeditor5packagejson' );
const parseArguments = require( './utils/parsearguments' );
const isCKEditor5Package = require( './utils/isckeditor5package' );
const compileTypeScriptCallback = require( './utils/compiletypescriptcallback' );
const updatePackageEntryPoint = require( './utils/updatepackageentrypoint' );
const prepareDllBuildsCallback = require( './utils/preparedllbuildscallback' );
const buildCKEditor5BuildsCallback = require( './utils/buildckeditor5buildscallback' );
const { PACKAGES_DIRECTORY, RELEASE_DIRECTORY } = require( './utils/constants' );

const cliArguments = parseArguments( process.argv.slice( 2 ) );

// `executeInParallel()` is executed thrice.
EventEmitter.defaultMaxListeners = ( cliArguments.concurrency * 3 + 1 );

const abortController = new AbortController();

// TODO: If nightly: generate a version number. See: #14179.
const latestVersion = releaseTools.getLastFromChangelog();
const versionChangelog = releaseTools.getChangesForVersion( latestVersion );

process.on( 'SIGINT', () => {
	abortController.abort( 'SIGINT' );
} );

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
				branch: 'release'
			} );

			if ( !errors.length ) {
				return;
			}

			return Promise.reject( 'Aborted due to errors.\n' + errors.map( message => `* ${ message }` ).join( '\n' ) );
		},
		skip: cliArguments.nightly
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
					task: () => {
						return releaseTools.updateDependencies( {
							// We do not use caret ranges by purpose. See: #14046.
							version: latestVersion,
							packagesDirectory: PACKAGES_DIRECTORY,
							shouldUpdateVersionCallback: isCKEditor5Package
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
								return path.basename( packageDirectory ).startsWith( 'ckeditor5-build-' );
							},
							signal: abortController.signal,
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
							signal: abortController.signal,
							listrTask: task,
							taskToExecute: compileTypeScriptCallback,
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
							signal: abortController.signal,
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
							signal: abortController.signal,
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
		task: () => {
			return releaseTools.cleanUpPackages( {
				packagesDirectory: RELEASE_DIRECTORY
			} );
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
		skip: cliArguments.nightly
	}
] );

tasks.run()
	.catch( err => {
		process.exitCode = 1;

		console.log( '' );
		console.error( err );
	} );
