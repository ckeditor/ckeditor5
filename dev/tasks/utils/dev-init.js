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
 * 3. Link each new repository to node_modules. (do not use npm link, use standard linking instead)
 * 4. Run `npm install` in each repository.
 * 5. Install Git hooks in each repository.
 *
 * @param {String} ckeditor5Path Path to main CKEditor5 repository.
 * @param {Object} packageJSON Parsed package.json file from CKEditor5 repository.
 * @param {Object} options grunt options.
 * @param {Function} writeln Function for log output.
 * @param {Function} writeError Function of error output
 */
module.exports = ( ckeditor5Path, packageJSON, options, writeln, writeError ) => {
	const workspaceAbsolutePath = path.join( ckeditor5Path, options.workspaceRoot );

	// Get all CKEditor dependencies from package.json.
	const dependencies = tools.getCKEditorDependencies( packageJSON.dependencies );

	if ( dependencies ) {
		const directories = tools.getCKE5Directories( workspaceAbsolutePath );

		for ( let dependency in dependencies ) {
			const repositoryURL = dependencies[ dependency ];
			const urlInfo = git.parseRepositoryUrl( repositoryURL );
			const repositoryAbsolutePath = path.join( workspaceAbsolutePath, dependency );

			// Check if repository's directory already exists.
			if ( directories.indexOf( dependency ) === -1 ) {
				try {
					writeln( `Clonning ${ repositoryURL }...` );
					git.cloneRepository( urlInfo, workspaceAbsolutePath );
				} catch ( error ) {
					writeError( error );
				}
			}

			// Check out proper branch.
			try {
				writeln( `Checking out ${ repositoryURL } to ${ urlInfo.branch }...` );
				git.checkout( repositoryAbsolutePath, urlInfo.branch );

				writeln( `Linking ${ repositoryURL }...` );
				tools.linkDirectories( repositoryAbsolutePath, path.join( ckeditor5Path, 'node_modules' , dependency ) );

				writeln( `Running npm install in ${ repositoryURL }.` );
				tools.npmInstall( repositoryAbsolutePath );

				writeln( `Installing GIT hooks in ${ repositoryURL }.` );
				tools.installGitHooks( repositoryAbsolutePath );
			} catch ( error ) {
				writeError( error );
			}
		}
	} else {
		writeln( 'No CKEditor5 dependencies found in package.json file.' );
	}
};
