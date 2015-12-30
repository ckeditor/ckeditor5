/* jshint node: true, esnext: true, varstmt: true */

'use strict';

module.exports = ( grunt ) => {
	// First register the "default" task, so it can be analyzed by other tasks.
	grunt.registerTask( 'default', [ 'jshint:git', 'jscs:git' ] );

	// Files that will be ignored by the "jscs" and "jshint" tasks.
	const ignoreFiles = [
		'src/lib/**',
		// Automatically loaded from .gitignore. Add more if necessary.
	];

	// Basic configuration which will be overloaded by the tasks.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		lodash: {
			build: {
				dest: 'src/lib/lodash',
				options: {
					modifier: 'modern',
					modularize: true,
					exports: 'es',
					flags: [
						'development'
					],
					include: [
						'clone',
						'extend',
						'isPlainObject',
						'isObject',
						'isArray',
						'last',
						'isEqual'
					]
				}
			}
		},

		jshint: {
			options: {
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
