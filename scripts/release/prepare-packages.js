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
const { Listr } = require( 'listr2' );
const updateVersionReferences = require( './update-version-references' );
const buildTsAndDllForCkeditor5Root = require( './buildtsanddllforckeditor5root' );

// TODO: Integrate with `minimist` to read CLI arguments.

const abortController = new AbortController();
const PACKAGES_DIRECTORY = 'packages';
const RELEASE_DIRECTORY = 'release';
const latestVersion = releaseTools.getLastFromChangelog();

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

const tasks = new Listr( [
	{
		title: 'Preparation phase.',
		task: ( _, task ) => {
			return task.newListr( [
				{
					title: 'Updating "version" value.',
					task: () => {
						return releaseTools.updateDependencies( {
							version: '^' + latestVersion,
							packagesDirectory: PACKAGES_DIRECTORY,
							shouldUpdateVersionCallback: require( './isckeditor5package' )
						} );
					}
				},
				{
					title: 'Updating dependencies.',
					task: () => {
						return releaseTools.updateVersions( {
							packagesDirectory: PACKAGES_DIRECTORY,
							version: latestVersion
						} );
					}
				},
				{
					title: 'Updating references.',
					task: async ctx => {
						ctx.updatedFiles = await updateVersionReferences( {
							version: latestVersion,
							releaseDate: new Date()
						} );
					}
				}
			] );
		}
	},
	{
		title: 'Compilation phase.',
		task: ( _, task ) => {
			return task.newListr( [
				{
					title: 'Prepare "ckeditor5" package files.',
					task: () => {
						return buildTsAndDllForCkeditor5Root();
					}
				},
				{
					title: 'Compile TypeScript in `ckeditor5-*` packages.',
					task: ( ctx, task ) => {
						return releaseTools.executeInParallel( {
							packagesDirectory: PACKAGES_DIRECTORY,
							signal: abortController.signal,
							listrTask: task,
							taskToExecute: require( './compiletypescriptcallback' )
						} );
					}
				},
				{
					title: '',
					task: () => {
						return releaseTools.prepareRepository( {
							outputDirectory: RELEASE_DIRECTORY,
							packagesDirectory: PACKAGES_DIRECTORY,
							rootPackageJson: getCKEditor5PackageJson()
						} );
					}
				},
				{
					title: 'Update entries in `package.json`.',
					task: ( ctx, task ) => {
						return releaseTools.executeInParallel( {
							packagesDirectory: RELEASE_DIRECTORY,
							signal: abortController.signal,
							listrTask: task,
							taskToExecute: require( './updatepackageentrypoint' )
						} );
					}
				},
				{
					title: 'Prepare DLL builds.',
					task: ( ctx, task ) => {
						return releaseTools.executeInParallel( {
							packagesDirectory: RELEASE_DIRECTORY,
							signal: abortController.signal,
							listrTask: task,
							taskToExecute: require( './preparedllbuildscallback' )
						} );
					}
				}
			] );
		}
	},
	{
		title: 'Clean up phase.',
		task: () => {
			return releaseTools.cleanUpPackages( {
				packagesDirectory: RELEASE_DIRECTORY
			} );
		}
	},
	{
		title: 'Commit & tag.',
		task: ctx => {
			return releaseTools.commitAndTag( {
				version: latestVersion,
				files: [
					'package.json',
					`${ PACKAGES_DIRECTORY }/*/package.json`,
					...ctx.updatedFiles
				]
			} );
		}
	}
] );

tasks.run()
	.catch( err => {
		console.error( err );
	} );

/**
 * @returns {Object}
 */
function getCKEditor5PackageJson() {
	const pkgJson = require( '../../package.json' );

	return {
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
	};
}

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
