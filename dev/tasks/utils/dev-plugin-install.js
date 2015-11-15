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
 * 1. Ask for plugin name.
 * 2. Ask for GitHub URL.
 * 3. Clone repository from provided GitHub URL.
 * 4. Checkout repository to provided branch (or master if no branch is provided).
 * 5. Update package.json file in CKEditor5 repository.
 * 6. Link new plugin.
 *
 * @param {String} ckeditor5Path Path to main CKEditor5 repository.
 * @param {Object} options grunt options.
 * @param {Function} writeln Function for log output.
 * @param {Function} writeError Function of error output
 * @returns {Promise} Returns promise fulfilled after task is done.
 */
module.exports = ( ckeditor5Path, options, writeln, writeError ) => {
	return new Promise( ( resolve, reject ) => {
		const workspaceAbsolutePath = path.join( ckeditor5Path, options.workspaceRoot );
		let pluginName;
		let repositoryPath;
		let gitHubUrl;

		inquiries.getPluginName()
			.then( result => {
				pluginName = result;
				repositoryPath = path.join( workspaceAbsolutePath, pluginName );

				return inquiries.getPluginGitHubUrl( pluginName );
			} )
			.then( result => {
				gitHubUrl = result;
				let urlInfo = git.parseRepositoryUrl( gitHubUrl );

				try {
					writeln( `Clonning ${ gitHubUrl }...` );
					git.cloneRepository( urlInfo, workspaceAbsolutePath );

					writeln( `Checking out ${ gitHubUrl } to ${ urlInfo.branch }...` );
					git.checkout( repositoryPath, urlInfo.branch );

					writeln( `Updating package.json files...` );
					tools.updateJSONFile( path.join( ckeditor5Path, 'package.json' ), ( json ) => {
						if ( !json.dependencies ) {
							json.dependencies = {};
						}
						json.dependencies[ pluginName ] = gitHubUrl;

						return json;
					} );

					writeln( `Linking ${ pluginName } to node_modules...` );
					tools.linkDirectories( repositoryPath, path.join( ckeditor5Path, 'node_modules', pluginName ) );
				} catch ( error ) {
					writeError( error );
				}
			} )
			.catch( reject );
	} );
};
