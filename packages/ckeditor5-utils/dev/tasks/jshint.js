'use strict';

module.exports = function( grunt ) {
	grunt.config.merge( {
		jshint: {
			files: [ '**/*.js' ],
			options: defaultConfig
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
};

var defaultConfig = {
	'globalstrict': true
};
