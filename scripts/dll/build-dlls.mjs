#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import path from 'path';
import childProcess from 'child_process';
import chalk from 'chalk';
import fs from 'fs-extra';
import minimist from 'minimist';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';

const COLLABORATION_DLL_PACKAGE_NAME = 'ckeditor5-collaboration';

const argv = minimist( process.argv.slice( 2 ), {
	string: [
		'base-dll-config',
		'base-dll-path'
	],
	boolean: [
		// Whether to skip building the base DLL.
		'skip-base-dll',
		// Whether to skip building packages DLL files.
		'skip-packages-dll'
	],
	default: {
		'skip-base-dll': false,
		'skip-packages-dll': false
	}
} );

const ROOT_DIRECTORY = argv.cwd ? path.resolve( argv.cwd ) : CKEDITOR5_ROOT_PATH;
const DEVELOPMENT_MODE = argv.dev;
const VERBOSE_MODE = argv.verbose;

// Lets highlight and space out the messages in the verbose mode to
// make them stand out from the wall of text that webpack spits out.
const prefix = VERBOSE_MODE ? '\n📍 ' : '';

if ( argv[ 'base-dll-config' ] && !argv[ 'skip-base-dll' ] ) {
	console.log( prefix + chalk.bold( 'Creating the base DLL build...' ) );

	const baseDllPath = argv[ 'base-dll-path' ] || ROOT_DIRECTORY;
	const baseDllConfigPath = path.relative( baseDllPath, argv[ 'base-dll-config' ] );

	const status = execute( {
		command: [ 'yarn', 'webpack', `--config=${ normalizePath( baseDllConfigPath ) }` ],
		cwd: baseDllPath
	} );

	if ( status ) {
		console.log( chalk.bold.red( 'Halting the script due to failed base DLL build.' ) );

		process.exit( 1 );
	}
}

if ( !argv[ 'skip-packages-dll' ] ) {
	console.log( prefix + chalk.bold( 'Creating DLL-compatible package builds...' ) );

	let exitCode = 0;

	getPackageNames( ROOT_DIRECTORY )
		.filter( isNotBaseDll )
		.filter( hasDLLBuildScript )
		.sort( packageName => packageName === COLLABORATION_DLL_PACKAGE_NAME ? -1 : 1 )
		.forEach( fullPackageName => {
			console.log( prefix + `Building ${ fullPackageName }...` );

			const status = execute( {
				command: [ 'yarn', 'run', 'dll:build' ],
				cwd: path.join( ROOT_DIRECTORY, 'packages', fullPackageName )
			} );

			const colorFn = chalk.bold.red;

			if ( status ) {
				console.log( colorFn( 'Script will continue the execution for other packages, but the failed build will be missing.' ) );
				console.log( colorFn( 'If the missing build is built manually, the entire script does not have to be repeated.' ) );

				exitCode = 1;
			}
		} );

	process.exit( exitCode );
}

/**
 * @param {String} cwd
 * @returns {Array<String>}
 */
function getPackageNames( cwd ) {
	return childProcess.execSync( 'ls -1 packages', {
		encoding: 'utf8',
		cwd
	} ).toString().trim().split( '\n' );
}

/**
 * @param {String} name
 * @returns {Boolean}
 */
function isNotBaseDll( name ) {
	return name !== 'ckeditor5-dll';
}

/**
 * @param {String} name
 * @returns {Boolean}
 */
function hasDLLBuildScript( name ) {
	const packageJsonPath = path.join( ROOT_DIRECTORY, 'packages', name, 'package.json' );

	if ( !fs.existsSync( packageJsonPath ) ) {
		return false;
	}

	const { scripts } = fs.readJsonSync( packageJsonPath );

	return Boolean( scripts && scripts[ 'dll:build' ] );
}

/**
 * @param {String} string
 * @returns {String}
 */
function normalizePath( string ) {
	return string.split( path.sep ).join( path.posix.sep );
}

/**
 * @param {Object} options
 * @param {Array<String>} options.command
 * @param {String} options.cwd
 */
function execute( options ) {
	if ( DEVELOPMENT_MODE ) {
		options.command.push( '--mode=development' );
	}

	const command = options.command.join( ' ' );

	const subprocess = childProcess.spawnSync( command, {
		encoding: 'utf8',
		shell: true,
		cwd: options.cwd,
		stdio: VERBOSE_MODE ? 'inherit' : 'pipe'
	} );

	if ( subprocess.status !== 0 && subprocess.stderr && !VERBOSE_MODE ) {
		const message = [
			chalk.bold( '💥 Build ended with an error:' ),
			subprocess.stderr.trim(),
			'',
			chalk.bold( '🛠️  To reproduce this error, run:' ),
			` - cd ${ normalizePath( path.resolve( options.cwd ) ) }`,
			` - ${ command }`,
			''
		];

		console.log( chalk.red( message.join( '\n' ) ) );
	}

	return subprocess.status;
}
