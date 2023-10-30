#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs-extra' );
const { glob } = require( 'glob' );
const upath = require( 'upath' );
const minimist = require( 'minimist' );
const { table, getBorderCharacters } = require( 'table' );
const { red, green, magenta } = require( 'chalk' );

main()
	.catch( err => {
		console.error( err );

		process.exit( 1 );
	} );

async function main() {
	const options = getOptions( process.argv.slice( 2 ) );
	const cwd = upath.resolve( options.cwd );

	console.log( magenta( 'Validating icon paths in plugins\' metadata...' ) );

	const globPattern = upath.join( cwd, 'packages', '*', 'ckeditor5-metadata.json' );
	const metadataFilePaths = await glob( globPattern );
	const plugins = ( await Promise.all( metadataFilePaths.map( getPluginsFromMetadataFile ) ) ).flat();
	const pluginIcons = plugins.reduce( getPluginIconPaths, {} );

	const missingIcons = [];

	for ( const packageName in pluginIcons ) {
		for ( const iconSource of pluginIcons[ packageName ] ) {
			let missing = false;

			if ( iconSource.startsWith( '@ckeditor/' ) ) {
				try {
					require.resolve( iconSource );
				} catch ( err ) {
					missing = true;
				}
			} else {
				const iconPath = upath.join( cwd, 'packages', packageName, iconSource );
				missing = !( await fs.exists( iconPath ) );
			}

			if ( missing ) {
				missingIcons.push( [ `./packages/${ packageName }/ckeditor5-metadata.json`, iconSource ] );
			}
		}
	}

	if ( !missingIcons.length ) {
		console.log( green( 'Validation successful.\n' ) );

		return;
	}

	console.log( red( 'Detected invalid icon paths in following packages:' ) );
	console.log( red( table( missingIcons, { border: getBorderCharacters( 'ramac' ) } ) ) );
	process.exit( 1 );
}

/**
 * Gets plugins from metadata file at provided path.
 * Additionally, adds `packageName` of the plugin to returned data.
 */
async function getPluginsFromMetadataFile( path ) {
	const normalizedPath = upath.toUnix( path );
	const metadataFile = await fs.readJSON( normalizedPath );
	const packageName = normalizedPath.split( '/' ).at( -2 );

	return metadataFile.plugins.map( plugin => ( { packageName, ...plugin } ) );
}

/**
 * `Array.prototype.reduce()` callback that maps paths of icons to an object.
 */
function getPluginIconPaths( result, plugin ) {
	if ( !plugin.uiComponents ) {
		return result;
	}

	const iconPaths = plugin.uiComponents.map( uiComponent => uiComponent.iconPath ).filter( Boolean );

	if ( !iconPaths.length ) {
		return result;
	}

	if ( !result[ plugin.packageName ] ) {
		result[ plugin.packageName ] = [];
	}

	result[ plugin.packageName ].push( ...iconPaths );

	return result;
}

/**
 * @param {Array.<String>} argv
 * @returns {Object} options
 * @returns {String} options.cwd
 */
function getOptions( argv ) {
	return minimist( argv, {
		string: [
			'cwd'
		],
		default: {
			cwd: process.cwd()
		}
	} );
}
