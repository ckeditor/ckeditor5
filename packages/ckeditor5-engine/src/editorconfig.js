/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Handles a configuration dictionary for an editor instance.
 *
 * The basic difference between {@link EditorConfig} and {@link Config} is that {@link EditorConfig#get} retrieves
 * configurations from {@link CKEDITOR#config} if they are not found.
 *
 * @class EditorConfig
 * @extends Config
 */

CKEDITOR.define( [ 'ckeditor', 'config' ], function( CKE, Config ) {
	var EditorConfig = Config.extend( {
		/**
		 * Creates an instance of the {@link EditorConfig} class.
		 *
		 * @param {Object} [configurations] The initial configurations to be set.
		 * @constructor
		 */
		constructor: function EditorConfig() {
			// Call super-constructor.
			Config.apply( this, arguments );
		},

		/**
		 * @inheritdoc Config#get
		 */
		get: function() {
			// Try to take it from this editor instance.
			var value = Config.prototype.get.apply( this, arguments );

			// If the configuration is not defined in the instance, try to take it from CKEDITOR.config.
			if ( typeof value == 'undefined' ) {
				// There is a circular dependency issue here: CKEDITOR -> Editor -> EditorConfig -> CKEDITOR.
				// Therefore we need to require() it again here. That's why the parameter was named CKE.
				//
				// Note additionally that we still keep 'ckeditor' in the dependency list for correctness, to ensure
				// that the module is loaded.

				CKE = CKE || CKEDITOR.require( 'ckeditor' );
				value = CKE.config.get.apply( CKE.config, arguments );
			}

			return value;
		}
	} );

	return EditorConfig;
} );
