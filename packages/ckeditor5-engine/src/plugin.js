/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * The base class for CKEditor plugin classes.
 *
 * @class Plugin
 * @extends Model
 */

CKEDITOR.define( [ 'model' ], function( Model ) {
	var Plugin = Model.extend( {
		constructor: function Plugin( editor ) {
			// Call the base constructor.
			Model.apply( this );

			this.editor = editor;
		},

		init: function() {}
	} );

	return Plugin;
} );
