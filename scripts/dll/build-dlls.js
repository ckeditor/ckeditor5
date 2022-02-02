#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const childProcess = require( 'child_process' );
const path = require( 'path' );
const chalk = require( 'chalk' );

const ROOT_DIRECTORY = path.resolve( __dirname, '..', '..' );
const IS_DEVELOPMENT_MODE = process.argv.includes( '--dev' );

if ( IS_DEVELOPMENT_MODE ) {
	console.log( '🛠️️  ' + chalk.yellow( 'Development mode is active.' ) );
} else {
	console.log( '⚠️  ' + chalk.magenta( 'Production mode is active. Use --dev to build in the development mode.' ) );
}

// -------------------------------------------------------------
// ------------------------------------------- Base DLL build --

console.log( '\n📍 ' + chalk.cyan.underline( 'Creating the base DLL build...\n' ) );

const webpackArguments = [ '--config=./scripts/dll/webpack.config.dll.js' ];

if ( IS_DEVELOPMENT_MODE ) {
	webpackArguments.push( '--mode=development' );
}

childProcess.spawnSync( 'webpack', webpackArguments, {
	encoding: 'utf8',
	shell: true,
	cwd: ROOT_DIRECTORY,
	stdio: 'inherit',
	stderr: 'inherit'
} );

// -------------------------------------------------------------
// ---------------------------- DLL-compatible package builds --

console.log( '\n📍 ' + chalk.underline( 'Creating DLL-compatible package builds...\n' ) );

const nodeArguments = [ './scripts/dll/build-packages-dlls.js' ];

if ( IS_DEVELOPMENT_MODE ) {
	nodeArguments.push( '--mode=development' );
}

childProcess.spawnSync( 'node', nodeArguments, {
	encoding: 'utf8',
	shell: true,
	cwd: ROOT_DIRECTORY,
	stdio: 'inherit',
	stderr: 'inherit'
} );
