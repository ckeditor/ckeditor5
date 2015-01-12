/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * This is the API entry point. The entire CKEditor code runs under this object.
 *
 * @class CKEDITOR
 * @singleton
 */

CKEDITOR.define( function() {
	var CKEDITOR = {
		/**
		 * Gets the full URL path for the specified plugin.
		 *
		 * Note that the plugin is not checked to exist. It is a pure path computation.
		 *
		 * @param {String} name The plugin name.
		 * @returns {String} The full URL path of the plugin.
		 */
		getPluginPath: function( name ) {
			return this.basePath + 'plugins/' + name + '/';
		}
	};

	return CKEDITOR;
} );
