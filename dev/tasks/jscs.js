'use strict';

const tools = require( './gulp/dev/utils/tools' );

module.exports = ( grunt ) => {
	tools.setupMultitaskConfig( grunt, {
		task: 'jscs',
		defaultOptions: {
				config: true
			},
		addGitIgnore: 'excludeFiles',
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

	grunt.loadNpmTasks( 'grunt-jscs' );
};
