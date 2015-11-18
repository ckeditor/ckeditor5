/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const inquiries = require( './inquiries' );
const git = require( './git' );
const tools = require( './tools' );
const path = require( 'path' );

/**
 * 1. Ask for new plugin name.
 * 2. Ask for initial version.
 * 3. Ask for GitHub URL.
 * 4. Initialize repository
 * 		4.1. Initialize GIT repository.
 * 		4.2. Fetch and merge boilerplate project.
 * 5. Update package.json file in new plugin's repository.
 * 6. Update package.json file in CKEditor5 repository.
 * 7. Link new plugin.
 * 8. Call `npm install` in plugin repository.
 * 9. Install Git hooks in plugin repository.
 *
 * @param {String} ckeditor5Path Path to main CKEditor5 repository.
 * @param {Object} options grunt options.
 * @param {Function} writeln Function for log output.
 * @returns {Promise} Returns promise fulfilled after task is done.
 */
module.exports = ( ckeditor5Path, options, writeln ) => {
	const workspaceAbsolutePath = path.join( ckeditor5Path, options.workspaceRoot );
	let pluginName;
	let repositoryPath;
	let pluginVersion;
	let gitHubUrl;

	return inquiries.getPluginName()
		.then( result => {
			pluginName = result;
			repositoryPath = path.join( workspaceAbsolutePath, pluginName );

			return inquiries.getPluginVersion();
		} )
		.then( result => {
			pluginVersion = result;

			return inquiries.getPluginGitHubUrl( pluginName );
		} )
		.then( result => {
			gitHubUrl = result;

			writeln( `Initializing repository ${ repositoryPath }...` );
			git.initializeRepository( repositoryPath );

			writeln( `Updating package.json files...` );
			tools.updateJSONFile( path.join( repositoryPath, 'package.json' ), ( json ) => {
				json.name = pluginName;
				json.version = pluginVersion;

				return json;
			} );

			tools.updateJSONFile( path.join( ckeditor5Path, 'package.json' ), ( json ) => {
				if ( !json.dependencies ) {
					json.dependencies = {};
				}
				json.dependencies[ pluginName ] = gitHubUrl;

				return json;
			} );

			writeln( `Linking ${ pluginName } to node_modules...` );
			tools.linkDirectories( repositoryPath, path.join( ckeditor5Path, 'node_modules', pluginName ) );

			writeln( `Running npm install in ${ pluginName }.` );
			tools.npmInstall( repositoryPath );

			writeln( `Installing GIT hooks in ${ pluginName }.` );
			tools.installGitHooks( repositoryPath );
		} );
};
