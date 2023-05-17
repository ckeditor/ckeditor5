#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

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

const cliArguments = parseArguments( process.argv.slice( 2 ) );

// `executeInParallel()` is executed thrice.
EventEmitter.defaultMaxListeners = ( cliArguments.concurrency * 3 + 1 );

const abortController = new AbortController();
const PACKAGES_DIRECTORY = 'packages';
const RELEASE_DIRECTORY = 'release';
const latestVersion = releaseTools.getLastFromChangelog();

const taskOptions = {
	rendererOptions: {
		collapseSubtasks: false
	}
};

process.on( 'SIGINT', () => {
	abortController.abort( 'SIGINT' );
} );

const tasks = new Listr( [
	{
		title: 'Preparation phase.',
		task: ( _, task ) => {
			return task.newListr( [
				{
					title: 'Updating "version" value.',
					task: () => {
						return releaseTools.updateDependencies( {
							version: '^' + latestVersion,
							packagesDirectory: PACKAGES_DIRECTORY,
							shouldUpdateVersionCallback: isCKEditor5Package
						} );
					}
				},
				{
					title: 'Updating dependencies.',
					task: () => {
						return releaseTools.updateVersions( {
							packagesDirectory: PACKAGES_DIRECTORY,
							version: latestVersion
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
					title: 'Prepare "ckeditor5" package files.',
					task: () => {
						return buildTsAndDllForCkeditor5Root();
					}
				},
				{
					title: 'Prepare "ckeditor5-build-*" builds.',
					task: () => {
						// TODO: Waits for #14177.
						return Promise.resolve();
					}
				},
				{
					title: 'Compile TypeScript in `ckeditor5-*` packages.',
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
					title: 'Copying CKEditor 5 packages.',
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
					title: 'Update entries in `package.json`.',
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
					title: 'Prepare DLL builds.',
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
		title: 'Commit & tag.',
		task: ctx => {
			return releaseTools.commitAndTag( {
				version: latestVersion,
				files: [
					'package.json',
					`${ PACKAGES_DIRECTORY }/*/package.json`,
					...ctx.updatedFiles
				]
			} );
		}
	}
], taskOptions );

tasks.run()
	.catch( err => {
		console.error( err );
	} );
