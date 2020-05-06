#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const childProcess = require( 'child_process' );
const crypto = require( 'crypto' );

// var child = child_process.spawnSync("ls", ["-l", "/home"], { encoding : 'utf8' });
// console.log("Process finished.");
// if(child.error) {
//     console.log("ERROR: ",child.error);
// }
// console.log("stdout: ",child.stdout);
// console.log("stderr: ",child.stderr);
// console.log("exist code: ",child.status);

const packages = childProcess.execSync( 'ls packages -1', {
	encoding: 'utf8'
} ).toString().split( '\n' ).splice( 0, 3 );

// console.log( packages );

// packages=$(ls packages -1 | sed -e 's#^ckeditor5\?-\(.\+\)$#\1#')

// errorOccured=0

const failedChecks = {
	dependencyCheck: new Set(),
	unitTests: new Set(),
	codeCoverage: new Set()
};

childProcess.execSync( 'rm -r -f .nyc_output' );
childProcess.execSync( 'mkdir .nyc_output' );

// failedTestsPackages=""
// failedCoveragePackages=""

const RED = '\x1B[0;31m';
const YELLOW = '\x1B[33;1m';
const NO_COLOR = '\x1B[0m';

let travisStartTime;
let timerId;

function travisTimeStart() {
	const nanoSeconds = process.hrtime.bigint();

	timerId = crypto.createHash( 'md5' ).update( nanoSeconds.toString() ).digest( 'hex' );
	travisStartTime = nanoSeconds;

	// Intentional direct write to stdout, to manually control EOL.
	process.stdout.write( `travis_time:start:${ timerId }\r\n` );
}

function travisTimeFinish() {
	const travisEndTime = process.hrtime.bigint();
	const duration = travisEndTime - travisStartTime;

	// Intentional direct write to stdout, to manually control EOL.
	process.stdout.write(
		`\ntravis_time:end:${ timerId }:start=${ travisStartTime },finish=${ travisEndTime },duration=${ duration }\r\n` );
}

function foldStart( packageName, foldLabel ) {
	console.log( `travis_fold:start:${ packageName }${ YELLOW }${ foldLabel }${ NO_COLOR }` );
	travisTimeStart();
}

function foldEnd( packageName ) {
	travisTimeFinish();
	console.log( `\ntravis_fold:end:${ packageName }\n` );
}

for ( const fullPackageName of packages ) {
	const simplePackageName = fullPackageName.replace( /^ckeditor5?-/, '' );

	foldStart( 'package:' + simplePackageName, `Testing ${ fullPackageName }${ NO_COLOR }` );

	const testArguments = [ 'run', 'test', '-f', simplePackageName, '--reporter=dots', '--production', '--coverage' ];
	const testProcess = childProcess.spawnSync( 'yarn', testArguments, {
		encoding: 'utf8',
		shell: true
	} );

	console.log( testProcess.stdout );

	if ( testProcess.status !== 0 ) {
		failedChecks.unitTests.add( simplePackageName );
		console.log( `💥 ${ RED }$package${ NO_COLOR } failed to pass unit tests 💥` );
	}

	childProcess.execSync( 'cp coverage/*/coverage-final.json .nyc_output' );

	const nyc = [ 'nyc', 'check-coverage', '--branches', '100', '--functions', '100', '--lines', '100', '--statements', '100' ];
	const nycProcess = childProcess.spawnSync( 'npx', nyc, {
		encoding: 'utf8',
		shell: true
	} );

	console.log( nycProcess.stdout );

	if ( nycProcess.status !== 0 ) {
		failedChecks.codeCoverage.add( simplePackageName );
		console.log( `💥 ${ RED }$package${ NO_COLOR } doesn't have required code coverage 💥` );
	}

	foldEnd( 'package:' + simplePackageName );
}

function showFailedCheck( checkKey, errorMessage ) {
	const failedPackages = failedChecks[ checkKey ];

	if ( failedPackages.size ) {
		console.log( `${ errorMessage }:${ RED }${ failedPackages.entries() }${ NO_COLOR }` );
	}
}

if ( Object.values( failedChecks ).some( checksSet => checksSet.size > 0 ) ) {
	console.log( '\n---\n' );

	showFailedCheck( 'unitTests', 'The following packages did not pass unit tests' );
	showFailedCheck( 'codeCoverage', 'The following packages did not provide required code coverage' );

	process.exit( 1 ); // Exit code 1 will break the CI bThe following packages did not provide required codeuild
}
