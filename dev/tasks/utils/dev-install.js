/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const git = require( './git' );
const tools = require( './tools' );
const path = require( 'path' );

/**
 * This tasks install specified module in development mode. It can be executed by typing:
 * 		grunt dev-install --plugin <git_hub_url|npm_name|path_on_disk>
 *
 *
 * It performs following steps:
 * 1. If GitHub URL is provided - clones the repository.
 * 2. If NPM module name is provided - gets GitHub URL from NPM and clones the repository.
 * 3. If path on disk is provided - it is used directly.
 * 4. Runs `npm install` in plugin repository.
 * 5. If plugin exists in `ckeditor5/node_modules/` - runs `npm uninstall plugin_name`.
 * 6. Links plugin directory into `ckeditor5/node_modules/`.
 * 7. Adds dependency to `ckeditor5/package.json`.
 * 8. Installs Git hooks.
 *
 * @param {String} ckeditor5Path Absolute path to `ckeditor5` repository.
 * @param {String} workspaceRoot Relative path to workspace root directory.
 * @param {String} name Name of the NPM module or GitHub URL.
 * @param {Function} writeln Function used to report progress to the console.
 */
module.exports = ( ckeditor5Path, workspaceRoot, name, writeln ) => {
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );
	let repositoryPath;
	let dependency;
	let urlInfo;

	// First check if name is local path to repository.
	repositoryPath = path.isAbsolute( name ) ? name : path.resolve( name );

	if ( tools.isDirectory( repositoryPath ) ) {
		const packageName = tools.readPackageName( repositoryPath );

		if ( packageName ) {
			writeln( `Plugin located at ${ repositoryPath }.` );
			urlInfo = {
				name: packageName
			};

			dependency = repositoryPath;
		}
	}

	// Check if name is repository URL.
	if ( !urlInfo ) {
		urlInfo = git.parseRepositoryUrl( name );
		dependency = name;
	}

	// Check if name is NPM package.
	if ( !urlInfo ) {
		writeln( `Not a GitHub URL. Trying to get GitHub URL from NPM package...` );
		const url = tools.getGitUrlFromNpm( name );

		if ( url ) {
			urlInfo = git.parseRepositoryUrl( url );
			dependency  = url;
		}
	}

	if ( urlInfo ) {
		repositoryPath = path.join( workspaceAbsolutePath, urlInfo.name );

		if ( tools.isDirectory( repositoryPath ) ) {
			writeln( `Directory ${ repositoryPath } already exists.` );
		} else {
			writeln( `Cloning ${ urlInfo.name } into ${ repositoryPath }...` );
			git.cloneRepository( urlInfo, workspaceAbsolutePath );
		}

		// Checkout to specified branch if one is provided.
		if ( urlInfo.branch ) {
			writeln( `Checking ${ urlInfo.name } to ${ urlInfo.branch }...` );
			git.checkout( repositoryPath, urlInfo.branch );
		}

		// Run `npm install` in new repository.
		writeln( `Running "npm install" in ${ urlInfo.name }...` );
		tools.npmInstall( repositoryPath );

		const linkPath = path.join( ckeditor5Path, 'node_modules', urlInfo.name );

		if ( tools.isDirectory( linkPath ) ) {
			writeln( `Uninstalling ${ urlInfo.name } from CKEditor5 node_modules...` );
			tools.npmUninstall( ckeditor5Path, urlInfo.name );
		}

		writeln( `Linking ${ linkPath } to ${ repositoryPath }...` );
		tools.linkDirectories( repositoryPath, linkPath );

		writeln( `Adding ${ urlInfo.name } dependency to CKEditor5 package.json...` );
		tools.updateJSONFile( path.join( ckeditor5Path, 'package.json' ), ( json ) => {
			json.dependencies = json.dependencies || {};
			json.dependencies[ urlInfo.name ] = dependency;

			return json;
		} );

		writeln( `Installing Git hooks in ${ urlInfo.name }...` );
		tools.installGitHooks( repositoryPath );
	} else {
		throw new Error( 'Please provide valid GitHub URL, NPM module name or path.' );
	}
};
