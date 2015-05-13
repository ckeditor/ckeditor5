/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint node: true */

'use strict';

var path = require( 'path' );
var files = [
	path.join( __dirname, '../static/extensions.js' )
];

module.exports = {
	name: 'bender-ckeditor5',

	attach: function() {
		var that = this;
		var bender = that;

		bender.plugins.addFiles( files );
		bender.plugins.addInclude( files );

		bender.on( 'test:created', function( test ) {
			var name = test.displayName;

			name = name.replace( /node_modules\/ckeditor5-core/, 'core: ' );
			name = name.replace( /node_modules\/ckeditor5-plugin-([^\/]+)/, 'plugin!$1: ' );

			test.displayName = name;
		} );
	}
};
