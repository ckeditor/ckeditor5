'use strict';

module.exports = function( grunt ) {
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		jshint: {
			files: [ '*.js' ],
			options: {
				jshintrc: 'dev/tasks/jshint-config.json'
			}
		},

		jscs: {
			options: {
				'excludeFiles': [
					'node_modules/**',
					'build/**'
				]
			}
		},

		githooks: {
			all: {
				'pre-commit': 'default'
			}
		}
	} );

	grunt.loadTasks( 'dev/tasks' );

	// Default tasks.
	grunt.registerTask( 'default', [ 'jshint', 'jscs' ] );
};
