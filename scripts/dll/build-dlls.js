#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const chalk = require( 'chalk' );
const childProcess = require( 'child_process' );
const minimist = require( 'minimist' );
const path = require( 'path' );

const argv = minimist( process.argv.slice( 2 ) );

const ROOT_DIRECTORY = argv.cwd ? path.resolve( argv.cwd ) : path.resolve( __dirname, '..', '..' );
const BASE_DLL_CONFIG_PATH = argv[ 'base-dll-config' ] ? path.relative( ROOT_DIRECTORY, argv[ 'base-dll-config' ] ) : null;
const BASE_DLL_PATH = argv[ 'base-dll-path' ];
const IS_DEVELOPMENT_MODE = argv.dev;
const VERBOSE_MODE = argv.verbose;

// Lets highlight and space out the messages in the verbose mode to
// make them stand out from the wall of text that webpack spits out.
const prefix = VERBOSE_MODE ? '\n📍 ' : '';

if ( BASE_DLL_CONFIG_PATH ) {
	console.log( prefix + chalk.bold( 'Creating the base DLL build...' ) );

	const status = execute( {
		command: [ 'yarn', 'webpack', `--config=${ normalizePath( BASE_DLL_CONFIG_PATH ) }` ],
		cwd: BASE_DLL_PATH || ROOT_DIRECTORY
	} );

	if ( status ) {
		console.log( chalk.bold.red( 'Halting the script due to failed base DLL build.' ) );

		process.exit();
	}
}

console.log( prefix + chalk.bold( 'Creating DLL-compatible package builds...' ) );

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
		}
	} );

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
	if ( IS_DEVELOPMENT_MODE ) {
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
		const relativePath = path.relative( process.cwd(), options.cwd );

		const message = [
			chalk.bold( '💥 Build ended with an error:' ),
			subprocess.stderr.trim(),
			'',
			chalk.bold( '🛠️  To reproduce this error, run:' )
		];

		if ( relativePath ) {
			message.push( ` - cd ${ normalizePath( relativePath ) }` );
		}

		message.push( ` - ${ command }`, '' );

		console.log( chalk.red( message.join( '\n' ) ) );
	}

	return subprocess.status;
}
