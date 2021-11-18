#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

const path = require( 'path' );
const chalk = require( 'chalk' );
const { createPotFiles, uploadPotFiles, downloadTranslations } = require( '@ckeditor/ckeditor5-dev-env' );
const getToken = require( '@ckeditor/ckeditor5-dev-env/lib/translations/gettoken' );

const ROOT_DIRECTORY_PATH = path.resolve( __dirname, '..' );
const TRANSLATION_DIRECTORY_PATH = path.join( ROOT_DIRECTORY_PATH, 'build', '.transifex' );
const TRANSIFEX_API_URL = 'https://www.transifex.com/api/2/project/ckeditor5';

const task = process.argv[ 2 ];

const tasks = {
	/**
	 * Collects translation messages (from  the`t()` calls and context files) and stores them in the `ckeditor5/build/.transifex` directory.
	 *
	 * By default, the script does not check the `external/` directory. Add the `--include-external-directory` flag to enable
	 * checking packages located in the `external/` directory.
	 */
	collect() {
		const includeExternalDirectory = process.argv.includes( '--include-external-directory' );

		return createPotFiles( {
			// An array containing absolute paths to CKEditor 5 source files.
			sourceFiles: getCKEditor5SourceFiles( { includeExternalDirectory } ),

			// Packages to process.
			packagePaths: getCKEditor5PackagePaths( { includeExternalDirectory } ),

			// A relative path to the `@ckeditor/ckeditor5-core` package where common translations are located.
			corePackagePath: 'packages/ckeditor5-core',

			// Where to save translation files.
			translationsDirectory: TRANSLATION_DIRECTORY_PATH
		} );
	},

	/**
	 * Uploads translation messages on the Transifex server.
	 *
	 * @returns {Promise}
	 */
	async upload() {
		return uploadPotFiles( {
			// Token used for authentication with the Transifex service.
			token: await getToken(),

			// End-point API URL to the Transifex service.
			url: TRANSIFEX_API_URL,

			// Where to look for the saved translation files.
			translationsDirectory: TRANSLATION_DIRECTORY_PATH
		} );
	},

	/**
	 * Download translations from the Transifex server.
	 *
	 * @returns {Promise}
	 */
	async download() {
		const packages = getCKEditor5PackageNames()
			.map( packageName => [ packageName, path.join( 'packages', packageName ) ] );

		return downloadTranslations( {
			// Token used for authentication with the Transifex service.
			token: await getToken(),

			// List of packages that will be processed.
			packages: new Map( packages ),

			// End-point API URL to the Transifex service.
			url: TRANSIFEX_API_URL,

			// An absolute path to the directory that will be used for finding specified `packages`.
			cwd: ROOT_DIRECTORY_PATH
		} );
	}
};

if ( !task || !tasks[ task ] ) {
	const taskNames = Object.keys( tasks );

	console.log( `Please provide valid task name. Available tasks: ${ taskNames.map( task => chalk.bold( task ) ).join( ', ' ) }.` );

	process.exit( 1 );
}

Promise.resolve()
	.then( () => tasks[ task ]() )
	.catch( err => {
		console.error( err );

		process.exit( 1 );
	} );

/**
 * Returns absolute paths to CKEditor 5 sources. Files located in the `src/lib/` directory are excluded.
 *
 * @param {Object} options
 * @param {Boolean} options.includeExternalDirectory If set to `true`, files from the `external/` directory will be returned too.
 * @returns {Array.<String>}
 */
function getCKEditor5SourceFiles( { includeExternalDirectory } ) {
	const glob = require( 'glob' );

	const patterns = [
		path.posix.join( ROOT_DIRECTORY_PATH, 'packages', '*', 'src', '**', '*.js' )
	];

	if ( includeExternalDirectory ) {
		patterns.push(
			path.posix.join( ROOT_DIRECTORY_PATH, 'external', '*', 'packages', '*', 'src', '**', '*.js' )
		);
	}

	const sourceFiles = [];

	for ( const item of patterns ) {
		sourceFiles.push(
			...glob.sync( item ).filter( srcPath => !srcPath.match( /packages\/[^/]+\/src\/lib\// ) )
		);
	}

	return sourceFiles;
}

/**
 * Returns relative paths to CKEditor 5 packages. By default the function does not check the `external/` directory.
 *
 * @param {Object} options
 * @param {Boolean} options.includeExternalDirectory If set to `true`, the packages from the `external/` directory will be returned, too.
 * @returns {Array.<String>}
 */
function getCKEditor5PackagePaths( { includeExternalDirectory } ) {
	const glob = require( 'glob' );

	const patterns = [
		path.posix.join( 'packages', '* ' )
	];

	if ( includeExternalDirectory ) {
		patterns.push(
			path.posix.join( 'external', '*', 'packages', '*' )
		);
	}

	const packagePaths = [];

	for ( const item of patterns ) {
		packagePaths.push( ...glob.sync( item ) );
	}

	return packagePaths;
}

/**
 * Returns name of CKEditor 5 packages located in the `packages/*` directory.
 *
 * @return {Array.<String>}
 */
function getCKEditor5PackageNames() {
	const fs = require( 'fs' );
	const ckeditor5PackagesDir = path.join( ROOT_DIRECTORY_PATH, 'packages' );

	return fs.readdirSync( ckeditor5PackagesDir ).filter( item => item.startsWith( 'ckeditor5-' ) );
}
