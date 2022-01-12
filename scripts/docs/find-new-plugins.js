/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const cwd = process.cwd();

const path = require( 'path' );
const readline = require( 'readline' );
const chalk = require( 'chalk' );
const Table = require( 'cli-table' );
const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );
const { getCkeditor5Plugins, normalizePath } = require( './utils' );

const PLUGINS_COLLECTION_PATH = path.join( __dirname, 'plugins-collection.json' );

const pluginsCollection = require( PLUGINS_COLLECTION_PATH );

// An array of objects with plugins used to generate the current version of the content styles.
let foundModules;

logProcess( 'Gathering all CKEditor 5 plugins...' );

getCkeditor5Plugins()
	.then( ckeditor5Modules => {
		console.log( `Found ${ ckeditor5Modules.length } plugins.` );

		foundModules = ckeditor5Modules.map( modulePath => {
			const pluginName = capitalize( path.basename( modulePath, '.js' ) );

			return { modulePath, pluginName };
		} );

		logProcess( 'Looking for new plugins...' );

		const newPlugins = findNewPlugins( foundModules, pluginsCollection );

		if ( !newPlugins.length ) {
			console.log( 'Previous and current versions of the plugins collection were generated with the same set of plugins.' );
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

		logProcess( 'Saving and committing...' );

		tools.updateJSONFile( PLUGINS_COLLECTION_PATH, () => {
			const newPluginsObject = {};

			for ( const data of foundModules ) {
				const modulePath = normalizePath( data.modulePath.replace( cwd + path.sep, '' ) );
				newPluginsObject[ modulePath ] = data.pluginName;
			}

			return newPluginsObject;
		} );

		const pluginsCollectionRelativePath = PLUGINS_COLLECTION_PATH.replace( cwd + path.sep, '' );

		// Commit the documentation.
		exec( `git add ${ pluginsCollectionRelativePath }` );
		exec( 'git commit -m "Docs (ckeditor5): Updated the plugin list collection."' );

		console.log( 'Successfully updated the plugin list collection.' );

		logProcess( 'Done.' );

		return Promise.resolve();
	} )
	.catch( err => {
		console.log( err );
	} );

/**
 * Asks about committing changes.
 *
 * @return {Promise.<Boolean>}
 */
function shouldCommitChanges() {
	const rl = readline.createInterface( {
		input: process.stdin,
		output: process.stdout
	} );

	return new Promise( resolve => {
		rl.question( 'Do you want to commit the changes? (Y/n): ', answer => {
			rl.close();
			if ( answer.toLocaleLowerCase() !== 'y' ) {
				return resolve( false );
			}
			return resolve( true );
		} );

		// Default answer.
		rl.write( 'Y' );
	} );
}

/**
 * Returns an object that contains objects with new plugins.
 *
 * @param {Array.<Object>} currentPlugins
 * @param {Array.<Object>} previousPlugins
 * @returns {Array.<Object>}
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
