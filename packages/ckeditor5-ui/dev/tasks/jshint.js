/* jshint node: true */

'use strict';

var tools = require( './res/tools' );

module.exports = function( grunt ) {
	tools.setupMultitaskConfig( grunt, {
		task: 'jshint',
		defaultOptions: grunt.file.readJSON( 'dev/tasks/jshint-config.json' ),
		targets: {
			all: function() {
				return [ '**/*.js' ];
			},
			git: function() {
				return tools.getGitDirtyFiles();
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
};
