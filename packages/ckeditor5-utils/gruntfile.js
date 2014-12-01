/* jshint node: true */

'use strict';

module.exports = function( grunt ) {
	// First register the "default" task, so it can be analyzed by other tasks.
	grunt.registerTask( 'default', [ 'jshint:git', 'jscs:git' ] );

	// Basic configuration which will be overloaded by the tasks.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		jshint: {
			options: {
				ignores: [
					// Automatically loaded from .gitignore. Add more if necessary.
				]
			}
		},

		jscs: {
			options: {
				excludeFiles: [
					// Automatically loaded from .gitignore. Add more if necessary.
				]
			}
		}
	} );

	// Finally load the tasks.
	grunt.loadTasks( 'dev/tasks' );
};
