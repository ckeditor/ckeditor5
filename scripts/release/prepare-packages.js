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
	await releaseTools.executeInParallel( {
		packagesDirectory: 'release',
		processDescription: 'Compiling TypeScript...',
		signal: abortController.signal,
		taskToExecute: compileTypeScriptCallback
	} );

	/**
	 * @param {String} packagePath
	 */
	function compileTypeScriptCallback( packagePath ) {
		const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );
		const path = require( 'path' );
		const fs = require( 'fs' );

		const packageJsonPath = path.join( packagePath, 'package.json' );
		const packageJson = require( packageJsonPath );

		if ( !isPackageWrittenInTs() ) {
			return;
		}

		tools.shExec( 'yarn run build', {
			cwd: packagePath,
			verbosity: 'error'
		} );

		tools.updateJSONFile( packageJsonPath, json => {
			const { main } = json;

			if ( main ) {
				json.main = main.replace( /\.ts$/, '.js' );
				json.types = main.replace( /\.ts$/, '.d.ts' );
			}

			return json;
		} );

		function isPackageWrittenInTs() {
			// Almost all CKEditor 5 packages define an entry point. When it points to a TypeScript file,
			// the package is written in TS.
			if ( packageJson.main ) {
				return packageJson.main.includes( '.ts' );
			}

			// Otherwise, let's check if the package contains a `tsconfig.json` file.
			return fs.existsSync( path.join( packagePath, 'tsconfig.json' ) );
		}
	}
} )();
