'use strict';
var path = require( 'path' );
var tools = require( './utils/tools' );
var inquirer = require( 'inquirer' );
var fs = require( 'fs' );
var grunt;

module.exports = function( g ) {
	grunt = g;
	grunt.registerTask( 'plugin', function( target ) {
		var done = this.async();

		switch ( target ) {
			case 'create':
				createNewPlugin( done );
				break;
		}
	} );
};

// Logs message using grunt.log.writeln.
function log( message ) {
	grunt.log.writeln( message );
}

function createNewPlugin( done ) {
	var info = { };

	askForPluginName( info )
		.then( askForRepositoryLocation )
		.then( askForPluginVersion )
		.then( askForGitHubUrl )
		.then( createRepository )
		.then( updatePluginPackageJSON )
		.then( updatePackageJson )
		.then( linkNPM )
		.then( function() {
			done();
		} ).catch( function( e ) {
			done( e );
		} );
}

// Links new plugin directory using npm link.
function linkNPM( info ) {
	// Don't use sudo on windows when executing npm link.
	var isWin = process.platform == 'win32';
	log( 'Linking plugin using npm link...' );

	return new Promise( function( resolve ) {
		tools.shExec( ( !isWin ? 'sudo ' : '' ) + 'npm link ' + info.repositoryLocation );
		resolve( info );
	} );
}

// Updates project's package.json by adding GitHub URL to dependencies.
function updatePackageJson( info ) {
	return new Promise( function( resolve ) {
		changePackageJson( path.join( process.cwd(), 'package.json' ), function( json ) {
			json.dependencies[ info.pluginName ] = info.gitHubUrl;

			return json;
		} ).then( function() {
			resolve( info );
		} );
	} );
}

// Updates plugin package.json by adding name of the plugin and version.
function updatePluginPackageJSON( info ) {
	return new Promise( function( resolve ) {
		var packageJSONPath = path.join( info.repositoryLocation, 'package.json' );
		changePackageJson( packageJSONPath, function( json ) {
			json.name = info.pluginName;
			json.version = info.version;

			return json;
		} ).then( function() {
			resolve( info );
		} );
	} );
}

// Initializes git repository and merges ckeditor5 boilerplate into master branch.
function createRepository( info ) {
	log( 'Initializing plugin repository...' );

	return new Promise( function( resolve ) {
		var repositoryLocation = info.repositoryLocation;
		var initializeRepoCommands = [
			'git init ' + repositoryLocation,
			'cd ' + repositoryLocation,
			'git remote add boilerplate git@github.com:ckeditor/ckeditor-boilerplate.git',
			'git fetch boilerplate ckeditor5',
			'git merge boilerplate/ckeditor5'
		];

		tools.shExec( initializeRepoCommands.join( ' && ' ) );
		resolve( info );
	} );
}

// Ask for new plugin name.
function askForPluginName( info ) {
	return new Promise( function( resolve ) {
		inquirer.prompt( [ {
			name: 'pluginName',
			message: 'Enter plugin name (without -ckeditor5-plugin postfix):',
			validate: function( input ) {
				var regexp = /^[a-zA-Z0-9-_]+$/;

				return regexp.test( input ) ? true : 'Please provide a valid plugin name.';
			}
		} ], function( answers ) {
			info.pluginName = answers.pluginName + '-ckeditor5-plugin';
			resolve( info );
		} );
	} );
}

// Ask for the location of the repository.
function askForRepositoryLocation( info ) {
	var def = path.join( process.cwd(), '..', info.pluginName );

	return new Promise( function( resolve ) {
		inquirer.prompt( [ {
			name: 'path',
			message: 'Enter repository location:',
			default: def
		} ], function( answers ) {
			info.repositoryLocation = answers.path;
			resolve( info );
		} );
	} );
}

// Ask for initial version of the plugin.
function askForPluginVersion( info ) {
	return new Promise( function( resolve ) {
		inquirer.prompt( [ {
			name: 'version',
			message: 'Enter plugin\'s initial version:',
			default: '0.0.1'
		} ], function( answers ) {
			info.version = answers.version;
			resolve( info );
		} );
	} );
}

// Ask for GitHub Url.
function askForGitHubUrl( info ) {
	return new Promise( function( resolve ) {
		inquirer.prompt( [ {
			name: 'gitHubUrl',
			message: 'Enter plugin\'s GitHub URL:',
			default: 'ckeditor/' + info.pluginName
		} ], function( answers ) {
			info.gitHubUrl = answers.gitHubUrl;
			resolve( info );
		} );
	} );
}

// Changes given package.json.
function changePackageJson( path, changeFn ) {
	return new Promise( function( resolve ) {
		fs.readFile( path, 'utf-8', function( err, file ) {
			var json;

			if ( err ) {
				throw err;
			}

			// Update package.json file.
			json = JSON.parse( file );
			json = changeFn( json );
			fs.writeFile( path, JSON.stringify( json, null, 2 ), 'utf-8', function( err ) {
				if ( err ) {
					throw err;
				}

				resolve( );
			} );
		} );
	} );
}
