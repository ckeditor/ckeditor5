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

const ARGS_CHAR_LIMIT = 4000;
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

async function main() {
	const args = minimist( process.argv.slice( 2 ), minimistOptions );
	const patterns = args.directory ? [ `**/${ args.directory }/**/*.md` ] : args._;
	const files = [];

	if ( patterns.length ) {
		const globOutput = globSync( patterns, globOptions );

		if ( !globOutput.length ) {
			console.log( chalk.red( '\nProvided pattern did not match any files.\n' ) );

			process.exit( 1 );
		}

		files.push( ...globOutput );
	} else {
		files.push( ...defaultPatterns );
	}

	console.log( chalk.blue( '\nExecuting vale...\n' ) );

	const countersTotal = {
		errors: 0,
		warnings: 0,
		suggestions: 0,
		files: 0
	};

	const chunks = splitFilesIntoChunks( files );

	for ( let i = 0; i < chunks.length; i++ ) {
		console.log( chalk.blue( `Processing chunk ${ i + 1 }/${ chunks.length }...\n` ) );

		const counters = await runVale( chunks[ i ] );

		for ( const key in counters ) {
			countersTotal[ key ] += counters[ key ];
		}
	}

	console.log( chalk.blue( '\nVale execution complete.\n' ) );
	console.log( [
		chalk.red( `${ countersTotal.errors } errors` ),
		', ',
		chalk.yellow( `${ countersTotal.warnings } warnings` ),
		' and ',
		chalk.blue( `${ countersTotal.suggestions } suggestions` ),
		` in ${ countersTotal.files } files.`
	].join( '' ) );
}

function splitFilesIntoChunks( files ) {
	return files.reduce( ( output, currentFile ) => {
		const lastChunk = output[ output.length - 1 ];
		const canAddFile = [ ...lastChunk, currentFile ].join( ' ' ).length <= ARGS_CHAR_LIMIT;

		if ( canAddFile ) {
			lastChunk.push( currentFile );
		} else {
			output.push( [ currentFile ] );
		}

		return output;
	}, [ [] ] );
}

function runVale( files ) {
	const valeFooterPattern = /\n.*?(\d+) errors?.*?(\d+) warnings?.*?(\d+) suggestions?.*?(\d+) files?[\s\S]+/;

	return new Promise( ( resolve, reject ) => {
		const vale = spawn( 'yarn', [ 'run', 'docs:vale', ...files ], spawnOptions );

		let output = '';

		vale.stdout.on( 'data', data => {
			output += data.toString( 'utf-8' );
		} );

		vale.stderr.on( 'data', data => {
			const output = data.toString( 'utf-8' );

			if ( output.startsWith( 'error Command failed with exit code 1.' ) ) {
				return;
			}

			reject( output );
		} );

		vale.on( 'close', () => {
			const match = output.match( valeFooterPattern );

			if ( !match ) {
				resolve( {} );
			}

			console.log( output
				.replace( /^\$ vale .+\n/m, '' )
				.replace( valeFooterPattern, '' )
			);

			resolve( {
				errors: Number( match[ 1 ] ),
				warnings: Number( match[ 2 ] ),
				suggestions: Number( match[ 3 ] ),
				files: Number( match[ 4 ] )
			} );
		} );
	} );
}

function getPathsFromPackages( packagesDirPath ) {
	const globPatterns = itemsToCheckInsidePackages.map( item => upath.join( packagesDirPath, '*', item ) );

	return globSync( globPatterns, globOptions );
}
