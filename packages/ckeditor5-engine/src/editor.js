/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Represents a single editor instance.
 *
 * @class Editor
 */

CKEDITOR.define( [ 'mvc/model', 'editorconfig' ], function( Model, EditorConfig ) {
	var Editor = Model.extend( {
		/**
		 * Creates a new instance of the Editor class.
		 *
		 * This constructor should be rarely used. When creating new editor instance use instead the
		 * {@link CKEDITOR#create CKEDITOR.create() method}.
		 *
		 * @param {HTMLElement} element The DOM element that will be the source for the created editor.
		 * @constructor
		 */
		constructor: function Editor( element, config ) {
			/**
			 * The original host page element upon which the editor is created. It is only supposed to be provided on
			 * editor creation and is not subject to be modified.
			 *
			 * @readonly
			 * @property {HTMLElement}
			 */
			this.element = element;

			/**
			 * Holds all configurations specific to this editor instance.
			 *
			 * This instance of the {@link Config} class is customized so its {@link Config#get} method will retrieve
			 * global configurations available in {@link CKEDITOR.config} if configurations are not found in the
			 * instance itself.
			 *
			 * @type {Config}
			 */
			this.config = new EditorConfig( config );
		},

		/**
		 * Destroys the editor instance, releasing all resources used by it. If the editor replaced an element, the
		 * element will be recovered.
		 *
		 * @fires destroy
		 */
		destroy: function() {
			this.fire( 'destroy' );

			delete this.element;
		}
	} );

	return Editor;
} );

/**
 * Fired when this editor instance is destroyed. The editor at this point is not usable and this event should be used to
 * perform the clean-up in any plugin.
 *
 * @event destroy
 */
