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

const ARGS_CHAR_LIMIT = 8000;
const CKEDITOR5_ROOT = upath.join( __dirname, '..', '..' );

const minimistOptions = {
	string: [
		'directory'
	],
	alias: {
		d: 'directory'
	},
	default: {
		directory: ''
	}
};

const spawnOptions = {
	cwd: CKEDITOR5_ROOT,
	shell: true
};

const globOptions = {
	cwd: CKEDITOR5_ROOT,
	ignore: [
		'**/node_modules/**',
		'**/tests/**'
	]
};

const defaultPatterns = [
	// "README.md", "CHANGELOG.md" etc.
	'*.md',
	'packages/*/*.md',
	'external/ckeditor5-commercial/packages/*/*.md',

	// All "docs" directories.
	'docs',
	'packages/*/docs',
	'external/ckeditor5-commercial/docs',
	'external/ckeditor5-commercial/packages/*/docs'
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
		files.push( ...globSync( defaultPatterns, globOptions ) );
	}

	console.log( chalk.blue( '\nExecuting vale...\n' ) );

	const collectedValeData = {
		errors: 0,
		warnings: 0,
		suggestions: 0,
		files: 0,
		text: ''
	};

	const chunks = splitFilesIntoChunks( files );

	for ( let i = 0; i < chunks.length; i++ ) {
		console.log( chalk.blue( `Processing chunk ${ i + 1 }/${ chunks.length }...` ) );

		const valeData = await runVale( chunks[ i ] );

		for ( const key in valeData ) {
			collectedValeData[ key ] += valeData[ key ];
		}
	}

	console.log( [
		chalk.blue( '\nVale execution complete.\n' ),
		collectedValeData.text,
		chalk.red( `\n${ collectedValeData.errors } errors` ),
		', ',
		chalk.yellow( `${ collectedValeData.warnings } warnings` ),
		' and ',
		chalk.blue( `${ collectedValeData.suggestions } suggestions` ),
		` in ${ collectedValeData.files } files.\n`
	].join( '' ) );
}

function splitFilesIntoChunks( files ) {
	return files.reduce( ( output, currentFile ) => {
		const wrappedFile = `"${ currentFile }"`;
		const lastChunk = output[ output.length - 1 ];
		const canAddFile = [ ...lastChunk, wrappedFile ].join( ' ' ).length <= ARGS_CHAR_LIMIT;

		if ( canAddFile ) {
			lastChunk.push( wrappedFile );
		} else {
			output.push( [ wrappedFile ] );
		}

		return output;
	}, [ [] ] );
}

function runVale( files ) {
	const valeFooterPattern = /\n?.*?(\d+) errors?.*?(\d+) warnings?.*?(\d+) suggestions?.*?(\d+) files?[\s\S]+/;

	return new Promise( resolve => {
		const vale = spawn( 'yarn', [ 'run', 'docs:vale', ...files ], spawnOptions );

		let text = '';

		vale.stdout.on( 'data', stdoutData => ( text += stdoutData.toString( 'utf-8' ) ) );

		vale.stderr.on( 'data', stderrData => {
			const stderrText = stderrData.toString( 'utf-8' );

			if ( stderrText.startsWith( 'error Command failed with exit code 1.' ) ) {
				return;
			}

			throw new Error( stderrText );
		} );

		vale.on( 'close', () => {
			const match = text.match( valeFooterPattern );

			if ( !match ) {
				throw new Error( 'Vale output does not match the footer pattern:\n\n' + text );
			}

			resolve( {
				errors: Number( match[ 1 ] ),
				warnings: Number( match[ 2 ] ),
				suggestions: Number( match[ 3 ] ),
				files: Number( match[ 4 ] ),
				text: text
					.replace( /^\$ vale .+\n/m, '' )
					.replace( valeFooterPattern, '' )
			} );
		} );
	} );
}
