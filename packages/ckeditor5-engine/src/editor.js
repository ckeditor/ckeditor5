/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Represents a single editor instance.
 *
 * @class Editor
 * @extends Model
 */

CKEDITOR.define( [
	'model',
	'editorconfig',
	'plugincollection',
	'creator',
	'ckeditorerror'
], function( Model, EditorConfig, PluginCollection, Creator, CKEditorError ) {
	class Editor extends Model {
		/**
		 * Creates a new instance of the Editor class.
		 *
		 * This constructor should be rarely used. When creating new editor instance use instead the
		 * {@link CKEDITOR#create CKEDITOR.create() method}.
		 *
		 * @param {HTMLElement} element The DOM element that will be the source for the created editor.
		 * @constructor
		 */
		constructor( element, config ) {
			super();

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

			/**
			 * The chosen creator.
			 *
			 * @property {Creator} _creator
			 * @protected
			 */

			/**
			 * The list of detected creators.
			 *
			 * @protected
			 */
			this._creators = {};
		}

		/**
		 * Initializes the editor instance object after its creation.
		 *
		 * The initialization consists of the following procedures:
		 *
		 *  * Load and initialize the configured plugins.
		 *  * Fires the editor creator.
		 *
		 * This method should be rarely used as `CKEDITOR.create` calls it one should never use the `Editor` constructor
		 * directly.
		 *
		 * @returns {Promise} A promise which resolves once the initialization is completed.
		 */
		init() {
			var that = this;
			var config = this.config;

			return loadPlugins()
				.then( initPlugins )
				.then( findCreators )
				.then( fireCreator );

			function loadPlugins() {
				return that.plugins.load( config.plugins );
			}

			function initPlugins( loadedPlugins ) {
				// Start with a resolved promise.
				var promise = Promise.resolve();

				// Chain it with promises that resolve with the init() call of every plugin.
				for ( let i = 0; i < loadedPlugins.length; i++ ) {
					promise = promise.then( () => loadedPlugins[ i ].init() );
				}

				// Return the promise chain.
				return promise;
			}

			function findCreators() {
				for ( let plugin of that.plugins ) {
					if ( plugin instanceof Creator ) {
						that._creators[ plugin.name ] = plugin;
					}
				}
			}

			function fireCreator() {
				// Take the name of the creator to use (config or any of the registered ones).
				var creatorName = config.creator ? ( 'creator-' + config.creator ) : Object.keys( that._creators )[ 0 ];
				var creator;

				if ( creatorName ) {
					// Take the registered class for the given creator name.
					creator = that._creators[ creatorName ];
				}

				if ( !creator ) {
					/**
					 * The creator has not been found.
					 *
					 * * If `creatorName` is defined it means that `config.creator` was configured, but such
					 * plugin does not exist or it does not implement a creator.
					 * * If `creatorName` is undefined it means that `config.creator` was not configured and
					 * that none of the loaded plugins implement a creator.
					 *
					 * @error editor-creator-404
					 * @param {String} creatorName
					 */
					throw new CKEditorError(
						'editor-creator-404: The creator has not been found.',
						{ creatorName: creatorName }
					);
				}

				that._creator = creator;

				// Finally fire the creator. It may be asynchronous, returning a promise.
				return creator.create();
			}
		}

		/**
		 * Destroys the editor instance, releasing all resources used by it. If the editor replaced an element, the
		 * element will be recovered.
		 *
		 * @fires destroy
		 * @returns {Promise} A promise that resolves once the editor instance is fully destroyed.
		 */
		destroy() {
			var that = this;

			this.fire( 'destroy' );

			delete this.element;

			return Promise.resolve().then( () => {
				return that._creator && that._creator.destroy();
			} );
		}
	}

	return Editor;
} );

/**
 * Fired when this editor instance is destroyed. The editor at this point is not usable and this event should be used to
 * perform the clean-up in any plugin.
 *
 * @event destroy
 */
