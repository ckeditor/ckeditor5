#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const releaseTools = require( '@ckeditor/ckeditor5-dev-release-tools' );

const abortController = new AbortController();

const RELEASE_DIRECTORY = 'release';

process.on( 'SIGINT', () => {
	abortController.abort( 'SIGINT' );
} );

( async () => {
	const latestVersion = releaseTools.getLastFromChangelog();

	releaseTools.updateDependencies( {
		version: '^' + latestVersion,
		shouldUpdateVersionCallback: require( './isckeditor5package' )
	} );

	await releaseTools.executeInParallel( {
		packagesDirectory: RELEASE_DIRECTORY,
		processDescription: 'Compiling TypeScript...',
		signal: abortController.signal,
		taskToExecute: require( './compiletypescriptcallback' )
	} );

	await releaseTools.executeInParallel( {
		packagesDirectory: RELEASE_DIRECTORY,
		processDescription: 'Preparing DLL builds...',
		signal: abortController.signal,
		taskToExecute: require( './preparedllbuildscallback' )
	} );
} )();
