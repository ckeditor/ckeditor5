/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const cwd = process.cwd();

const path = require( 'path' );
const chalk = require( 'chalk' );
const Table = require( 'cli-table' );
const readline = require( 'readline' );
const { getCkeditor5Plugins, normalizePath } = require( './utils' );
const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );

const CONTENT_STYLES_DETAILS_PATH = path.join( __dirname, 'content-styles-details.json' );

const contentStylesDetails = require( CONTENT_STYLES_DETAILS_PATH );

// An array of objects with plugins used to generate the current version of the content styles.
let foundModules;

logProcess( 'Gathering all CKEditor 5 modules...' );

getCkeditor5Plugins()
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

		return shouldCommitChanges();
	} )
	.then( userAnswer => {
		if ( !userAnswer ) {
			console.log( 'Changes will not be committed.' );
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
		exec( `git add ${ contentStyleDetails }` );
		exec( 'git commit -m "Docs (ckeditor5): Updated the plugin list collection."' );

		console.log( 'Successfully updated the plugin list collection.' );

		logProcess( 'Done.' );

		return Promise.resolve();
	} )
	.catch( err => {
		console.log( err );
	} );

function shouldCommitChanges() {
	const rl = readline.createInterface( {
		input: process.stdin,
		output: process.stdout
	} );

	return new Promise( resolve => {
		rl.question( 'Do you want to commit the changes? (y/n): ', answer => {
			rl.close();
			if ( answer.toLocaleLowerCase() !== 'y' ) {
				//
				return resolve( false );
			}
			return resolve( true );
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

function exec( command ) {
	return tools.shExec( command, { verbosity: 'error' } );
}

function logProcess( message ) {
	console.log( '\n📍 ' + chalk.cyan( message ) );
}

function capitalize( value ) {
	return value.charAt( 0 ).toUpperCase() + value.slice( 1 );
}
