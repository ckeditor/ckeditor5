/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Manages a list of CKEditor plugins, including loading, initialization and destruction.
 *
 * @class PluginCollection
 * @extends Collection
 */

CKEDITOR.define( [ 'mvc/collection', 'promise' ], function( Collection, Promise ) {
	var PluginCollection = Collection.extend( {
		/**
		 * Creates an instance of the PluginCollection class, initializing it with a set of plugins.
		 *
		 * @constructor
		 */
		constructor: function PluginCollection( editor ) {
			// Call the base constructor.
			Collection.apply( this );

			this._editor = editor;

			// The hash table used to store pointers to loaded plugins by name.
			this._names = {};
		},

		/**
		 * Loads a set of plugins and add them to the collection.
		 *
		 * @param {String} plugins A comma separated list of plugin names to get loaded.
		 */
		load: function( plugins ) {
			var that = this;

			plugins = plugins.split( ',' );

			// Creates a promise for the loading of each plugin and returns a main promise that resolves when all are
			// done.
			return Promise.all( plugins.map( pluginPromise ) );

			// Returns a promise that will load the plugin and add it to the collection before resolving.
			function pluginPromise( plugin ) {
				return new Promise( function( resolve, reject ) {
					CKEDITOR.require( [ 'plugin!' + plugin ],
						// Success callback.
						function( LoadedPlugin ) {
							var loadedPlugin = new LoadedPlugin( that._editor );
							loadedPlugin.name = plugin;

							// Adds a new instance of the loaded plugin to the collection.
							that.add( loadedPlugin );

							// Done! Resolve this promise.
							resolve();
						},
						// Error callback.
						function() {
							var err = new Error( 'It was not possible to load the "' + plugin + '" plugin.' );
							err.name = 'CKEditor Error';
							reject( err );
						}
					);
				} );
			}
		},

		/**
		 * Adds a plugin to the collection.
		 *
		 * The `name` property must be set to the plugin object before passing it to this function. Adding plugins
		 * with the same name has no effect and silently fails.
		 *
		 * @param {Plugin} plugin The plugin to be added.
		 */
		add: function( plugin ) {
			// Do nothing if the plugin is already loaded.
			if ( this._names[ plugin.name ] ) {
				return;
			}

			// Save a pointer to the plugin by its name.
			this._names[ plugin.name ] = plugin;

			// Call the original implementation.
			Collection.prototype.add.apply( this, arguments );
		},

		/**
		 * Gets a plugin from the collection.
		 *
		 * @param {String} name The plugin name.
		 * @returns {Plugin} The requested plugin, if available in the collection.
		 */
		get: function( name ) {
			if ( typeof name != 'string' ) {
				return Collection.prototype.get.apply( this, arguments );
			}

			return this._names[ name ];
		}
	} );

	return PluginCollection;
} );
