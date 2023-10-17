/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const chalk = require( 'chalk' );
const upath = require( 'upath' );
const minimist = require( 'minimist' );
const { globSync } = require( 'glob' );
const { spawn } = require( 'child_process' );

const CKEDITOR5_ROOT = upath.join( __dirname, '..', '..' );

const minimistOptions = {
	string: [
		'directory',
		'files'
	],
	alias: {
		d: 'directory',
		f: 'files'
	},
	default: {
		directory: '',
		files: ''
	}
};

const spawnOptions = {
	cwd: CKEDITOR5_ROOT,
	shell: true
};

const globOptions = {
	cwd: CKEDITOR5_ROOT,
	ignore: '**/node_modules/**'
};

const itemsToCheckInsidePackages = [
	'README.md',
	'docs'
];

const defaultPatterns = [
	'CHANGELOG.md',
	'CONTRIBUTING.md',
	'LICENSE.md',
	'README.md',
	'SECURITY.md',
	'docs',
	'external/ckeditor5-commercial/docs',
	...getPathsFromPackages( 'packages' ),
	...getPathsFromPackages( 'external/ckeditor5-commercial/packages' )
];

main();

function main() {
	const args = minimist( process.argv.slice( 2 ), minimistOptions );
	const patterns = args.directory ?
		[ `**/${ args.directory }/**/*.md` ] :
		args.files.split( ',' ).filter( Boolean );
	const valeArgs = [ 'run', 'docs:vale' ];

	if ( patterns.length ) {
		const files = patterns.flatMap( pattern => globSync( pattern, globOptions ) );

		if ( !files.length ) {
			console.log( chalk.red( '\nProvided pattern did not match any files.\n' ) );

			process.exit( 1 );
		}

		console.log( chalk.blue( `\nMatched ${ files.length } files.` ) );

		valeArgs.push( ...files );
	} else {
		valeArgs.push( ...defaultPatterns );
	}

	console.log( chalk.blue( '\nExecuting vale...\n' ) );

	const vale = spawn( 'yarn', valeArgs, spawnOptions );

	vale.stdout.on( 'data', data => {
		const output = data.toString( 'utf-8' );

		if ( output.startsWith( 'yarn run' ) ) {
			return;
		}

		if ( output.startsWith( '$ vale' ) ) {
			return;
		}

		console.log( output );
	} );

	vale.stderr.on( 'data', data => {
		const output = data.toString( 'utf-8' );

		if ( output.trim() === 'The command line is too long.' ) {
			console.log( chalk.red( [
				'Provided pattern matched too many files',
				'to pass their paths through the command line.',
				'Please use a more specific pattern.',
				''
			].join( '\n' ) ) );

			return;
		}

		console.log( chalk.red( data.toString() ) );
	} );

	vale.on( 'close', code => {
		if ( code === 0 ) {
			console.log( chalk.green( 'No errors detected.\n' ) );
		}

		process.exit( code );
	} );
}

function getPathsFromPackages( packagesDirPath ) {
	return itemsToCheckInsidePackages.flatMap( item => {
		const globPattern = upath.join( packagesDirPath, '*', item );

		return globSync( globPattern, globOptions );
	} );
}
