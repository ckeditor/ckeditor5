#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const readline = require( 'readline' );
const releaseTools = require( '@ckeditor/ckeditor5-dev-release-tools' );

const abortController = new AbortController();

// Windows does not understand CTRL+C attached to `process`.
if ( process.platform === 'win32' ) {
	const rl = readline.createInterface( {
		input: process.stdin,
		output: process.stdout
	} );

	rl.on( 'SIGINT', () => process.emit( 'SIGINT' ) );
}

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
		packagesDirectory: 'release',
		processDescription: 'Compiling TypeScript...',
		signal: abortController.signal,
		taskToExecute: require( './compiletypescriptcallback' )
	} );
} )();
