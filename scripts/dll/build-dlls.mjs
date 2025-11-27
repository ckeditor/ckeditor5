#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import path from 'node:path';
import childProcess from 'node:child_process';
import chalk from 'chalk';
import fs from 'fs-extra';
import minimist from 'minimist';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';
import { rspack } from '@rspack/core';
import { pathToFileURL } from 'node:url';
import { styleText } from 'node:util';

const PRIORITY_PACKAGES = [
	'ckeditor5',
	'ckeditor5-collaboration'
];

const argv = minimist( process.argv.slice( 2 ) );

const ROOT_DIRECTORY = argv.cwd ? path.resolve( argv.cwd ) : CKEDITOR5_ROOT_PATH;
const DEVELOPMENT_MODE = argv.dev;
const VERBOSE_MODE = argv.verbose;

console.log( '📍 Building DLL package in ' + styleText( 'blue', ROOT_DIRECTORY ) );

execute( {
	cwd: ROOT_DIRECTORY,
	command: [ 'pnpm', '-r', 'predll:build' ]
} );

const { priorityPackages, packages } = getPackageNames( ROOT_DIRECTORY )
	.filter( hasDLLBuildScript )
	.reduce( ( result, packageName ) => {
		if ( PRIORITY_PACKAGES.includes( packageName ) ) {
			result.priorityPackages.push( packageName );
		} else {
			result.packages.push( packageName );
		}

		return result;
	}, { priorityPackages: [], packages: [] } );

await runRspack(
	await Promise.all( priorityPackages.map( getPackageWebpackConfig ) )
);

await runRspack(
	await Promise.all( packages.map( getPackageWebpackConfig ) )
);

function getPackageWebpackConfig( packageName ) {
	const configPath = path.join( ROOT_DIRECTORY, 'packages', packageName, 'webpack.config.mjs' );

	return import( pathToFileURL( configPath ).href ).then( module => module.default );
}

function runRspack( configs ) {
	return new Promise( ( resolve, reject ) => {
		rspack( configs, ( err, stats ) => {
			if ( err ) {
				return reject( err );
			}

			if ( stats?.hasErrors?.() ) {
				return reject( new Error( stats.toString( { all: false, errors: true } ) ) );
			}

			resolve();
		} );
	} );
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
