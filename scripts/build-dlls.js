#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const childProcess = require( 'child_process' );
const path = require( 'path' );

const notBaseDLL = name => name !== 'ckeditor5-dll';
const hasDLLBuild = name => {
	const scripts = require( path.join( process.cwd(), 'packages', name, 'package.json' ) ).scripts;

	return scripts && scripts[ 'build:dll' ];
};

const buildDll = fullPackageName => {
	console.log( `Running "${ fullPackageName }" build...` );

	const subprocess = childProcess.spawnSync( 'yarn', [ 'run', 'build:dll' ], {
		encoding: 'utf8',
		shell: true,
		cwd: `packages/${ fullPackageName }/`
	} );

	if ( subprocess.status !== 0 ) {
		console.log( subprocess.stdout );
		console.log( `💥 DLL ${ fullPackageName } build failed 💥` );
	}
};

const packages = childProcess.execSync( 'ls packages -1', {
	encoding: 'utf8'
} ).toString().trim().split( '\n' );

console.log( '------------------------' );
console.log( 'Running full DLL rebuild' );
console.log( '------------------------' );
buildDll( 'ckeditor5-dll' );
console.log( '------------------------' );

packages
	.filter( notBaseDLL )
	.filter( hasDLLBuild )
	.forEach( buildDll );
