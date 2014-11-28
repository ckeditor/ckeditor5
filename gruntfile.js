/* jshint node: true */

'use strict';

module.exports = function( grunt ) {
	// First register the "default" task, so it can be analized by other tasks.
	grunt.registerTask( 'default', [ 'jshint:git', 'jscs' ] );

	// Basic configuration, which will be overloaded by the tasks.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		jshint: {
			options: {
			}
		},

		jscs: {
			options: {
			}
		}
	} );

	// Finally load the tasks.
	grunt.loadTasks( 'dev/tasks' );
};
