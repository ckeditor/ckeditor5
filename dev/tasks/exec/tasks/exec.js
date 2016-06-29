/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const tools = require( '../utils/tools' );
const git = require( '../utils/git' );
const path = require( 'path' );
const log = require( '../utils/log' );
const merge = require( 'merge-stream' );

/**
 * @param {Function} execTask Task to use on each dependency.
 * @param {String} ckeditor5Path Path to main CKEditor5 repository.
 * @param {Object} packageJSON Parsed package.json file from CKEditor5 repository.
 * @param {String} workspaceRoot Relative path to workspace root.
 * @param {Boolean} dryRun
 */
module.exports = ( execTask, ckeditor5Path, packageJSON, workspaceRoot, dryRun ) => {
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );

	// Get all CKEditor dependencies from package.json.
	const dependencies = tools.getCKEditorDependencies( packageJSON.dependencies );
	const streams = merge();

	if ( dependencies ) {
		const directories = tools.getCKE5Directories( workspaceAbsolutePath );

		if ( dependencies ) {
			for ( let dependency in dependencies ) {
				const repositoryURL = dependencies[ dependency ];
				const urlInfo = git.parseRepositoryUrl( repositoryURL );
				const repositoryAbsolutePath = path.join( ckeditor5Path, 'node_modules', dependency );

				// Check if repository's directory already exists.
				if ( directories.indexOf( urlInfo.name ) > -1 ) {
					if ( dryRun ) {
						log.out( `Dry run in ${ urlInfo.name }...` );
					} else {
						try {
							log.out( `Executing task on ${ repositoryURL }...` );

							streams.add( execTask( repositoryAbsolutePath ) );
						} catch ( error ) {
							log.err( error );
						}
					}
				}
			}
		} else {
			log.out( 'No CKEditor5 plugins in development mode.' );
		}
	} else {
		log.out( 'No CKEditor5 dependencies found in package.json file.' );
	}

	return streams;
};
