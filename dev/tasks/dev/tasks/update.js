/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const tools = require( '../../../lib/tools' );
const git = require( '../../../lib/git' );
const path = require( 'path' );
const log = require( '../../../lib/log' );

/**
 * 1. Fetch all branches from each origin in main CKEditor 5 repository.
 * 2. Get CKEditor 5 dependencies from package.json in main CKEditor 5 repository.
 * 3. If dependency's repository is already cloned in workspace:
 *		3.1. Fetch all branches from each origin.
 *		3.2. Checkout to specified branch.
 *		3.3. Pull changes to that branch.
 *		3.4. if --npm-update was specified run npm update --dev in that repository.
 *		3.5. Recreate symbolic link between repo and main node_modules.
 * 4. If dependency's repository is not cloned yet - run gulp install on this dependency.
 * 5. Remove symbolic links to dependencies that are not used in current package.json configuration.
 * 6. if --npm-update was specified run npm update --dev in main CKEditor 5 repository.
 *
 * @param {Function} installTask Install task to use on each dependency that is missing from workspace.
 * @param {String} ckeditor5Path Path to main CKEditor5 repository.
 * @param {Object} packageJSON Parsed package.json file from CKEditor5 repository.
 * @param {String} workspaceRoot Relative path to workspace root.
 * @param {Boolean} runNpmUpdate When set to true `npm update` will be executed inside each plugin repository
 * and inside CKEditor 5 repository.
 */
module.exports = ( installTask, ckeditor5Path, packageJSON, workspaceRoot, runNpmUpdate ) => {
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );

	// Fetch main repository
	log.out( `Fetching branches from ${ packageJSON.name }...` );
	git.fetchAll( ckeditor5Path );

	// Get all CKEditor dependencies from package.json.
	const dependencies = tools.getCKEditorDependencies( packageJSON.dependencies );

	if ( dependencies ) {
		const directories = tools.getCKE5Directories( workspaceAbsolutePath );

		for ( let dependency in dependencies ) {
			const repositoryURL = dependencies[ dependency ];
			const urlInfo = git.parseRepositoryUrl( repositoryURL );
			const repositoryAbsolutePath = path.join( workspaceAbsolutePath, dependency );

			// Check if repository's directory already exists.
			if ( directories.indexOf( urlInfo.name ) > -1 ) {
				log.out( `Fetching branches from ${ urlInfo.name }...` );
				git.fetchAll( repositoryAbsolutePath );

				log.out( `Checking out ${ urlInfo.name } to ${ urlInfo.branch }...` );
				git.checkout( repositoryAbsolutePath, urlInfo.branch );

				log.out( `Pulling changes to ${ urlInfo.name }...` );
				git.pull( repositoryAbsolutePath, urlInfo.branch );

				if ( runNpmUpdate ) {
					log.out( `Running "npm update" in ${ urlInfo.name }...` );
					tools.npmUpdate( repositoryAbsolutePath );
				}

				try {
					log.out( `Linking ${ repositoryURL }...` );
					tools.linkDirectories( repositoryAbsolutePath, path.join( ckeditor5Path, 'node_modules', dependency ) );
				} catch ( error ) {
					log.err( error );
				}
			} else {
				// Directory does not exits in workspace - install it.
				installTask( ckeditor5Path, workspaceRoot, repositoryURL );
			}
		}

		if ( runNpmUpdate ) {
			log.out( `Running "npm update" in CKEditor5 repository...` );
			tools.npmUpdate( ckeditor5Path );
		}
	} else {
		log.out( 'No CKEditor5 dependencies found in package.json file.' );
	}

	// Remove symlinks not used in this configuration.
	const nodeModulesPath = path.join( ckeditor5Path, 'node_modules' );
	const symlinks = tools.getCKE5Symlinks( nodeModulesPath );
	symlinks
		.filter( dir => typeof dependencies[ dir ] == 'undefined' )
		.forEach( dir => {
			log.out( `Removing symbolic link to ${ dir }.` );
			tools.removeSymlink( path.join( nodeModulesPath, dir ) );
		} );
};
