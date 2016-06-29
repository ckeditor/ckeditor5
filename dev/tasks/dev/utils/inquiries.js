/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const inquirer = require( 'inquirer' );
const sanitize = require( './sanitize' );
const DEFAULT_PLUGIN_NAME_PREFIX = 'ckeditor5-';
const DEFAULT_PLUGIN_VERSION = '0.0.1';
const DEFAULT_GITHUB_PATH_PREFIX = 'ckeditor/';

module.exports = {
	getPackageName() {
		return new Promise( ( resolve ) => {
			inquirer.prompt( [ {
				name: 'packageName',
				message: 'Enter package name without ' + DEFAULT_PLUGIN_NAME_PREFIX + ' prefix:',
				validate: ( input ) => {
					const regexp = /^[\w-]+$/;

					return regexp.test( input ) ? true : 'Please provide a valid package name.';
				}
			} ], ( answers ) => {
				resolve( DEFAULT_PLUGIN_NAME_PREFIX + answers.packageName );
			} );
		} );
	},

	getApplicationName() {
		return new Promise( ( resolve ) => {
			inquirer.prompt( [ {
				name: 'applicationName',
				message: 'Enter application full name:'
			} ], ( answers ) => {
				resolve( answers.applicationName );
			} );
		} );
	},

	getPackageVersion( ) {
		return new Promise( ( resolve ) => {
			inquirer.prompt( [ {
				name: 'version',
				message: 'Enter package\'s initial version:',
				default: DEFAULT_PLUGIN_VERSION
			} ], ( answers ) => {
				resolve( answers.version );
			} );
		} );
	},

	getPackageGitHubPath( packageName ) {
		const defaultGitHubPath = DEFAULT_GITHUB_PATH_PREFIX + packageName;

		return new Promise( ( resolve ) => {
			inquirer.prompt( [ {
				name: 'gitHubPath',
				message: 'Enter package\'s GitHub path:',
				default: defaultGitHubPath
			} ], ( answers ) => {
				resolve( answers.gitHubPath );
			} );
		} );
	},

	getPackageDescription( ) {
		return new Promise( ( resolve ) => {
			inquirer.prompt( [ {
				name: 'description',
				message: 'Package description (one sentence, must end with period):'
			} ], ( answers ) => {
				resolve( sanitize.appendPeriodIfMissing( answers.description || '' ) );
			} );
		} );
	}
};
