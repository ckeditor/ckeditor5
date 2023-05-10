#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs' );
const upath = require( 'upath' );
const releaseTools = require( '@ckeditor/ckeditor5-dev-release-tools' );
const updateVersionReferences = require( './update-version-references' );
const buildTsAndDllForCkeditor5Root = require( './buildtsanddllforckeditor5root' );
const pkgJson = require( '../../package.json' );

const abortController = new AbortController();
const PACKAGES_DIRECTORY = 'packages';
const RELEASE_DIRECTORY = 'release';

process.on( 'SIGINT', () => {
	abortController.abort( 'SIGINT' );
} );

process.on( 'unhandledRejection', error => {
	console.error( error );

	process.exit( 1 );
} );

abortController.signal.addEventListener( 'abort', () => {
	process.exit( 1 );
}, { once: true } );

( async () => {
	const latestVersion = releaseTools.getLastFromChangelog();

	releaseTools.updateDependencies( {
		version: '^' + latestVersion,
		shouldUpdateVersionCallback: require( './isckeditor5package' )
	} );

	// releaseTools.updateVersions( {
	// 	packagesDirectory: PACKAGES_DIRECTORY,
	// 	version: latestVersion
	// } );

	updateVersionReferences( {
		version: latestVersion,
		releaseDate: new Date()
	} );

	buildTsAndDllForCkeditor5Root();

	await releaseTools.prepareRepository( {
		outputDirectory: RELEASE_DIRECTORY,
		packagesDirectory: PACKAGES_DIRECTORY,
		rootPackageJson: {
			name: pkgJson.name,
			version: pkgJson.version,
			keywords: pkgJson.keywords,
			description: 'A set of ready-to-use rich text editors created with a powerful framework.' +
				' Made with real-time collaborative editing in mind.',
			dependencies: getCKEditor5Dependencies( pkgJson.dependencies ),
			engines: pkgJson.engines,
			author: pkgJson.author,
			license: pkgJson.license,
			homepage: pkgJson.homepage,
			bugs: pkgJson.bugs,
			repository: pkgJson.repository,
			files: [
				// Do not add the entire `build/` directory as it contains files produced by internal scripts:
				// automated/manual tests, translations, documentation, content styles.
				// If you need to release anything from the directory, insert a relative path to the file/directory.
				'src/*.js',
				'src/*.d.ts',
				'build/ckeditor5-dll.js',
				'build/ckeditor5-dll.manifest.json',
				'build/translations/*.js',
				// npm default files.
				'CHANGELOG.md',
				'LICENSE.md',
				'README.md'
			]
		}
	} );

	await releaseTools.executeInParallel( {
		packagesDirectory: RELEASE_DIRECTORY,
		processDescription: 'Compiling TypeScript...',
		signal: abortController.signal,
		taskToExecute: require( './compiletypescriptcallback' )
	} );

	await releaseTools.executeInParallel( {
		packagesDirectory: RELEASE_DIRECTORY,
		processDescription: 'Preparing DLL builds...',
		signal: abortController.signal,
		taskToExecute: require( './preparedllbuildscallback' )
	} );

	releaseTools.push( {
		version: latestVersion,
		releaseBranch: 'TODO'
	} );

	releaseTools.createGithubRelease( {
		token: 'TODO',
		version: latestVersion,
		repositoryOwner: 'TODO',
		repositoryName: 'TODO',
		description: 'TODO',
		isPrerelease: 'TODO'
	} );
} )();

/**
 * Returns an array that contains name of packages that the `ckeditor5` package should define as its dependencies.
 *
 * @param {Object} dependencies Dependencies to filter out.
 * @returns {Array.<String>}
 */
function getCKEditor5Dependencies( dependencies ) {
	// Short name of packages specified as DLL.
	const dllPackages = fs.readdirSync( upath.join( __dirname, '..', '..', 'src' ) )
		.map( directory => directory.replace( /\.[tj]s$/, '' ) );

	// Name of packages that are listed in `src/` as DLL packages.
	const ckeditor5Dependencies = Object.keys( dependencies )
		.filter( packageName => {
			const shortPackageName = packageName.replace( /@ckeditor\/ckeditor5?-/, '' );

			return dllPackages.includes( shortPackageName );
		} );

	// The proper object for inserting into the `package.json` file.
	const dependencyObject = {};

	for ( const item of ckeditor5Dependencies ) {
		dependencyObject[ item ] = dependencies[ item ];
	}

	return dependencyObject;
}
