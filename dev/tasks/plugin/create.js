'use strict';
var inquiries = require( './inquiries' );
var common = require( './common' );
var path = require( 'path' );
var tools = require( '../utils/tools' );

module.exports = function( grunt, done ) {
	var data = {
		grunt: grunt,
		cwd: process.cwd(),
		pluginName: '',
		repositoryLocation: '',
		gitHubUrl: '',
		version: '0.0.1'
	};

	inquiries.getPluginName( data )
		.then( inquiries.getRepositoryLocation )
		.then( inquiries.getPluginVersion )
		.then( inquiries.getPluginGitHubUrl )
		.then( createRepository )
		.then( updatePluginPackageJSON )
		.then( common.updatePackageJson )
		.then( common.linkPlugin )
		.then( common.commitNewPlugin )
		.then( function() {
			done();
		} ).catch( function( e ) {
			done( e );
		} );
};

// Updates plugin package.json by adding name of the plugin and version.
function updatePluginPackageJSON( data ) {
	var packageJSONPath = path.join( data.repositoryLocation, 'package.json' );

	data.grunt.log.writeln( 'Updating plugin\'s package.json...' );

	return new Promise( function( resolve ) {
		common.updateJSONFile( packageJSONPath, function( json ) {
			json.name = data.pluginName;
			json.version = data.version;

			return json;
		} ).then( function() {
			resolve( data );
		} );
	} );
}

// Initializes git repository and merges ckeditor5 boilerplate into master branch.
function createRepository( data ) {
	data.grunt.log.writeln( 'Initializing plugin repository...' );

	return new Promise( function( resolve ) {
		var repositoryLocation = data.repositoryLocation;
		var initializeRepoCommands = [
			'git init ' + repositoryLocation,
			'cd ' + repositoryLocation,
			'git remote add boilerplate git@github.com:ckeditor/ckeditor-boilerplate.git',
			'git fetch boilerplate ckeditor5',
			'git merge boilerplate/ckeditor5'
		];

		tools.shExec( initializeRepoCommands.join( ' && ' ) );
		resolve( data );
	} );
}
