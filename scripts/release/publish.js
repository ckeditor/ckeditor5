#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );

// This scripts publish changes.
//
// You can test the whole process using `dry-run` mode. It won't change anything in the project
// and any repository. Nothing will be pushed. Instead of `npm publish`, the `npm pack` command will be called.
//
// Note: This task based on versions published on NPM and GitHub. If something went wrong, you can call this script one more time.
//
// This task should be executed after: `npm run release:bump-version`.
//
// Use:
// npm run release:publish -- --dry-run

require( '@ckeditor/ckeditor5-dev-env' )
	.releaseSubRepositories( {
		cwd: process.cwd(),
		packages: 'packages',
		releaseBranch: 'release',
		customReleases: [
			'ckeditor5'
		],
		packageJsonForCustomReleases: {
			ckeditor5: {
				description: 'A set of ready-to-use rich text editors created with a powerful framework.' +
					' Made with real-time collaborative editing in mind.',
				dependencies: getCKEditor5Dependencies()
			}
		},
		customReleasesFiles: {
			ckeditor5: [
				// Do not add the entire `build/` directory as it contains files produced by internal scripts:
				// automated/manual tests, translations, documentation, content styles.
				// If you need to release anything from the directory, type a full path to the file/directory.
				'src/*.js',
				'build/ckeditor5-dll.js',
				'build/ckeditor5-dll.manifest.json',
				'build/translations/*.js'
			]
		},
		dryRun: process.argv.includes( '--dry-run' )
	} );

/**
 * Returns an array that contains name of packages that the `ckeditor5` package should define as its dependencies.
 *
 * @returns {Array.<String>}
 */
function getCKEditor5Dependencies() {
	const ckeditor5PackageJson = require( '../../package.json' );

	// Short name of packages specified as DLL.
	const dllPackages = fs.readdirSync( path.join( __dirname, '..', '..', 'src' ) )
		.map( directory => directory.replace( /\.js$/, '' ) );

	// Name of packages that are listed in `src/` as DLL packages.
	const ckeditor5Dependencies = Object.keys( ckeditor5PackageJson.dependencies )
		.filter( packageName => {
			const shortPackageName = packageName.replace( /@ckeditor\/ckeditor5?-/, '' );

			return dllPackages.includes( shortPackageName );
		} );

	// The proper object for inserting into the `package.json` file.
	const dependencyObject = {};

	for ( const item of ckeditor5Dependencies ) {
		dependencyObject[ item ] = ckeditor5PackageJson.dependencies[ item ];
	}

	return dependencyObject;
}
