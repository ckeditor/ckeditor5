/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global define, requirejs, CKEDITOR */

'use strict';

define( 'ckeditor-dev', function() {
	return {
		getPluginPath: function( name ) {
			return this.basePath + 'node_modules/ckeditor-plugin-' + name + '/src/';
		}
	};
} );

// For the dev version, we override the "plugin" module.
requirejs.config( {
	paths: {
		// The RequireJS "plugin" plugin.
		'plugin': CKEDITOR.basePath + 'src/plugin',

		// Due to name conflict with the above, we have to save a reference to the core "plugin" module.
		// See src/plugin.js for more details.
		'plugin-core': CKEDITOR.basePath + 'node_modules/ckeditor5-core/src/plugin'
	}
} );
