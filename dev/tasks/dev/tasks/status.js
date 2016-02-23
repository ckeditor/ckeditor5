/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const tools = require( '../utils/tools' );
const git = require( '../utils/git' );
const path = require( 'path' );
const log = require( '../utils/log' );

/**
 * 1. Get CKEditor5 dependencies from package.json file.
 * 2. Scan workspace for repositories that match dependencies from package.json file.
 * 3. Print GIT status using `git status --porcelain -sb` command.
 *
 * @param {String} ckeditor5Path Path to main CKEditor5 repository.
 * @param {Object} packageJSON Parsed package.json file from CKEditor5 repository.
 * @param {String} workspaceRoot Relative path to workspace root.
 */
module.exports = ( ckeditor5Path, packageJSON, workspaceRoot ) => {
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );

	// Get all CKEditor dependencies from package.json.
	const dependencies = tools.getCKEditorDependencies( packageJSON.dependencies );

	if ( dependencies ) {
		const directories = tools.getCKE5Directories( workspaceAbsolutePath );

		if ( directories.length ) {
			for ( let dependency in dependencies ) {
				const repositoryAbsolutePath = path.join( workspaceAbsolutePath, dependency );
				let status;

				// Check if repository's directory already exists.
				if ( directories.indexOf( dependency ) > -1 ) {
					try {
						status = git.getStatus( repositoryAbsolutePath );
						log.out( `\x1b[1m\x1b[36m${ dependency }\x1b[0m\n${ status.trim() }` );
					} catch ( error ) {
						log.err( error );
					}
				}
			}
		} else {
			log.out( 'No CKEditor5 plugins in development mode.' );
		}
	} else {
		log.out( 'No CKEditor5 dependencies found in package.json file.' );
	}
};
