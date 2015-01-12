/* jshint node: true */

'use strict';

module.exports = function( grunt ) {
	// First register the "default" task, so it can be analyzed by other tasks.
	grunt.registerTask( 'default', [ 'jshint:git', 'jscs:git' ] );

	// Files that will be ignored by the "jscs" and "jshint" tasks.
	var ignoreFiles = [
		// Automatically loaded from .gitignore. Add more if necessary.
	];

	// Basic configuration which will be overloaded by the tasks.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		jshint: {
			options: {
				globals: {
					'CKEDITOR': false
				},
				ignores: ignoreFiles
			}
		},

		jscs: {
			options: {
				excludeFiles: ignoreFiles
			}
		}
	} );

	// Finally load the tasks.
	grunt.loadTasks( 'dev/tasks' );
};
