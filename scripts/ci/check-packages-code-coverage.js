/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const childProcess = require( 'child_process' );
const fs = require( 'fs' );
const glob = require( 'glob' );
const path = require( 'path' );
const Travis = require( './travis-folder' );
const { red, yellow } = require( './ansi-colors' );

const failedChecks = {
	dependency: new Set(),
	unitTests: new Set(),
	codeCoverage: new Set()
};

/**
 * This script should be used on Travis CI. It executes tests and prepares the code coverage report
 * for each package found in the `packages/` directory. Then, all reports are merged into a single
 * file that will be sent to Coveralls.
 */
module.exports = function checkPackagesCodeCoverage() {
	const travis = new Travis();

	childProcess.execSync( 'rm -r -f .nyc_output' );
	childProcess.execSync( 'mkdir .nyc_output' );
	childProcess.execSync( 'rm -r -f .out' );
	childProcess.execSync( 'mkdir .out' );

	// Temporary: Do not check the `ckeditor5-minimap` package(s).
	const excludedPackages = [ 'ckeditor5-minimap' ];
	const packages = childProcess.execSync( 'ls -1 packages', { encoding: 'utf8' } )
		.toString()
		.trim()
		.split( '\n' )
		.filter( fullPackageName => !excludedPackages.includes( fullPackageName ) );

	packages.unshift( 'ckeditor5' );

	for ( const fullPackageName of packages ) {
		const simplePackageName = fullPackageName.replace( /^ckeditor5?-/, '' );
		const foldLabelName = 'pkg-' + simplePackageName;

		travis.foldStart( `travis_fold:start:${ foldLabelName }${ yellow( `Testing ${ fullPackageName }` ) }` );

		appendCoverageReport();

		runSubprocess( {
			binaryName: 'npx',
			cliArguments: [ 'ckeditor5-dev-tests-check-dependencies', `packages/${ fullPackageName }` ],
			packageName: simplePackageName,
			checkName: 'dependency',
			failMessage: 'have a dependency problem'
		} );

		runSubprocess( {
			binaryName: 'yarn',
			cliArguments: [ 'run', 'test', '-f', simplePackageName, '--reporter=dots', '--production', '--coverage' ],
			packageName: simplePackageName,
			checkName: 'unitTests',
			failMessage: 'failed to pass unit tests'
		} );

		childProcess.execSync( 'cp coverage/*/coverage-final.json .nyc_output' );

		runSubprocess( {
			binaryName: 'npx',
			cliArguments: [ 'nyc', 'check-coverage', '--branches', '100', '--functions', '100', '--lines', '100', '--statements', '100' ],
			packageName: simplePackageName,
			checkName: 'codeCoverage',
			failMessage: 'doesn\'t have required code coverage'
		} );

		travis.foldEnd( `\ntravis_fold:end:${ foldLabelName }\n` );
	}

	console.log( 'Uploading combined code coverage report…' );

	if ( shouldUploadCoverageReport() ) {
		childProcess.execSync( 'npx coveralls < .out/combined_lcov.info' );
	} else {
		console.log( 'Since the PR comes from the community, we do not upload code coverage report.' );
		console.log( 'Read more why: https://github.com/ckeditor/ckeditor5/issues/7745.' );
	}

	console.log( 'Done' );

	if ( Object.values( failedChecks ).some( checksSet => checksSet.size > 0 ) ) {
		console.log( '\n---\n' );

		console.log( red( '🔥 Errors were detected by the CI.\n\n' ) );

		showFailedCheck( 'dependency', 'The following packages have dependencies that are not included in its package.json' );
		showFailedCheck( 'unitTests', 'The following packages did not pass unit tests' );
		showFailedCheck( 'codeCoverage', 'The following packages did not provide required code coverage' );

		console.log( '\n---\n' );

		process.exit( 1 ); // Exit code 1 will break the CI build.
	}
};

/**
 * @param {Object} options
 * @param {String} options.binaryName Name of a CLI binary to be called.
 * @param {Array.<String>} options.cliArguments An array of arguments to be passed to the `binaryName`.
 * @param {String} options.packageName Checked package name.
 * @param {String} options.checkName A key associated with the problem in the `failedChecks` dictionary.
 * @param {String} options.failMessage Message to be shown if check failed.
 */
function runSubprocess( { binaryName, cliArguments, packageName, checkName, failMessage } ) {
	const subprocess = childProcess.spawnSync( binaryName, cliArguments, {
		encoding: 'utf8',
		shell: true
	} );

	console.log( subprocess.stdout );

	if ( subprocess.stderr ) {
		console.log( subprocess.stderr );
	}

	if ( subprocess.status !== 0 ) {
		failedChecks[ checkName ].add( packageName );
		console.log( red( `💥 ${ packageName } ` ) + failMessage + ' 💥' );
	}
}

function showFailedCheck( checkKey, errorMessage ) {
	const failedPackages = failedChecks[ checkKey ];

	if ( failedPackages.size ) {
		console.log( `${ errorMessage }: ${ red( Array.from( failedPackages.values() ).join( ', ' ) ) }` );
	}
}

function appendCoverageReport() {
	// Appends coverage data to the combined code coverage info file. It's used because all the results
	// needs to be uploaded at once (#6742).
	const matches = glob.sync( 'coverage/*/lcov.info' );

	matches.forEach( filePath => {
		const buffer = fs.readFileSync( filePath );
		const reportPath = [ '.out', 'combined_lcov.info' ].join( path.sep );

		fs.writeFileSync( reportPath, buffer, { flag: 'as' } );
	} );
}

function shouldUploadCoverageReport() {
	// If the repository slugs are different, the pull request comes from the community (forked repository).
	// For such builds, sending the CC report will be disabled.
	return ( process.env.TRAVIS_EVENT_TYPE !== 'pull_request' || process.env.TRAVIS_PULL_REQUEST_SLUG === process.env.TRAVIS_REPO_SLUG );
}
