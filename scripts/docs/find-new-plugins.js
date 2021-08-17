/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const cwd = process.cwd();

const path = require( 'path' );
const fs = require( 'fs' );
const chalk = require( 'chalk' );
const glob = require( 'glob' );
const Table = require( 'cli-table' );
const readline = require( 'readline' );
const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );

const CONTENT_STYLES_DETAILS_PATH = path.join( __dirname, 'content-styles-details.json' );

const contentStylesDetails = require( CONTENT_STYLES_DETAILS_PATH );

// An array of objects with plugins used to generate the current version of the content styles.
let foundModules;

logProcess( 'Gathering all CKEditor 5 modules...' );

getCkeditor5ModulePaths()
	.then( files => {
		console.log( `Found ${ files.length } files.` );
		logProcess( 'Filtering CKEditor 5 plugins...' );

		let promise = Promise.resolve();
		const ckeditor5Modules = [];

		for ( const modulePath of files ) {
			promise = promise.then( () => {
				return checkWhetherIsCKEditor5Plugin( modulePath )
					.then( isModule => {
						if ( isModule ) {
							ckeditor5Modules.push( path.join( cwd, modulePath ) );
						}
					} );
			} );
		}

		return promise.then( () => ckeditor5Modules );
	} )
	.then( ckeditor5Modules => {
		console.log( `Found ${ ckeditor5Modules.length } plugins.` );

		foundModules = ckeditor5Modules.map( modulePath => {
			const pluginName = capitalize( path.basename( modulePath, '.js' ) );
			return { modulePath, pluginName };
		} );

		logProcess( 'Looking for new plugins...' );

		const newPlugins = findNewPlugins( foundModules, contentStylesDetails.plugins );

		if ( !newPlugins.length ) {
			console.log( 'Previous and current versions of the content styles details were generated with the same set of plugins.' );
			logProcess( 'Done.' );

			return Promise.resolve();
		}

		console.log( 'Found new plugins.' );
		displayNewPluginsTable( newPlugins );

		const rl = readline.createInterface( {
			input: process.stdin,
			output: process.stdout
		} );

		rl.question( 'Do you want to commit the changes? (Y/N): ', answer => {
			rl.close();
			if ( answer !== 'Y' ) {
				console.log( 'Changes will not be commited.' );
				return Promise.resolve();
			}

			tools.updateJSONFile( CONTENT_STYLES_DETAILS_PATH, json => {
				const newPluginsObject = {};

				for ( const data of foundModules ) {
					const modulePath = normalizePath( data.modulePath.replace( cwd + path.sep, '' ) );
					newPluginsObject[ modulePath ] = data.pluginName;
				}

				json.plugins = newPluginsObject;

				return json;
			} );

			logProcess( 'Saving and committing...' );

			const contentStyleDetails = CONTENT_STYLES_DETAILS_PATH.replace( cwd + path.sep, '' );

			// Commit the documentation.
			if ( exec( `git diff --name-only ${ contentStyleDetails }` ).trim().length ) {
				exec( `git add ${ contentStyleDetails }` );
				exec( 'git commit -m "Docs (ckeditor5): Updated the content styles stylesheet."' );

				console.log( 'Successfully updated the content styles details.' );
			} else {
				console.log( 'Nothing to commit. The content styles details is up to date.' );
			}

			logProcess( 'Done.' );

			return Promise.resolve();
		} );
	} )
	.catch( err => {
		console.log( err );
	} );

/**
 * Resolves the promise with an array of paths to CKEditor 5 modules.
 *
 * @returns {Promise.<Array>}
 */
function getCkeditor5ModulePaths() {
	return new Promise( ( resolve, reject ) => {
		glob( 'packages/*/src/**/*.js', ( err, files ) => {
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
	return readFile( path.join( cwd, modulePath ) )
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
 * Returns an object that contains objects with new plugins.
 *
 * @param {Array.<Object>} currentPlugins
 * @param {Array.<Object>} previousPlugins
 * @returns {{Array.<Object>}}
 */
function findNewPlugins( currentPlugins, previousPlugins ) {
	const newPlugins = [];

	for ( const data of currentPlugins ) {
		// Use relative paths.
		const modulePath = normalizePath( data.modulePath.replace( cwd + path.sep, '' ) );

		if ( !previousPlugins[ modulePath ] ) {
			newPlugins.push( data );
		}
	}

	return newPlugins;
}

/**
 * Displays a table with new plugins.
 *
 * @param {Array.<Object>} newPlugins
 */
function displayNewPluginsTable( newPlugins ) {
	const table = new Table( {
		head: [ 'Plugin name', 'Module path' ],
		style: { compact: true }
	} );

	for ( const data of newPlugins ) {
		const modulePath = normalizePath( data.modulePath.replace( cwd + path.sep, '' ) );

		table.push( [ data.pluginName, modulePath ] );
	}

	console.log( table.toString() );
}

function normalizePath( modulePath ) {
	return modulePath.split( path.sep ).join( path.posix.sep );
}

function exec( command ) {
	return tools.shExec( command, { verbosity: 'error' } );
}

function logProcess( message ) {
	console.log( '\n📍 ' + chalk.cyan( message ) );
}

function capitalize( value ) {
	return value.charAt( 0 ).toUpperCase() + value.slice( 1 );
}

/**
 * @typedef {Object} StyleStructure
 * @property {String} file An absolute path to the file where a definition is defined.
 * @property {String} css Definition.
 */
