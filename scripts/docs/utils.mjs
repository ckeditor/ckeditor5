/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import path from 'path';
import fs from 'fs/promises';
import { glob } from 'glob';
import { loaders } from '@ckeditor/ckeditor5-dev-utils';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';

/**
 * Returns array with plugin paths.
 *
 * @returns {Promise.<Array>}
 */
export function getCkeditor5Plugins() {
	return getCkeditor5ModulePaths()
		.then( files => {
			let promise = Promise.resolve();
			const ckeditor5Modules = [];

			for ( const modulePath of files ) {
				promise = promise.then( () => {
					return checkWhetherIsCKEditor5Plugin( modulePath )
						.then( isCKEditor5Plugin => {
							if ( isCKEditor5Plugin ) {
								ckeditor5Modules.push( path.join( CKEDITOR5_ROOT_PATH, modulePath ) );
							}
						} );
				} );
			}

			return promise.then( () => ckeditor5Modules );
		} );
}

/**
 * Changes backslashes to slashes.
 *
 * @returns {String}
 */
export function normalizePath( modulePath ) {
	return modulePath.split( path.sep ).join( path.posix.sep );
}

/**
 * Adds the TypeScript loader with the proper configuration to the passed webpack configuration object
 * only when CKEditor 5 sources are in TypeScript.
 *
 * The snippet adapter is used in different environments
 *   * Production: processing JavaScript installed from npm.
 *   * Nightly: processing JavaScript created from compiling TypeScript from the `#master` branches. It simulates
 *   installing packages from `npm`.
 *   * Locally: processing TypeScript directly from the `#master` branches.
 *
 * Hence, the TypeScript loader must be included only when processing `*.ts` files.
 *
 * @param {Object} webpackConfig
 * @param {String} configFile
 * @returns {void}
 */
export function addTypeScriptLoader( webpackConfig, configFile ) {
	const tsconfigPath = path.join( CKEDITOR5_ROOT_PATH, configFile );
	const coreIndexFile = import.meta.resolve( '@ckeditor/ckeditor5-core' );

	// Do not include it when processing CKEditor 5 installed as the JavaScript code.
	if ( coreIndexFile.endsWith( '.ts' ) ) {
		webpackConfig.module.rules.push( loaders.getTypeScriptLoader( {
			configFile: tsconfigPath
		} ) );
	}
}

/**
 * Resolves the promise with an array of paths to CKEditor 5 modules.
 *
 * @returns {Promise.<Array>}
 */
async function getCkeditor5ModulePaths() {
	const files = await glob( 'node_modules/@ckeditor/ckeditor5-!(dev-)/src/**/*.[jt]s', { cwd: CKEDITOR5_ROOT_PATH } );
	const ossPackages = ( await glob( 'packages/*/', { cwd: CKEDITOR5_ROOT_PATH } ) )
		.map( packagePath => {
			const shortPackageName = packagePath.replace( /^packages/, '' );

			// The trailing slash is needed to avoid partial matching, when an open source package name is included in a premium feature.
			return new RegExp( shortPackageName + '/' );
		} );

	return files.filter( modulePath => {
		return ossPackages.some( pkg => modulePath.match( pkg ) );
	} );
}

/**
 * Resolves the promise with a boolean value that indicates whether the module under `modulePath` is the CKEditor 5 plugin.
 *
 * @param modulePath
 * @returns {Promise.<Boolean>}
 */
function checkWhetherIsCKEditor5Plugin( modulePath ) {
	return fs.readFile( path.join( CKEDITOR5_ROOT_PATH, modulePath ), 'utf-8' )
		.then( content => {
			const pluginName = path.basename( modulePath.replace( /.[jt]s$/, '' ) );

			if ( content.match( new RegExp( `export default class ${ pluginName } extends Plugin`, 'i' ) ) ) {
				return Promise.resolve( true );
			}

			return Promise.resolve( false );
		} );
}

