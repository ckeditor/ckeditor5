/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const Builder = require( './build/builder' );

module.exports = function( grunt ) {
	grunt.registerTask( 'build', 'Build a release out of the current development code.', function() {
		const done = this.async();
		const builder = new Builder();

		builder.build( done );
	} );
};
