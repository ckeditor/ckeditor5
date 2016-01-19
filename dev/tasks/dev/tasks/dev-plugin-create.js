/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const inquiries = require( '../utils/inquiries' );
const git = require( '../utils/git' );
const tools = require( '../utils/tools' );
const path = require( 'path' );

/**
 * 1. Ask for new plugin name.
 * 2. Ask for initial version.
 * 3. Ask for GitHub URL.
 * 4. Initialize repository.
 * 5. Copy files to new repository.
 * 6. Update package.json file in new plugin's repository.
 * 7. Update package.json file in CKEditor5 repository.
 * 8. Create initial commit.
 * 9. Link new plugin.
 * 10. Call `npm install` in plugin repository.
 *
 * @param {String} ckeditor5Path Path to main CKEditor5 repository.
 * @param {String} workspaceRoot Relative path to workspace root.
 * @param {Function} writeln Function for log output.
 * @returns {Promise} Returns promise fulfilled after task is done.
 */
module.exports = ( ckeditor5Path, workspaceRoot, writeln ) => {
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );
	const fileStructure = {
		'./': [
			'.editorconfig',
			'.jshintrc',
			'.jscsrc',
			'.gitattributes',
			'./dev/tasks/dev/templates'
		],
		'tests/': [
			'tests/.jshintrc'
		],
		'dev/': [
			'dev/.jshintrc'
		],
		'dev/tasks/lint': [
			'dev/tasks/lint'
		]
	};

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

			writeln( `Copying files into ${ repositoryPath }...` );

			for ( let destination in fileStructure ) {
				tools.copy( fileStructure[ destination ], path.join( repositoryPath, destination ) );
			}

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

			writeln( `Creating initial commit...` );
			git.initialCommit( pluginName, repositoryPath );

			writeln( `Linking ${ pluginName } to node_modules...` );
			tools.linkDirectories( repositoryPath, path.join( ckeditor5Path, 'node_modules', pluginName ) );

			writeln( `Running npm install in ${ pluginName }.` );
			tools.npmInstall( repositoryPath );
		} );
};
