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

CKEDITOR.define( [ 'mvc/model', 'editorconfig', 'plugincollection' ], function( Model, EditorConfig, PluginCollection ) {
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

			/**
			 * The plugins loaded and in use by this editor instance.
			 *
			 * @type {PluginCollection}
			 */
			this.plugins = new PluginCollection( this );
		},

		/**
		 * Initializes the editor instance object after its creation.
		 *
		 * The initialization consists on the following procedures:
		 *
		 *  * Load and initialize the configured plugins.
		 *  * TODO: Add other procedures here.
		 *
		 * This method should be rarely used as `CKEDITOR.create` calls it one should never use the `Editor` contrusctor
		 * directly.
		 *
		 * @returns {Promise} A promise which resolves once the initialization is completed.
		 */
		init: function() {
			var that = this;
			var config = this.config;

			// Create and cache a promise that resolves when all initialization procedures get resolved.
			this._initPromise = this._initPromise || Promise.all( [
				loadPlugins().then( initPlugins )
			] );

			return this._initPromise;

			function loadPlugins() {
				return that.plugins.load( config.plugins );
			}

			function initPlugins() {
				var rets = [];

				// Call init() on every plugin, saving the return value in the rets array.
				for ( var i = 0; i < that.plugins.length; i++ ) {
					rets.push( that.plugins.get( i ).init() );
				}

				// Returns a promise that resolves when all initialization values are resolved. If they are promises,
				// we will wait for them to resolve. If they are something else, they resolve immediately (as per
				// Promise.all specs).
				return Promise.all( rets );
			}
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
