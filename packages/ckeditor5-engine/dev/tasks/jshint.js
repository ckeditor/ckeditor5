/* jshint node: true */

'use strict';

var tools = require( './utils/tools' );

module.exports = function( grunt ) {
	tools.setupMultitaskConfig( grunt, {
		task: 'jshint',
		defaultOptions: grunt.file.readJSON( 'dev/tasks/jshint-config.json' ),
		addGitIgnore: 'ignores',
		targets: {
			all: function() {
				return [ '**/*.js' ];
			},

			git: function() {
				return tools.getGitDirtyFiles().filter( function( file ) {
					return ( /\.js$/ ).test( file );
				} );
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
};
