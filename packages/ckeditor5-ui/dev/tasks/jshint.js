'use strict';

const tools = require( './utils/tools' );

module.exports = ( grunt ) => {
	tools.setupMultitaskConfig( grunt, {
		task: 'jshint',
		defaultOptions: {
				jshintrc: true
			},
		addGitIgnore: 'ignores',
		targets: {
			all() {
				return [ '**/*.js' ];
			},

			git() {
				return tools.getGitDirtyFiles().filter( function( file ) {
					return ( /\.js$/ ).test( file );
				} );
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
};
