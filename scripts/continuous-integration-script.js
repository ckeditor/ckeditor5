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

// const errors = {};

childProcess.execSync( 'rm -r -f .nyc_output' );
childProcess.execSync( 'mkdir .nyc_output' );

// failedTestsPackages=""
// failedCoveragePackages=""

// RED='\x1B[0;31m'
const NC = '\x1B[0m';

// # Travis functions inspired by https://github.com/travis-ci/travis-rubies/blob/a10ba31e3f508650204017332a608ef9bce2c733/build.sh.
// function travis_nanoseconds() {
//   local cmd="date"
//   local format="+%s%N"
//   local os=$(uname)

//   if hash gdate > /dev/null 2>&1; then
//     cmd="gdate" # use gdate if available
//   elif [[ "$os" = Darwin ]]; then
//     format="+%s000000000" # fallback to second precision on darwin (does not support %N)
//   fi

//   $cmd -u $format
// }

let travisStartTime;
let timerId;

function travisTimeStart() {
	const nanoSeconds = process.hrtime.bigint();

	timerId = crypto.createHash( 'md5' ).update( nanoSeconds.toString() ).digest( 'hex' );
	travisStartTime = nanoSeconds;
	// @TODO: ANSI_CLEAR
	// Intentional direct write to stdout, to manually control EOL.
	// process.stdout.write( `travis_time:start:${ timerId }\r${ANSI_CLEAR}` );
	process.stdout.write( `travis_time:start:${ timerId }\r\n` );
}

function travisTimeFinish() {
	//	local result=$?
	//	travis_end_time=$(travis_nanoseconds)
	const travisEndTime = process.hrtime.bigint();
	//	travis_end_time=$(travis_nanoseconds)
	//	local duration=$(($travis_end_time-$travis_start_time))
	const duration = travisEndTime - travisStartTime;

	console.log( `Duration ${ duration } nanoseconds.` );

	//	echo -en "\ntravis_time:end:$travis_timer_id:start=$travis_start_time,finish=$travis_end_time,duration=$duration\r\n"
	process.stdout.write(
		`\ntravis_time:end:${ timerId }:start=${ travisStartTime },finish=${ travisEndTime },duration=${ duration }\r\n` );
	//	return $result
}

function foldStart( packageName, foldLabel ) {
	// echo -e "travis_fold:start:$1\x1B[33;1m$2\x1B[0m"
	const hexPrefix = '\x1B';
	console.log( `travis_fold:start:${ packageName }${ hexPrefix }[33;1m${ foldLabel }${ hexPrefix }[0m` );
	travisTimeStart();
}

function foldEnd( packageName ) {
	travisTimeFinish();
	// echo -e "\ntravis_fold:end:${ packageName }\n"
	console.log( `\ntravis_fold:end:${ packageName }\n` );
}

for ( const currentPackage of packages ) {
	foldStart( 'package:' + currentPackage, `Testing ${ currentPackage }${ NC }` );

	// yarn run test - f $package--reporter = dots--production--coverage

	console.log( 'test output would be shown here' );

	console.log( currentPackage );

	foldEnd( 'package:' + currentPackage );
}

// for package in $packages; do

//   fold_start "package:$package" "Testing $package${NC}"

//   yarn run test -f $package --reporter=dots --production --coverage

//   if [ "$?" -ne "0" ]; then
//     echo

//     echo -e "💥 ${RED}$package${NC} failed to pass unit tests 💥"
//     failedTestsPackages="$failedTestsPackages $package"
//     errorOccured=1
//   fi

//   cp coverage/*/coverage-final.json .nyc_output

//   npx nyc check-coverage --branches 100 --functions 100 --lines 100 --statements 100

//   if [ "$?" -ne "0" ]; then
//     echo -e "💥 ${RED}$package${NC} doesn't have required code coverage 💥"
//     failedCoveragePackages="$failedCoveragePackages $package"
//     errorOccured=1
//   fi

//   fold_end "package:$package"
// done;

// if [ "$errorOccured" -eq "1" ]; then
//   echo
//   echo "---"
//   echo

//   if ! [[ -z $failedTestsPackages ]]; then
//     echo -e "Following packages did not pass unit tests:${RED}$failedTestsPackages${NC}"
//   fi

//   if ! [[ -z $failedCoveragePackages ]]; then
//     echo -e "Following packages did not provide required code coverage:${RED}$failedCoveragePackages${NC}"
//   fi

//   echo
//   exit 1 # Will break the CI build
// fi
