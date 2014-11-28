/* jshint node: true */

'use strict';

var tools = require( './res/tools' );

module.exports = function( grunt ) {
	tools.setupMultitaskConfig( grunt, {
		task: 'jscs',
		defaultOptions: grunt.file.readJSON( 'dev/tasks/jscs-config.json' ),
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

	// Take ignore list from .gitIgnore.
	grunt.config.merge( {
		jscs: {
			options: {
				excludeFiles: tools.getGitIgnore( grunt )
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-jscs' );
};
