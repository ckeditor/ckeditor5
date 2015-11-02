'use strict';
var tools = require( '../utils/tools' );
var path = require( 'path' );
var fs = require( 'fs' );
var INITIAL_COMMIT_MESSAGE = 'Initial plugin commit.';

module.exports = {
	linkPlugin: function( data ) {
		// Don't use sudo on windows when executing npm link.
		var isWin = process.platform == 'win32';
		data.grunt.log.writeln( 'Linking plugin with npm link...' );

		return new Promise( function( resolve ) {
			var linkCommands = [
				'cd ' + data.repositoryLocation,
				( !isWin ? 'sudo ' : '' ) + 'npm link',
				'cd ' + data.cwd,
				'npm link ' + data.pluginName
			];

			tools.shExec( linkCommands.join( ' && ' ) );
			resolve( data );
		} );
	},

	cloneRepository: function( data ) {
		var repo = 'git@github.com:' + data.gitHubUrl;
		data.grunt.log.writeln( 'Cloning repository ' + repo + '...' );

		return new Promise( function( resolve ) {
			var cloneCommands = [
				'cd ' + path.join( data.repositoryLocation, '..' ),
				'git clone ' + repo
			];

			tools.shExec( cloneCommands.join( ' && ' ) );
			resolve( data );
		} );
	},

	/**
	 * Creates initial git commit for new plugin. New plugin is created by merging CKEditor5 boilerplate and modifying
	 * package.json. After that initial commit is needed.
	 * @param data
	 * @param {String} data.repositoryLocation New plugin location on disk.
	 */
	commitNewPlugin: function( data ) {
		return new Promise( function( resolve ) {
			var commitCommands = [
				'cd ' + data.repositoryLocation,
				'git add package.json',
				'git commit -m "' + INITIAL_COMMIT_MESSAGE + '"'
			];

			tools.shExec( commitCommands.join( ' && ' ) );
			resolve( data );
		} );
	},

	/**
	 * Updates CKEditor5 package.json file by adding new plugin dependency. Returns promise resolved when update is
	 * finished.
	 * @param {Object} data
	 * @param {String} data.cwd Grunt starting directory - full path to CKEditor5 git repository on disk.
	 * @param {String} data.pluginName New plugin name.
	 * @param {String} data.gitHubUrl New plugin GitHub url.
	 * @returns {Promise}
	 */
	updatePackageJson: function( data ) {
		data.grunt.log.writeln( 'Updating CKEditor5 package.json...' );

		return new Promise( function( resolve, reject ) {
			module.exports.updateJSONFile( path.join( data.cwd, 'package.json' ), function( json ) {
				if ( !json.dependencies ) {
					json.dependencies = {};
				}

				json.dependencies[ data.pluginName ] = data.gitHubUrl;

				return json;
			} ).then( function() {
				resolve( data );
			}, function( error ) {
				reject( error );
			} );
		} );
	},

	// Changes given package.json.
	updateJSONFile: function( path, changeFn ) {
		return new Promise( function( resolve, reject ) {
			fs.readFile( path, 'utf-8', function( err, file ) {
				var json;

				if ( err ) {
					return reject( err );
				}

				// Update package.json file.
				json = JSON.parse( file );
				json = changeFn( json );
				fs.writeFile( path, JSON.stringify( json, null, 2 ), 'utf-8', function( err ) {
					if ( err ) {
						return reject( err );
					}

					resolve( );
				} );
			} );
		} );
	}
};
