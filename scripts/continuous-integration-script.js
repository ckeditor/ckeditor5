#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const childProcess = require( 'child_process' );
const crypto = require( 'crypto' );

const failedChecks = {
	dependency: new Set(),
	unitTests: new Set(),
	codeCoverage: new Set()
};

const RED = '\x1B[0;31m';
const YELLOW = '\x1B[33;1m';
const NO_COLOR = '\x1B[0m';

const travis = {
	_lastTimerId: null,
	_lastStartTime: null,

	foldStart( packageName, foldLabel ) {
		console.log( `travis_fold:start:${ packageName }${ YELLOW }${ foldLabel }${ NO_COLOR }` );
		this._timeStart();
	},

	foldEnd( packageName ) {
		this._timeFinish();
		console.log( `\ntravis_fold:end:${ packageName }\n` );
	},

	_timeStart() {
		const nanoSeconds = process.hrtime.bigint();

		this._lastTimerId = crypto.createHash( 'md5' ).update( nanoSeconds.toString() ).digest( 'hex' );
		this._lastStartTime = nanoSeconds;

		// Intentional direct write to stdout, to manually control EOL.
		process.stdout.write( `travis_time:start:${ this._lastTimerId }\r\n` );
	},

	_timeFinish() {
		const travisEndTime = process.hrtime.bigint();
		const duration = travisEndTime - this._lastStartTime;

		// Intentional direct write to stdout, to manually control EOL.
		process.stdout.write( `\ntravis_time:end:${ this._lastTimerId }:start=${ this._lastStartTime },` +
			`finish=${ travisEndTime },duration=${ duration }\r\n` );
	}
};

childProcess.execSync( 'rm -r -f .nyc_output' );
childProcess.execSync( 'mkdir .nyc_output' );

const packages = childProcess.execSync( 'ls packages -1', {
	encoding: 'utf8'
} ).toString().trim().split( '\n' ).splice( 0, 3 );

for ( const fullPackageName of packages ) {
	const simplePackageName = fullPackageName.replace( /^ckeditor5?-/, '' );
	const foldLabelName = 'pkg-' + simplePackageName;

	travis.foldStart( foldLabelName, `Testing ${ fullPackageName }${ NO_COLOR }` );

	// Service job id needs to be unique for each run (#6733). I know that this will not make the env variable to change in OS, but only
	// locally in this process, and processes spawned by this process - but that's enough for what we want.
	process.env.COVERALLS_SERVICE_JOB_ID = parseInt( process.env.COVERALLS_SERVICE_JOB_ID || 1 ) + 1;

	console.log( 'Job id: ' + process.env.COVERALLS_SERVICE_JOB_ID );
	console.log( 'Parallel: ' + process.env.COVERALLS_PARALLEL );

	runSubprocess( 'npx', [ 'ckeditor5-dev-tests-check-dependencies', `packages/${ fullPackageName }` ], simplePackageName, 'dependency',
		'have a dependency problem' );

	const testArguments = [ 'run', 'test', '-f', simplePackageName, '--reporter=dots', '--production', '--coverage' ];
	runSubprocess( 'yarn', testArguments, simplePackageName, 'unitTests', 'failed to pass unit tests' );

	childProcess.execSync( 'cp coverage/*/coverage-final.json .nyc_output' );

	const nyc = [ 'nyc', 'check-coverage', '--branches', '100', '--functions', '100', '--lines', '100', '--statements', '100' ];
	runSubprocess( 'npx', nyc, simplePackageName, 'codeCoverage', 'doesn\'t have required code coverage' );

	travis.foldEnd( foldLabelName );
}

if ( Object.values( failedChecks ).some( checksSet => checksSet.size > 0 ) ) {
	console.log( '\n---\n' );

	showFailedCheck( 'dependency', 'The following packages have dependencies that are not included in its package.json' );
	showFailedCheck( 'unitTests', 'The following packages did not pass unit tests' );
	showFailedCheck( 'codeCoverage', 'The following packages did not provide required code coverage' );

	process.exit( 1 ); // Exit code 1 will break the CI build.
}

/*
 * @param {String} binaryName - Name of a CLI binary to be called.
 * @param {String[]} cliArguments - An array of arguments to be passed to the `binaryName`.
 * @param {String} packageName - Checked package name.
 * @param {String} checkName - A key associated with the problem in the `failedChecks` dictionary.
 * @param {String} failMessage - Message to be shown if check failed.
 */
function runSubprocess( binaryName, cliArguments, packageName, checkName, failMessage ) {
	const subprocess = childProcess.spawnSync( binaryName, cliArguments, {
		encoding: 'utf8',
		shell: true
	} );

	console.log( subprocess.stdout );

	if ( subprocess.stderr ) {
		console.log( subprocess.stderr );
	}

	if ( subprocess.status !== 0 ) {
		failedChecks.unitTests.add( packageName );
		console.log( `💥 ${ RED }${ packageName }${ NO_COLOR } ` + failMessage + ' 💥' );
	}
}

function showFailedCheck( checkKey, errorMessage ) {
	const failedPackages = failedChecks[ checkKey ];

	if ( failedPackages.size ) {
		console.log( `${ errorMessage }: ${ RED }${ Array.from( failedPackages.values() ).join( ', ' ) }${ NO_COLOR }` );
	}
}
