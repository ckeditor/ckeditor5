/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint node: true */

'use strict';

var Builder = require( './build/builder' );

module.exports = function( grunt ) {
	grunt.registerTask( 'build', 'Build a release out of the current development code.', function() {
		var done = this.async();
		var builder = new Builder();
		builder.build( done );
	} );
};
