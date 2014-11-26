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
			src: '*.js',
			options: {
				config: 'dev/tasks/jscs-config.json'
			}
		},

		githooks: {
			all: {
				'pre-commit': 'default'
			}
		}
	} );

	// Load all grunt plugins.
	require( 'load-grunt-tasks' )( grunt );

	// Default tasks.
	grunt.registerTask( 'default', [ 'jshint', 'jscs' ] );
};
