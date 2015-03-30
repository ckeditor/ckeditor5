/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global define */

'use strict';

// Plugin for RequireJS to properly load CKEditor plugins through the "plugin!name" scheme:
// "plugin!name" => "node_modules/ckeditor5-plugin-name/name"
//
// Due to name conflict with the "ckeditor5-core/plugin" module, a workaround was needed. In this case, we extend the
// core Plugin class with the necessary RequireJS plugin methods. This should have no harm on the use of the Plugin
// class.

define( 'plugin', [ 'plugin-core' ], function( CorePlugin ) {
	// Called when a "plugin!" module is to be loaded.
	// http://requirejs.org/docs/plugins.html#apiload
	CorePlugin.load = function( name, require, onload ) {
		var path = name.split( '/' );
		path.splice( 1, 0, 'src' );

		if ( path.length == 2 ) {
			path.push( path[ 0 ] );
		}

		path = '../../ckeditor5-plugin-' + path.join( '/' );

		require( [ path ], onload, onload.error );
	};

	return CorePlugin;
} );
