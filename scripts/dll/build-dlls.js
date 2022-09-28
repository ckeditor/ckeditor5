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
const BASE_DLL_CONFIG_PATH = argv[ 'base-dll-config' ] ? path.resolve( argv[ 'base-dll-config' ] ) : null;
const BASE_DLL_PATH = argv[ 'base-dll-path' ];
const IS_DEVELOPMENT_MODE = argv.dev;
const VERBOSE_MODE = argv.verbose;

// Lets highlight and space out the messages in the verbose mode to
// make them stand out from the wall of text that webpack spits out.
const prefix = VERBOSE_MODE ? '\n📍 ' : '';

if ( IS_DEVELOPMENT_MODE ) {
	console.log( chalk.yellow( '\n🛠️️  Development mode is active.\n' ) );
} else {
	console.log( chalk.magenta( '\n⚠️  Production mode is active. Use the "--dev" flag to build in the development mode.\n' ) );
}

if ( BASE_DLL_CONFIG_PATH ) {
	console.log( prefix + chalk.bold( 'Creating the base DLL build...' ) );

	execute( {
		command: [ 'webpack', `--config=${ BASE_DLL_CONFIG_PATH }` ],
		cwd: BASE_DLL_PATH || ROOT_DIRECTORY
	} );
}

console.log( prefix + chalk.bold( 'Creating DLL-compatible package builds...' ) );

getPackageNames( ROOT_DIRECTORY )
	.filter( isNotBaseDll )
	.filter( hasDLLBuildScript )
	.forEach( fullPackageName => {
		console.log( prefix + `Building ${ fullPackageName }...` );

		execute( {
			command: [ 'yarn', 'run', 'dll:build' ],
			cwd: path.join( ROOT_DIRECTORY, 'packages', fullPackageName )
		} );
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
	const packageJsonPath = path.join( process.cwd(), 'packages', name, 'package.json' );
	const scripts = require( packageJsonPath ).scripts;

	return scripts && scripts[ 'dll:build' ];
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

	const subprocess = childProcess.spawnSync( options.command.join( ' ' ), {
		encoding: 'utf8',
		shell: true,
		cwd: options.cwd,
		stdio: VERBOSE_MODE ? 'inherit' : 'pipe'
	} );

	if ( subprocess.stderr && !VERBOSE_MODE ) {
		const color = subprocess.status !== 0 ? chalk.red : chalk.yellow;
		console.log( color( subprocess.stderr.trim() ) );
	}
}
