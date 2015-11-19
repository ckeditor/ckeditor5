/* jshint node: true, esnext: true, varstmt: true */

'use strict';
const tools = require( './dev/tasks/utils/tools' );

module.exports = ( grunt ) => {
	// First register the "default" task, so it can be analyzed by other tasks.
	grunt.registerTask( 'default', [ 'jshint:git', 'jscs:git' ] );

	// Files that will be ignored by the "jscs" and "jshint" tasks.
	const ignoreFiles = [
		// Automatically loaded from .gitignore. Add more if necessary.
		'lib/**'
	];

	// Basic configuration which will be overloaded by the tasks.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		workspaceRoot: '..',

		jshint: {
			options: {
				ignores: ignoreFiles
			}
		},

		jscs: {
			options: {
				excludeFiles: ignoreFiles
			}
		},

		replace: {
			copyright: {
				src: [ '**/*.*', '**/*.frag' ].concat( tools.getGitIgnore( grunt ).map( i => '!' + i ) )  ,
				overwrite: true,
				replacements: [
					{
						from: /\@license Copyright \(c\) 2003-\d{4}, CKSource - Frederico Knabben\./,
						to: '@license Copyright (c) 2003-<%= grunt.template.today("yyyy") %>, CKSource - Frederico Knabben.'
					}
				]
			}
		}
	} );

	// Finally load the tasks.
	grunt.loadTasks( 'dev/tasks' );
	grunt.loadNpmTasks( 'grunt-text-replace' );
};
