/* global module */
/* global require */

'use strict';

var tools = require( './res/tools' );

module.exports = function( grunt ) {
	// Base task configuration, targeting "all" by default.
	var config = {
		all: [ '**/*.js' ],
		options: defaultConfig
	};

	// Get information about the task being executed.
	var isGitTask = ( grunt.cli.tasks.indexOf( 'jshint:git' ) > -1 ),
		isDefaultTask = ( grunt.cli.tasks.indexOf( 'default' ) > -1 ) || !grunt.cli.tasks.length,
		// Hacking grunt hard.
		isDefaultAndGit = isDefaultTask && ( grunt.task._tasks.default.info.indexOf( '"jshint:git"' ) > -1 );

	// Create the :git configuration on the fly, if necessary.
	if ( isGitTask || isDefaultAndGit ) {
		delete config.all;
		config.git = tools.getGitDirtyFiles();
	}

	// Merge with configurations set in gruntfile.js.
	grunt.config.merge( {
		jshint: config
	} );

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
};

var defaultConfig = {
	'globalstrict': true,
	'validthis': true
};
