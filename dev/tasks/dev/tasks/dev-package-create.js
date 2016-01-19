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
 * 1. Ask for new package name.
 * 2. Ask for initial version.
 * 3. Ask for GitHub URL.
 * 4. Initialize repository.
 * 5. Copy files to new repository.
 * 6. Update package.json file in new package's repository.
 * 7. Update package.json file in CKEditor5 repository.
 * 8. Create initial commit.
 * 9. Link new package.
 * 10. Call `npm install` in package repository.
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

	let packageName;
	let repositoryPath;
	let packageVersion;
	let gitHubUrl;

	return inquiries.getPackageName()
		.then( result => {
			packageName = result;
			repositoryPath = path.join( workspaceAbsolutePath, packageName );

			return inquiries.getPackageVersion();
		} )
		.then( result => {
			packageVersion = result;

			return inquiries.getPackageGitHubUrl( packageName );
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
				json.name = packageName;
				json.version = packageVersion;

				return json;
			} );

			tools.updateJSONFile( path.join( ckeditor5Path, 'package.json' ), ( json ) => {
				if ( !json.dependencies ) {
					json.dependencies = {};
				}
				json.dependencies[ packageName ] = gitHubUrl;

				return json;
			} );

			writeln( `Creating initial commit...` );
			git.initialCommit( packageName, repositoryPath );

			writeln( `Linking ${ packageName } to node_modules...` );
			tools.linkDirectories( repositoryPath, path.join( ckeditor5Path, 'node_modules', packageName ) );

			writeln( `Running npm install in ${ packageName }.` );
			tools.npmInstall( repositoryPath );
		} );
};
