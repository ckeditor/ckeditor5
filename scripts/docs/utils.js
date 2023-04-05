/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const glob = require( 'glob' );
const fs = require( 'fs' );
const path = require( 'path' );

const ROOT_DIRECTORY = path.join( __dirname, '..', '..' );

module.exports = {
	getCkeditor5Plugins,
	writeFile,
	normalizePath,
	addTypeScriptLoader
};

/**
 * Returns array with plugin paths.
 *
 * @returns {Promise.<Array>}
 */
function getCkeditor5Plugins() {
	return getCkeditor5ModulePaths()
		.then( files => {
			let promise = Promise.resolve();
			const ckeditor5Modules = [];

			for ( const modulePath of files ) {
				promise = promise.then( () => {
					return checkWhetherIsCKEditor5Plugin( modulePath )
						.then( isCKEditor5Plugin => {
							if ( isCKEditor5Plugin ) {
								ckeditor5Modules.push( path.join( ROOT_DIRECTORY, modulePath ) );
							}
						} );
				} );
			}

			return promise.then( () => ckeditor5Modules );
		} );
}

/**
 * Resolves the promise with an array of paths to CKEditor 5 modules.
 *
 * @returns {Promise.<Array>}
 */
async function getCkeditor5ModulePaths() {
	const files = await globPromise( 'node_modules/@ckeditor/ckeditor5-!(dev-)/src/**/*.[jt]s', { cwd: ROOT_DIRECTORY } );
	const ossPackages = ( await globPromise( 'packages/*/', { cwd: ROOT_DIRECTORY } ) )
		.map( packagePath => {
			const shortPackageName = packagePath.replace( /^packages/, '' );

			return new RegExp( shortPackageName );
		} );

	return files.filter( modulePath => {
		return ossPackages.some( pkg => modulePath.match( pkg ) );
	} );
}

/**
 * @param {String} pattern
 * @param {Object} options
 * @returns {Promise.<Array.<String>>}
 */
function globPromise( pattern, options ) {
	return new Promise( ( resolve, reject ) => {
		glob( pattern, options, ( err, files ) => {
			if ( err ) {
				return reject( err );
			}

			return resolve( files );
		} );
	} );
}

/**
 * Resolves the promise with a boolean value that indicates whether the module under `modulePath` is the CKEditor 5 plugin.
 *
 * @param modulePath
 * @returns {Promise.<Boolean>}
 */
function checkWhetherIsCKEditor5Plugin( modulePath ) {
	return readFile( path.join( ROOT_DIRECTORY, modulePath ) )
		.then( content => {
			const pluginName = path.basename( modulePath.replace( /.[jt]s$/, '' ) );

			if ( content.match( new RegExp( `export default class ${ pluginName } extends Plugin`, 'i' ) ) ) {
				return Promise.resolve( true );
			}

			return Promise.resolve( false );
		} );
}

/**
 * Resolves the promise with the content of the file saved under the `filePath` location.
 *
 * @param {String} filePath The path to fhe file.
 * @returns {Promise.<String>}
 */
function readFile( filePath ) {
	return new Promise( ( resolve, reject ) => {
		fs.readFile( filePath, 'utf-8', ( err, content ) => {
			if ( err ) {
				return reject( err );
			}

			return resolve( content );
		} );
	} );
}

/**
 * Saves the `data` value to the file saved under the `filePath` location.
 *
 * @param {String} filePath The path to fhe file.
 * @param {String} data The content to save.
 * @returns {Promise.<String>}
 */
function writeFile( filePath, data ) {
	return new Promise( ( resolve, reject ) => {
		fs.writeFile( filePath, data, err => {
			if ( err ) {
				return reject( err );
			}

			return resolve();
		} );
	} );
}

/**
 * Changes backslashes to slashes.
 *
 * @returns {String}
 */
function normalizePath( modulePath ) {
	return modulePath.split( path.sep ).join( path.posix.sep );
}

/**
 * Adds the `ts-loader` with the proper configuration to the passed webpack configuration object
 * only when CKEditor 5 sources are in TypeScript.
 *
 * The snippet adapter is used in different environments
 *   * Production: processing JavaScript installed from npm.
 *   * Nightly: processing JavaScript created from compiling TypeScript from the `#master` branches. It simulates
 *   installing packages from `npm`.
 *   * Locally: processing TypeScript directly from the `#master` branches.
 *
 * Hence, the `ts-loader` must be included only when processing `*.ts` files.
 *
 * @param {Object} webpackConfig
 * @param {String} configFile
 * @returns {void}
 */
function addTypeScriptLoader( webpackConfig, configFile ) {
	const tsconfigPath = path.join( __dirname, '..', '..', configFile );
	const coreIndexFile = require.resolve( '@ckeditor/ckeditor5-core' );

	// Do not include the `ts-loader` when processing CKEditor 5 installed as the JavaScript code.
	if ( coreIndexFile.endsWith( '.ts' ) ) {
		webpackConfig.module.rules.push( {
			test: /\.ts$/,
			use: [
				{
					loader: 'ts-loader',
					options: {
						configFile: tsconfigPath
					}
				}
			]
		} );
	}
}
