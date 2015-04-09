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
		// We may have a path to plugin modules (e.g. test/somemodule). Here we break the path on slashes.
		var path = name.split( '/' );

		// Inject the /src/ part right after the plugin name (e.g test/src).
		path.splice( 1, 0, 'src' );

		// If we didn't have any subpart in the path, inject the plugin name at the end (e.g. test/src/test).
		if ( path.length == 2 ) {
			path.push( path[ 0 ] );
		}

		// Finally point to the right place, relatively to the `ckeditor5-core/src` directory (in node_modules).
		path = '../../ckeditor5-plugin-' + path.join( '/' );

		// Now require the module again, using the fully resolved path.
		require( [ path ], onload, onload.error );
	};

	return CorePlugin;
} );
