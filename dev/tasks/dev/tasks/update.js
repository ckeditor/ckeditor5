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
 * 3. Run GIT pull command on each repository found.
 *
 * @param {String} ckeditor5Path Path to main CKEditor5 repository.
 * @param {Object} packageJSON Parsed package.json file from CKEditor5 repository.
 * @param {String} workspaceRoot Relative path to workspace root.
 * @param {Boolean} runNpmUpdate When set to true `npm update` will be executed inside each plugin repository
 * and inside CKEditor 5 repository.
 */
module.exports = ( ckeditor5Path, packageJSON, workspaceRoot, runNpmUpdate ) => {
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );

	// Get all CKEditor dependencies from package.json.
	const dependencies = tools.getCKEditorDependencies( packageJSON.dependencies );

	if ( dependencies ) {
		const directories = tools.getCKE5Directories( workspaceAbsolutePath );

		if ( directories.length ) {
			for ( let dependency in dependencies ) {
				const repositoryURL = dependencies[ dependency ];
				const urlInfo = git.parseRepositoryUrl( repositoryURL );
				const repositoryAbsolutePath = path.join( workspaceAbsolutePath, dependency );

				// Check if repository's directory already exists.
				if ( directories.indexOf( urlInfo.name ) > -1 ) {
					log.out( `Checking out ${ urlInfo.name } to ${ urlInfo.branch }...` );
					git.checkout( repositoryAbsolutePath, urlInfo.branch );

					log.out( `Pulling changes to ${ urlInfo.name }...` );
					git.pull( repositoryAbsolutePath, urlInfo.branch );

					if ( runNpmUpdate ) {
						log.out( `Running "npm update" in ${ urlInfo.name }...` );
						tools.npmUpdate( repositoryAbsolutePath );
					}
				}
			}

			if ( runNpmUpdate ) {
				log.out( `Running "npm update" in CKEditor5 repository...` );
				tools.npmUpdate( ckeditor5Path );
			}
		} else {
			log.out( 'No CKEditor5 plugins in development mode.' );
		}
	} else {
		log.out( 'No CKEditor5 dependencies found in package.json file.' );
	}
};
