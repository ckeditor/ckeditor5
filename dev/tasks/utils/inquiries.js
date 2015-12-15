/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const inquirer = require( 'inquirer' );
const DEFAULT_PLUGIN_NAME_PREFIX = 'ckeditor5-';
const DEFAULT_PLUGIN_VERSION = '0.0.1';
const DEFAULT_GITHUB_URL_PREFIX = 'ckeditor/';

module.exports = {
	getPluginName() {
		return new Promise( ( resolve ) => {
			inquirer.prompt( [ {
				name: 'pluginName',
				message: 'Enter plugin name without ' + DEFAULT_PLUGIN_NAME_PREFIX + ' prefix:',
				validate: ( input ) => {
					const regexp = /^[\w-]+$/;

					return regexp.test( input ) ? true : 'Please provide a valid plugin name.';
				}
			} ], ( answers ) => {
				resolve( DEFAULT_PLUGIN_NAME_PREFIX + answers.pluginName );
			} );
		} );
	},

	getPluginVersion( ) {
		return new Promise( ( resolve ) => {
			inquirer.prompt( [ {
				name: 'version',
				message: 'Enter plugin\'s initial version:',
				default: DEFAULT_PLUGIN_VERSION
			} ], ( answers ) => {
				resolve( answers.version );
			} );
		} );
	},

	getPluginGitHubUrl( pluginName ) {
		const defaultGitHubUrl = DEFAULT_GITHUB_URL_PREFIX + pluginName;

		return new Promise( ( resolve ) => {
			inquirer.prompt( [ {
				name: 'gitHubUrl',
				message: 'Enter plugin\'s GitHub URL:',
				default: defaultGitHubUrl
			} ], ( answers ) => {
				resolve( answers.gitHubUrl );
			} );
		} );
	}
};
