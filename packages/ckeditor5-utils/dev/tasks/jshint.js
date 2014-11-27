/* jshint node: true */

'use strict';

var tools = require( './res/tools' );

module.exports = function( grunt ) {
	// Point to the default configurations.
	var config = {
		options: defaultConfig
	};

	// Create the appropriate task target.
	if ( tools.checkTaskInQueue( grunt, 'jshint:git' ) ) {
		config.git = tools.getGitDirtyFiles();
	} else {
		config.all = [ '**/*.js' ];
	}

	// Merge over configurations set in gruntfile.js.
	grunt.config.merge( {
		jshint: config
	} );

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
};

var defaultConfig = {
	'globalstrict': true,
	'validthis': true
};
