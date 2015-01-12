/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global define */

'use strict';

// Plugin for RequireJS to properly load CKEditor plugins through the "plugin!name" scheme:
// "plugin!name" => "node_modules/ckeditor5-plugin-name/name"
define( 'plugin', function() {
	return {
		load: function( name, require, onload ) {
			var path = name.split( '/' );
			path.splice( 1, 0, 'src' );

			if ( path.length === 2 ) {
				path.push( path[ 0 ] );
			}

			path = '../../ckeditor5-plugin-' + path.join( '/' );

			require( [ path ], function( value ) {
				onload( value );
			} );
		}
	};
} );
