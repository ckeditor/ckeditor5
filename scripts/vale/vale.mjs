/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ini from 'ini';
import yaml from 'js-yaml';
import fs from 'fs-extra';
import chalk from 'chalk';
import upath from 'upath';
import minimist from 'minimist';
import { globSync } from 'glob';
import { format } from 'date-fns';
import { spawn } from 'child_process';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';

const VALE_ALERT_LEVELS = {
	error: chalk.red( 'error' ),
	warning: chalk.yellow( 'warning' ),
	suggestion: chalk.blue( 'suggestion' )
};

const ARGS_CHAR_LIMIT = 8000;
const RESULTS_DIR = upath.join( CKEDITOR5_ROOT_PATH, 'scripts', 'vale', 'results' );
const VALE_CONFIG_PATH = upath.join( CKEDITOR5_ROOT_PATH, '.vale.ini' );
const READABILITY_FILES_GLOB = 'scripts/vale/styles/Readability/*.yml';

const originalConfigFilesContents = {};

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

const spawnOptions = {
	cwd: CKEDITOR5_ROOT_PATH,
	shell: true
};

const globOptions = {
	cwd: CKEDITOR5_ROOT_PATH,
	ignore: [
		'**/node_modules/**',
		'**/tests/**'
	]
};

main()
	.catch( err => {
		console.log( chalk.red( '\nScript threw an error:' ) );
		console.log( err );
	} )
	.finally( () => {
		console.log( chalk.blue( 'Restoring config files...\n' ) );

		return restoreConfigFiles();
	} );

async function main() {
	const readabilityFilePaths = globSync( READABILITY_FILES_GLOB, globOptions ).map( upath.toUnix );
	await loadConfigFiles( readabilityFilePaths );

	const args = getArgs();
	validateArgs( args );

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

	console.log( chalk.blue( '\nPreparing config files...' ) );

	await prepareMainConfigFile( args );

	if ( args.save ) {
		await prepareReadabilityConfigFiles( readabilityFilePaths );

		return executeAndSave( args, chunks );
	}

	return executeAndLog( args, chunks );
}

async function executeAndSave( args, chunks ) {
	console.log( chalk.blue( '\nExecuting vale...\n' ) );

	const filesData = [];

	for ( let i = 0; i < chunks.length; i++ ) {
		console.log( chalk.blue( `Processing chunk ${ i + 1 }/${ chunks.length }...` ) );

		const valeData = await runVale( args, chunks[ i ] );

		for ( const key in valeData ) {
			const path = upath.toUnix( key );

			const data = {
				path,
				errors: 0,
				warnings: 0,
				readability: {}
			};

			for ( const note of valeData[ key ] ) {
				if ( note.Severity === 'error' ) {
					data.errors++;

					continue;
				}

				if ( note.Severity !== 'warning' ) {
					continue;
				}

				const match = note.Check.match( /(?<=Readability\.).+/ );

				if ( !match ) {
					data.warnings++;

					continue;
				}

				const [ readabilityMetric ] = match;
				const readabilityScore = Number( note.Message );
				data.readability[ readabilityMetric ] = readabilityScore;
			}

			filesData.push( data );
		}
	}

	const resultPath = upath.join( RESULTS_DIR, `${ format( new Date(), 'yyyy-MM-dd--HH-mm-ss' ) }.csv` );

	console.log( chalk.blue( '\nResult file saved:' ) );
	console.log( chalk.underline( resultPath ) + '\n' );

	await fs.ensureDir( RESULTS_DIR );
	await fs.writeFile( resultPath, filesDataToCsv( filesData ), 'utf-8' );
}

async function executeAndLog( args, chunks ) {
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

		const valeData = await runVale( args, chunks[ i ] );

		for ( const key in valeData ) {
			collectedValeData[ key ] += valeData[ key ];
		}
	}

	console.log( getSummary( args, collectedValeData ) );
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

function runVale( args, files ) {
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

async function loadConfigFiles( readabilityFilePaths ) {
	originalConfigFilesContents[ VALE_CONFIG_PATH ] = await fs.readFile( VALE_CONFIG_PATH, 'utf-8' );

	for ( const readabilityFilePath of readabilityFilePaths ) {
		originalConfigFilesContents[ readabilityFilePath ] = await fs.readFile( readabilityFilePath, 'utf-8' );
	}
}

async function prepareMainConfigFile( args ) {
	const parsedIniFile = ini.parse( originalConfigFilesContents[ VALE_CONFIG_PATH ] );
	parsedIniFile.MinAlertLevel = args.alert;

	await fs.writeFile( VALE_CONFIG_PATH, ini.stringify( parsedIniFile ), 'utf-8' );
}

async function prepareReadabilityConfigFiles( readabilityFilePaths ) {
	for ( const readabilityFilePath of readabilityFilePaths ) {
		const parsedYmlFile = yaml.load( originalConfigFilesContents[ readabilityFilePath ] );
		parsedYmlFile.message = '%s';
		parsedYmlFile.condition = '> -999999';

		await fs.writeFile( readabilityFilePath, yaml.dump( parsedYmlFile ), 'utf-8' );
	}
}

async function restoreConfigFiles() {
	for ( const filePath in originalConfigFilesContents ) {
		const originalFileContent = originalConfigFilesContents[ filePath ];

		await fs.writeFile( filePath, originalFileContent, 'utf-8' );
	}
}

function filesDataToCsv( filesData ) {
	const headers = Object.keys( filesData[ 0 ] ).filter( header => header !== 'readability' );
	const readabilityMetrics = Object.keys( filesData[ 0 ].readability ).sort();

	const data = filesData.map( fileData => [
		...headers.map( header => fileData[ header ] ),
		...readabilityMetrics.map( metric => fileData.readability[ metric ] )
	].join( ',' ) );

	return [ [ headers, readabilityMetrics ].join( ',' ), ...data ].join( '\n' );
}

function getArgs() {
	const parsedIniFile = ini.parse( originalConfigFilesContents[ VALE_CONFIG_PATH ] );

	const minimistOptions = {
		string: [
			'alert',
			'directory'
		],
		boolean: [
			'save'
		],
		alias: {
			a: 'alert',
			d: 'directory',
			s: 'save'
		},
		default: {
			alert: parsedIniFile.MinAlertLevel || 'warning',
			directory: '',
			save: false
		}
	};

	return minimist( process.argv.slice( 2 ), minimistOptions );
}

function validateArgs( args ) {
	const allowedValeAlertLevels = Object.keys( VALE_ALERT_LEVELS );

	if ( !allowedValeAlertLevels.includes( args.alert ) ) {
		const stringifiedAlertLevels = allowedValeAlertLevels.map( level => `"${ chalk.bold( level ) }"` ).join( ', ' );

		console.error( chalk.red( `\nInvalid "alert" option value. Valid values: ${ stringifiedAlertLevels }.\n` ) );

		process.exit( 1 );
	}

	if ( args.save && args.alert !== 'warning' ) {
		console.error( chalk.red( '\nWhile using the "save" option, "alert" option has to be set to its default value: "warning".\n' ) );

		process.exit( 1 );
	}
}

function getSummary( args, collectedValeData ) {
	const formatter = new Intl.ListFormat( 'en', { style: 'long', type: 'conjunction' } );

	const alerts = [ chalk.red( `${ collectedValeData.errors } errors` ) ];

	if ( args.alert === 'warning' || args.alert === 'suggestion' ) {
		alerts.push( chalk.yellow( `${ collectedValeData.warnings } warnings` ) );
	}

	if ( args.alert === 'suggestion' ) {
		alerts.push( chalk.blue( `${ collectedValeData.suggestions } suggestions` ) );
	}

	return [
		chalk.blue( '\nVale execution complete.\n' ),
		collectedValeData.text,
		`\n[Minimal alert level: ${ VALE_ALERT_LEVELS[ args.alert ] }]\n`,
		formatter.format( alerts ),
		` in ${ collectedValeData.files } files.\n`
	].join( '' );
}
