/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs-extra' );
const chalk = require( 'chalk' );
const upath = require( 'upath' );
const minimist = require( 'minimist' );
const { globSync } = require( 'glob' );
const { spawn } = require( 'child_process' );

const ARGS_CHAR_LIMIT = 8000;
const CKEDITOR5_ROOT = upath.join( __dirname, '..', '..' );
const RESULTS_DIR = upath.join( CKEDITOR5_ROOT, 'scripts', 'vale', 'results' );
const VALE_CONFIG_PATH = upath.join( CKEDITOR5_ROOT, '.vale.ini' );
const READABILITY_FILES_GLOB = 'scripts/vale/styles/Readability/*.yml';

const originalFileContents = {};

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

const minimistOptions = {
	string: [
		'directory'
	],
	boolean: [
		'save'
	],
	alias: {
		d: 'directory',
		s: 'save'
	},
	default: {
		directory: '',
		save: false
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

const args = minimist( process.argv.slice( 2 ), minimistOptions );

main();

async function main() {
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

	const chunks = splitFilesIntoChunks( files );

	if ( args.save ) {
		return executeAndSave( chunks ).catch( err => {
			console.log( chalk.red( '\nScript threw an error:' ) );
			console.log( err );

			console.log( chalk.blue( '\nRestoring config files...\n' ) );

			restoreConfigFiles();
		} );
	}

	return executeAndLog( chunks );
}

async function executeAndSave( chunks ) {
	console.log( chalk.blue( '\nPreparing config files...' ) );

	prepareConfigFiles();

	console.log( chalk.blue( '\nExecuting vale...\n' ) );

	const collectedValeData = {};

	for ( let i = 0; i < chunks.length; i++ ) {
		console.log( chalk.blue( `Processing chunk ${ i + 1 }/${ chunks.length }...` ) );

		const valeData = await runVale( chunks[ i ] );

		for ( const key in valeData ) {
			const filePath = upath.toUnix( key );

			if ( !collectedValeData[ filePath ] ) {
				collectedValeData[ filePath ] = {
					readability: {},
					warnings: 0,
					errors: 0
				};
			}

			for ( const note of valeData[ key ] ) {
				if ( note.Severity === 'error' ) {
					collectedValeData[ filePath ].errors++;

					continue;
				}

				if ( note.Severity !== 'warning' ) {
					continue;
				}

				const match = note.Check.match( /(?<=Readability\.).+/ );

				if ( !match ) {
					collectedValeData[ filePath ].warnings++;

					continue;
				}

				const [ readabilityMetric ] = match;
				const readabilityScore = Number( note.Message );
				collectedValeData[ filePath ].readability[ readabilityMetric ] = readabilityScore;
			}
		}
	}

	console.log( chalk.blue( '\nRestoring config files...' ) );

	restoreConfigFiles();

	const resultPath = upath.join( RESULTS_DIR, `${ Date.now() }.json` );

	console.log( chalk.blue( '\nResult file saved:' ) );
	console.log( chalk.underline( resultPath ) + '\n' );

	fs.ensureDirSync( RESULTS_DIR );
	fs.writeFileSync( resultPath, JSON.stringify( collectedValeData, null, '\t' ), 'utf-8' );
}

async function executeAndLog( chunks ) {
	console.log( chalk.blue( '\nExecuting vale...\n' ) );

	const collectedValeData = {
		errors: 0,
		warnings: 0,
		suggestions: 0,
		files: 0,
		text: ''
	};

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
	const valeCommandPattern = /^\$ vale .+\n/m;
	const commandInfoLinePattern = /^info Visit .+\n/m;
	const valeFooterPattern = /\n?.*?(\d+) errors?.*?(\d+) warnings?.*?(\d+) suggestions?.*?(\d+) files?[\s\S]+/;

	return new Promise( resolve => {
		const valeArgs = [ 'run', 'docs:vale' ];

		if ( args.save ) {
			valeArgs.push( '--output=JSON' );
		}

		valeArgs.push( ...files );

		const vale = spawn( 'yarn', valeArgs, spawnOptions );

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
			if ( args.save ) {
				const rawJson = text
					.replace( valeCommandPattern, '' )
					.replace( commandInfoLinePattern, '' );

				return resolve( JSON.parse( rawJson ) );
			}

			const match = text.match( valeFooterPattern );

			if ( !match ) {
				throw new Error( 'Vale output does not match the footer pattern:\n\n' + text );
			}

			return resolve( {
				errors: Number( match[ 1 ] ),
				warnings: Number( match[ 2 ] ),
				suggestions: Number( match[ 3 ] ),
				files: Number( match[ 4 ] ),
				text: text
					.replace( valeCommandPattern, '' )
					.replace( valeFooterPattern, '' )
			} );
		} );
	} );
}

function prepareConfigFiles() {
	originalFileContents[ VALE_CONFIG_PATH ] = fs.readFileSync( VALE_CONFIG_PATH, 'utf-8' );

	const newValeConfigContent = originalFileContents[ VALE_CONFIG_PATH ]
		.replace( /(?<=\nMinAlertLevel = )[a-z]+(?=\n)/, 'warning' );

	fs.writeFileSync( VALE_CONFIG_PATH, newValeConfigContent, 'utf-8' );

	globSync( READABILITY_FILES_GLOB, globOptions )
		.map( upath.toUnix )
		.forEach( readabilityFilePath => {
			originalFileContents[ readabilityFilePath ] = fs.readFileSync( readabilityFilePath, 'utf-8' );

			const newReadabilityFileContent = originalFileContents[ readabilityFilePath ]
				.replace( /(?<=\nmessage: ").+(?="\n)/, '%s' )
				.replace( /(?<=\ncondition: ").+(?="\n)/, '> -999999' );

			fs.writeFileSync( readabilityFilePath, newReadabilityFileContent, 'utf-8' );
		} );
}

function restoreConfigFiles() {
	for ( const filePath in originalFileContents ) {
		const originalFileContent = originalFileContents[ filePath ];

		fs.writeFileSync( filePath, originalFileContent, 'utf-8' );
	}
}
