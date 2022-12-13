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
const TravisFolder = require( './travis-folder' );
const { red, yellow, magenta } = require( './ansi-colors' );

const failedChecks = {
	dependency: new Set(),
	unitTests: new Set(),
	codeCoverage: new Set()
};

const travisFolder = new TravisFolder();

// Name of packages we do not want to check on CI.
// They might lack tests. To avoid invalid builds, let's skip these packages.
const EXCLUDED_PACKAGES = [ 'ckeditor5-minimap' ];

/**
 * This script should be used on Travis CI. It executes tests and prepares the code coverage report
 * for each package found in the `packages/` directory. Then, all reports are merged into a single
 * file that will be sent to Coveralls.
 */
module.exports = function checkPackagesCodeCoverage() {
	childProcess.execSync( 'rm -r -f .nyc_output', { stdio: 'inherit' } );
	childProcess.execSync( 'mkdir .nyc_output', { stdio: 'inherit' } );
	childProcess.execSync( 'rm -r -f .out', { stdio: 'inherit' } );
	childProcess.execSync( 'mkdir .out', { stdio: 'inherit' } );

	const frameworkPackages = fs.readdirSync( path.join( __dirname, '..', '..', 'src' ) )
		.map( filename => 'ckeditor5-' + filename.replace( /\.(js|ts)$/, '' ) );

	const featurePackages = childProcess.execSync( 'ls -1 packages', { encoding: 'utf8', stdio: [ null, 'pipe', 'inherit' ] } )
		.toString()
		.trim()
		.split( '\n' )
		.filter( fullPackageName => ![ ...EXCLUDED_PACKAGES, ...frameworkPackages ].includes( fullPackageName ) );

	console.log( magenta( '\nVerifying CKEditor 5 Framework\n' ) );
	[ 'ckeditor5', ...frameworkPackages ].forEach( fullPackageName => checkPackage( fullPackageName ) );

	travisFolder.start( 'typescript-compilation', magenta( 'Compiling CKEditor 5 Framework TypeScript packages' ) );

	for ( const fullPackageName of frameworkPackages ) {
		console.log( yellow( `\nCompiling ${ fullPackageName }` ) );

		const cwd = path.join( 'packages', fullPackageName );
		const pkgJsonPath = path.join( cwd, 'package.json' );

		const pkgJson = JSON.parse( fs.readFileSync( pkgJsonPath, 'utf-8' ) );
		const hasBuildScript = pkgJson.scripts && pkgJson.scripts.build;

		if ( !hasBuildScript ) {
			console.log( 'No build script found, skipping.' );

			continue;
		}

		const command = 'yarn run build --sourceMap';

		console.log( '* ' + command );
		childProcess.execSync( command, { cwd, stdio: 'inherit' } );

		console.log( '* Updating the "main" field in `package.json`.' );
		pkgJson.main = pkgJson.main.replace( /(?<=\.)ts$/, 'js' );
		fs.writeFileSync( pkgJsonPath, JSON.stringify( pkgJson, null, 2 ) + '\n', 'utf-8' );
	}

	travisFolder.end( 'typescript-compilation' );

	console.log( magenta( '\nVerifying CKEditor 5 Features\n' ) );
	featurePackages.forEach( fullPackageName => checkPackage( fullPackageName, [ '--resolve-js-first', '--cache' ] ) );

	if ( shouldUploadCoverageReport() ) {
		console.log( 'Uploading combined code coverage report…' );
		childProcess.execSync( 'npx coveralls < .out/combined_lcov.info', { stdio: 'inherit' } );
		console.log( 'Done' );
	} else {
		console.log( 'Since the PR comes from the community, we do not upload code coverage report.' );
		console.log( 'Read more why: https://github.com/ckeditor/ckeditor5/issues/7745.' );
	}

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
 * @param {String} fullPackageName
 * @param {Array.<String>} testArgs additional arguments to pass into test script.
 */
function checkPackage( fullPackageName, testArgs = [] ) {
	const simplePackageName = fullPackageName.replace( /^ckeditor5?-/, '' );
	const foldLabelName = 'pkg-' + simplePackageName;

	travisFolder.start( foldLabelName, yellow( `Testing ${ fullPackageName }` ) );

	runSubprocess( {
		binaryName: 'npx',
		cliArguments: [ 'ckeditor5-dev-tests-check-dependencies', `packages/${ fullPackageName }` ],
		packageName: simplePackageName,
		checkName: 'dependency',
		failMessage: 'have a dependency problem'
	} );

	runSubprocess( {
		binaryName: 'yarn',
		cliArguments: [ 'run', 'test', '-f', simplePackageName, '--reporter=dots', '--production', '--coverage', ...testArgs ],
		packageName: simplePackageName,
		checkName: 'unitTests',
		failMessage: 'failed to pass unit tests'
	} );

	childProcess.execSync( 'cp coverage/*/coverage-final.json .nyc_output', { stdio: 'inherit' } );

	runSubprocess( {
		binaryName: 'npx',
		cliArguments: [ 'nyc', 'check-coverage', '--branches', '100', '--functions', '100', '--lines', '100', '--statements', '100' ],
		packageName: simplePackageName,
		checkName: 'codeCoverage',
		failMessage: 'doesn\'t have required code coverage'
	} );

	appendCoverageReport();

	travisFolder.end( foldLabelName );
}

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

/**
 * @param {String} checkKey
 * @param {String} errorMessage
 */
function showFailedCheck( checkKey, errorMessage ) {
	const failedPackages = failedChecks[ checkKey ];

	if ( failedPackages.size ) {
		console.log( `${ errorMessage }: ${ red( Array.from( failedPackages.values() ).join( ', ' ) ) }` );
	}
}

/**
 * Appends coverage data to the combined code coverage info file. It's used because all the results
 * need to be uploaded at once (#6742).
 */
function appendCoverageReport() {
	const matches = glob.sync( 'coverage/*/lcov.info' );

	matches.forEach( filePath => {
		const buffer = fs.readFileSync( filePath );
		const reportPath = [ '.out', 'combined_lcov.info' ].join( path.sep );

		fs.writeFileSync( reportPath, buffer, { flag: 'as' } );
	} );
}

/**
 * If the repository slugs are different, the pull request comes from the community (forked repository).
 * For such builds, sending the CC report will be disabled.
 *
 * @returns {Boolean}
 */
function shouldUploadCoverageReport() {
	return ( process.env.TRAVIS_EVENT_TYPE !== 'pull_request' || process.env.TRAVIS_PULL_REQUEST_SLUG === process.env.TRAVIS_REPO_SLUG );
}
