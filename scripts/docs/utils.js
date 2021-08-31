/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const glob = require( 'glob' );
const fs = require( 'fs' );
const path = require( 'path' );

const ROOT_DIRECTORY = path.join( __dirname, '..', '..' );

module.exports = { getCkeditor5Plugins, writeFile, normalizePath };

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
function getCkeditor5ModulePaths() {
	return new Promise( ( resolve, reject ) => {
		glob( 'packages/*/src/**/*.js', { cwd: ROOT_DIRECTORY }, ( err, files ) => {
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
			const pluginName = path.basename( modulePath, '.js' );

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
