/* global module */

'use strict';

module.exports = function( grunt ) {
	// First register the "default" task, so it can be analized by other tasks.
	grunt.registerTask( 'default', [ 'jshint:git', 'jscs' ] );

	// Basic configuration, which will be overloaded by the tasks.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		jshint: {
			options: {
				'ignores': lintIgnores
			}
		},

		jscs: {
			options: {
				'excludeFiles': lintIgnores
			}
		}
	} );

	// Finally load the tasks.
	grunt.loadTasks( 'dev/tasks' );
};

// The list of files we want to exclude from linting tasks, like jshint and jscs.
var lintIgnores = [
	'node_modules/**',
	'build/**'
];
