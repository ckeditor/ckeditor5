'use strict';

var createPlugin = require( './plugin/create' );
var installPlugin = require( './plugin/install' );

module.exports = function( grunt ) {
	grunt.registerTask( 'plugin', function( target ) {
		var done = this.async();

		switch ( target ) {
			case 'create':
				createPlugin( grunt, done );
				break;

			case 'install':
				installPlugin( grunt, done );
				break;
		}
	} );
};
