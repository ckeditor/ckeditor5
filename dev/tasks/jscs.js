/* jshint node: true */

'use strict';

var tools = require( './res/tools' );

module.exports = function( grunt ) {
	// Point to the default configurations.
	var config = {
		options: grunt.file.readJSON( 'dev/tasks/jscs-config.json' )
	};

	// Create the appropriate task target.
	if ( tools.checkTaskInQueue( grunt, 'jscs:git' ) ) {
		config.git = tools.getGitDirtyFiles().filter( function( file ) {
			return ( /\.js$/ ).test( file );
		} );
	} else {
		config.all = [ '**/*.js' ];
	}

	// Merge over configurations set in gruntfile.js.
	grunt.config.merge( {
		jscs: config
	} );

	grunt.loadNpmTasks( 'grunt-jscs' );
};
