'use strict';

module.exports = function( grunt ) {
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

	grunt.loadTasks( 'dev/tasks' );

	grunt.registerTask( 'default', [ 'jshint', 'jscs' ] );
};

var lintIgnores = [
	'node_modules/**',
	'build/**'
];
