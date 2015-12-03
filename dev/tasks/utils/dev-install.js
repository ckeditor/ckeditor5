/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const git = require( './git' );
const tools = require( './tools' );
const path = require( 'path' );

/**
 * This tasks install specified module in development mode. It can be executed by typing:
 * 		grunt dev-install --plugin <npm_name|git_hub_url>
 *
 * It performs follwing steps:
 * 1. Get GitHub URL from NPM if module name is provided.
 * 2. Checks if repository is cloned already. If not - clones it.
 * 3. Checks out plugin repository to provided branch (`master` if no branch is specified).
 * 4. Links plugin directory into `ckeditor5/node_modules/`.
 * 5. Adds dependency with local path to `ckeditor5/package.json`.
 * 6. Runs `npm install` in `ckeditor5/`.
 *
 * @param {String} ckeditor5Path Absolute path to `ckeditor5` repository.
 * @param {String} workspaceRoot Relative path to workspace root directory.
 * @param {String} name Name of the NPM module or GitHub URL.
 * @param {Function} writeln Function used to report progress to the console.
 */
module.exports = ( ckeditor5Path, workspaceRoot, name, writeln ) => {
	let urlInfo = git.parseRepositoryUrl( name );
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );
	let repositoryPath;

	if ( !urlInfo ) {
		writeln( `Not a GitHub URL. Trying to get GitHub URL from npm package...` );
		const url = tools.getGitUrlFromNpm( name );

		if ( url ) {
			urlInfo = git.parseRepositoryUrl( url );
		}
	}

	if ( urlInfo ) {
		repositoryPath = path.join( workspaceAbsolutePath, urlInfo.name );

		if ( tools.isDirectory( repositoryPath ) ) {
			writeln( `Directory ${ repositoryPath } already exists.` );
		} else {
			writeln( `Cloning ${ urlInfo.name } into ${ repositoryPath }... ` );
			git.cloneRepository( urlInfo, workspaceAbsolutePath );
		}

		writeln( `Checking ${ urlInfo.name } to ${ urlInfo.branch }...` );
		git.checkout( repositoryPath, urlInfo.branch );

		const linkPath = path.join( ckeditor5Path, 'node_modules', urlInfo.name );
		writeln( `Linking ${ linkPath } to ${ repositoryPath }...` );
		tools.linkDirectories( repositoryPath, linkPath );

		writeln( `Adding ${ urlInfo.name } dependency to CKEditor5 package.json... ` );
		tools.updateJSONFile( path.join( ckeditor5Path, 'package.json' ), ( json ) => {
			json.dependencies = json.dependencies || {};
			json.dependencies[ urlInfo.name ] = repositoryPath;

			return json;
		} );

		writeln( 'Running "npm install" in CKEditor5 repository...' );
		tools.npmInstall( ckeditor5Path );
	} else {
		throw new Error( 'Please provide valid GitHub URL or npm module name.' );
	}
};
