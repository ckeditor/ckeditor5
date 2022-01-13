#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const childProcess = require( 'child_process' );
const path = require( 'path' );

const ROOT_DIRECTORY = path.resolve( __dirname, '..', '..' );
const IS_DEVELOPMENT_MODE = process.argv.includes( '--dev' );

const notBaseDLL = name => name !== 'ckeditor5-dll';
const hasDLLBuild = name => {
	const scripts = require( path.join( process.cwd(), 'packages', name, 'package.json' ) ).scripts;

	return scripts && scripts[ 'dll:build' ];
};

const buildDll = fullPackageName => {
	console.log( `Running "${ fullPackageName }" build...` );

	const yarnArguments = [ 'run', 'dll:build' ];

	if ( IS_DEVELOPMENT_MODE ) {
		yarnArguments.push( '--dev' );
	}

	const subprocess = childProcess.spawnSync( 'yarn', yarnArguments, {
		encoding: 'utf8',
		shell: true,
		cwd: path.join( ROOT_DIRECTORY, 'packages', fullPackageName )
	} );

	if ( subprocess.status !== 0 ) {
		console.log( subprocess.stdout );
		console.log( `💥 DLL ${ fullPackageName } build failed 💥` );
	}
};

const packages = childProcess.execSync( 'ls -1 packages', {
	encoding: 'utf8',
	cwd: ROOT_DIRECTORY
} ).toString().trim().split( '\n' );

packages
	.filter( notBaseDLL )
	.filter( hasDLLBuild )
	.forEach( buildDll );
