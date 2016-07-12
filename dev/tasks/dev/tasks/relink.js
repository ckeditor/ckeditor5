/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const ckeditor5Dirs = require( '../../../utils/ckeditor5-dirs' );
const tools = require( '../../../utils/tools' );
const path = require( 'path' );
const log = require( '../../../utils/log' );

/**
 * 1. Get CKEditor5 dependencies from package.json file.
 * 2. Scan workspace for repositories that match dependencies from package.json file.
 * 3. Link repositories to node_modules in CKEditor5 repository.
 *
 * @param {String} ckeditor5Path Path to main CKEditor5 repository.
 * @param {Object} packageJSON Parsed package.json file from CKEditor5 repository.
 * @param {String} workspaceRoot Relative path to workspace root.
 */
module.exports = ( ckeditor5Path, packageJSON, workspaceRoot ) => {
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );

	// Get all CKEditor dependencies from package.json.
	const dependencies = ckeditor5Dirs.getDependencies( packageJSON.dependencies );

	if ( dependencies ) {
		const directories = ckeditor5Dirs.getDirectories( workspaceAbsolutePath );

		if ( directories.length ) {
			for ( let dependency in dependencies ) {
				const repositoryAbsolutePath = path.join( workspaceAbsolutePath, dependency );
				const repositoryURL = dependencies[ dependency ];

				// Check if repository's directory exists.
				if ( directories.indexOf( dependency ) > -1 ) {
					try {
						log.out( `Linking ${ repositoryURL }...` );
						tools.linkDirectories( repositoryAbsolutePath, path.join( ckeditor5Path, 'node_modules', dependency ) );
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
