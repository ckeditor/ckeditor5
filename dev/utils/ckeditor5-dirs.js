/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = require( 'path' );
const tools = require( './tools' );
const git = require( './git' );

const dependencyRegExp = /^ckeditor5-/;

module.exports = {
	/**
	 * Returns dependencies that starts with `ckeditor5-`, and have valid, short GitHub url. Returns `null` if no
	 * dependencies are found.
	 *
	 * @param {Object} dependencies Dependencies object loaded from `package.json` file.
	 * @returns {Object|null}
	 */
	getDependencies( dependencies ) {
		let result = null;

		if ( dependencies ) {
			Object.keys( dependencies ).forEach( ( key ) => {
				if ( dependencyRegExp.test( key ) ) {
					if ( result === null ) {
						result = {};
					}

					result[ key ] = dependencies[ key ];
				}
			} );
		}

		return result;
	},

	/**
	 * Returns all directories under specified path that match `ckeditor5-*` pattern.
	 *
	 * @param {String} path
	 * @returns {Array.<String>}
	 */
	getDirectories( path ) {
		return tools.getDirectories( path ).filter( dir => {
			return dependencyRegExp.test( dir );
		} );
	},

	/**
	 * Returns a list of symbolic links to directories with names starting with `ckeditor5-` prefix.
	 *
	 * @param {String} path Path to directory,
	 * @returns {Array} Array with directories names.
	 */
	getSymlinks( path ) {
		const fs = require( 'fs' );
		const pth = require( 'path' );

		return fs.readdirSync( path ).filter( item => {
			const fullPath = pth.join( path, item );

			return dependencyRegExp.test( item ) && tools.isSymlink( fullPath );
		} );
	},

	/**
	 * Returns an array with information about `ckeditor5-*` directories in development mode.
	 *
	 * @param {String} workspacePath Absolute path to workspace.
	 * @param {Object} packageJSON Contents of `ckeditor5` repo `package.json` file.
	 * @param {String} ckeditor5Path Absolute path to ckeditor5 root directory.
	 * @param {Boolean} includeRoot Include main `ckeditor5` package.
	 * @returns {Array.<Object>}
	 */
	getDevDirectories( workspacePath, packageJSON, ckeditor5Path, includeRoot ) {
		const directories = this.getDirectories( workspacePath );
		const dependencies = this.getDependencies( packageJSON.dependencies );

		if ( includeRoot ) {
			// Add root dependency and directory.
			dependencies.ckeditor5 = 'ckeditor/ckeditor5';
			directories.push( 'ckeditor5' );
		}

		let devDirectories = [];

		for ( let dependency in dependencies ) {
			const repositoryURL = dependencies[ dependency ];
			const urlInfo = git.parseRepositoryUrl( repositoryURL );
			const isRootDep = dependency == 'ckeditor5';
			const repositoryPath = isRootDep ? ckeditor5Path : path.join( ckeditor5Path, 'node_modules', dependency );

			// Check if repository's directory already exists.
			if ( directories.indexOf( urlInfo.name ) > -1 ) {
				devDirectories.push( {
					repositoryPath,
					repositoryURL
				} );
			}
		}

		return devDirectories;
	}
};
