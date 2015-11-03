'use strict';
var inquirer = require( 'inquirer' );
var path = require( 'path' );
var fs = require( 'fs' );
var DEFAULT_PLUGIN_NAME_PREFIX = 'ckeditor5-plugin-';
var DEFAULT_GITHUB_URL_PREFIX = 'ckeditor/';

module.exports = {
	getPluginName: function( data ) {
		return new Promise( function( resolve ) {
			inquirer.prompt( [ {
				name: 'pluginName',
				message: 'Enter plugin name without ' + DEFAULT_PLUGIN_NAME_PREFIX + ' prefix:',
				validate: function( input ) {
					var regexp = /^[a-zA-Z0-9-_]+$/;

					return regexp.test( input ) ? true : 'Please provide a valid plugin name.';
				},
				default: data.pluginName ? data.pluginName : null
			} ], function( answers ) {
				data.pluginName = DEFAULT_PLUGIN_NAME_PREFIX + answers.pluginName;
				resolve( data );
			} );
		} );
	},

	// Ask for initial version of the plugin.
	getPluginVersion: function( data ) {
		return new Promise( function( resolve ) {
			inquirer.prompt( [ {
				name: 'version',
				message: 'Enter plugin\'s initial version:',
				default: data.version ? data.version : ''
			} ], function( answers ) {
				data.version = answers.version;
				resolve( data );
			} );
		} );
	},

	// Ask for the location of the repository.
	getRepositoryLocation: function( data ) {
		var defaultLocation = path.join( data.cwd, '..', data.pluginName );

		return new Promise( function( resolve ) {
			inquirer.prompt( [ {
				name: 'path',
				message: 'Enter repository location:',
				default: defaultLocation,
				validate: function( input ) {
					var status;

					try {
						status = fs.statSync( input );
					} catch ( e ) {}

					return status && ( status.isFile() || status.isDirectory() ) ? 'Repository location already exists.' : true;
				}
			} ], function( answers ) {
				data.repositoryLocation = answers.path;
				resolve( data );
			} );
		} );
	},

	// Ask for GitHub Url.
	getPluginGitHubUrl: function( data ) {
		var defaultGitHubUrl = DEFAULT_GITHUB_URL_PREFIX + data.pluginName;

		return new Promise( function( resolve ) {
			inquirer.prompt( [ {
				name: 'gitHubUrl',
				message: 'Enter plugin\'s GitHub URL:',
				default: defaultGitHubUrl
			} ], function( answers ) {
				data.gitHubUrl = answers.gitHubUrl;
				resolve( data );
			} );
		} );
	}
};
