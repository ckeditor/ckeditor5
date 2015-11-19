/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const tools = require( './tools' );
const git = require( './git' );
const path = require( 'path' );

/**
 * 1. Get CKEditor5 dependencies from package.json file.
 * 2. Check if any of the repositories are already present in the workspace.
 * 		2.1. If repository is present in the workspace, check it out to desired branch if one is provided.
 * 		2.2. If repository is not present in the workspace, clone it and checkout to desired branch if one is provided.
 * 3. Pull changes from remote branch.
 * 4. Link each new repository to node_modules. (do not use npm link, use standard linking instead)
 * 5. Run `npm install` in each repository.
 * 6. Install Git hooks in each repository.
 *
 * @param {String} ckeditor5Path Path to main CKEditor5 repository.
 * @param {Object} packageJSON Parsed package.json file from CKEditor5 repository.
 * @param {String} workspaceRoot Relative path to workspace root.
 * @param {Function} writeln Function for log output.
 * @param {Function} writeError Function of error output
 */
module.exports = ( ckeditor5Path, packageJSON, workspaceRoot, writeln, writeError ) => {
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );

	// Get all CKEditor dependencies from package.json.
	const dependencies = tools.getCKEditorDependencies( packageJSON.dependencies );

	if ( dependencies ) {
		const directories = tools.getCKE5Directories( workspaceAbsolutePath );

		for ( let dependency in dependencies ) {
			const repositoryURL = dependencies[ dependency ];
			const urlInfo = git.parseRepositoryUrl( repositoryURL );
			const repositoryAbsolutePath = path.join( workspaceAbsolutePath, dependency );

			// Check if repository's directory already exists.
			try {
				if ( directories.indexOf( dependency ) === -1 ) {
					writeln( `Clonning ${ repositoryURL }...` );
					git.cloneRepository( urlInfo, workspaceAbsolutePath );
				}

				// Check out proper branch.
				writeln( `Checking out ${ repositoryURL } to ${ urlInfo.branch }...` );
				git.checkout( repositoryAbsolutePath, urlInfo.branch );

				writeln( `Pulling changes to ${ repositoryURL } ${ urlInfo.branch }...` );
				git.pull( repositoryAbsolutePath, urlInfo.branch );

				writeln( `Linking ${ repositoryURL }...` );
				tools.linkDirectories( repositoryAbsolutePath, path.join( ckeditor5Path, 'node_modules' , dependency ) );

				writeln( `Running npm install in ${ repositoryURL }.` );
				tools.npmInstall( repositoryAbsolutePath );

				writeln( `Installing Git hooks in ${ repositoryURL }.` );
				tools.installGitHooks( repositoryAbsolutePath );
			} catch ( error ) {
				writeError( error );
			}
		}
	} else {
		writeln( 'No CKEditor5 dependencies found in package.json file.' );
	}
};
