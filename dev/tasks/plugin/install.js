'use strict';
var inquiries = require( './inquiries' );
var common = require( './common' );

/**
 * Executes plugin install grunt task.
 * @param grunt
 * @param done
 */
module.exports = function( grunt, done ) {
	var data = {
		grunt: grunt,
		cwd: process.cwd(),
		pluginName: '',
		repositoryLocation: '',
		gitHubUrl: ''
	};

	inquiries.getPluginName( data )
		.then( inquiries.getRepositoryLocation )
		.then( inquiries.getPluginGitHubUrl )
		.then( common.cloneRepository )
		.then( common.linkPlugin )
		.then( common.updatePackageJson )
		.then( function() {
			done();
		} )
		.catch( function( error ) {
			done( error );
		} );
};
