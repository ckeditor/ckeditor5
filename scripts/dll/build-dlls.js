#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const chalk = require( 'chalk' );
const childProcess = require( 'child_process' );
const fs = require( 'fs' );
const minimist = require( 'minimist' );
const path = require( 'path' );

const argv = minimist( process.argv.slice( 2 ) );

const ROOT_DIRECTORY = argv.cwd ? path.resolve( argv.cwd ) : path.resolve( __dirname, '..', '..' );
const DEVELOPMENT_MODE = argv.dev;
const VERBOSE_MODE = argv.verbose;

// Lets highlight and space out the messages in the verbose mode to
// make them stand out from the wall of text that webpack spits out.
const prefix = VERBOSE_MODE ? '\n📍 ' : '';

if ( argv[ 'base-dll-config' ] ) {
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

console.log( prefix + chalk.bold( 'Creating DLL-compatible package builds...' ) );

let exitCode = 0;

getPackageNames( ROOT_DIRECTORY )
	.filter( isNotBaseDll )
	.filter( hasDLLBuildScript )
	.forEach( fullPackageName => {
		console.log( prefix + `Building ${ fullPackageName }...` );

		const status = execute( {
			command: [ 'yarn', 'run', 'dll:build' ],
			cwd: path.join( ROOT_DIRECTORY, 'packages', fullPackageName )
		} );

		if ( status ) {
			console.log( chalk.bold.red( 'Script will continue the execution for other packages, but the failed build will be missing.' ) );
			console.log( chalk.bold.red( 'If the missing build is built manually, the entire script does not have to be repeated.' ) );

			exitCode = 1;
		}
	} );

process.exit( exitCode );

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

	const scripts = require( packageJsonPath ).scripts;

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
