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

CKEDITOR.define( [
	'namedcollection',
	'plugin',
	'ckeditorerror',
	'log'
], function( NamedCollection, Plugin, CKEditorError, log ) {
	class PluginCollection extends NamedCollection {
		/**
		 * Creates an instance of the PluginCollection class, initializing it with a set of plugins.
		 *
		 * @constructor
		 */
		constructor( editor ) {
			super();

			this._editor = editor;
		}

		/**
		 * Loads a set of plugins and add them to the collection.
		 *
		 * @param {String} plugins A comma separated list of plugin names to get loaded.
		 * @returns {Promise} A promise which gets resolved once all plugins are loaded and available into the
		 * collection.
		 * @param {core/Plugin[]} returns.loadedPlugins The array of loaded plugins.
		 */
		load( plugins ) {
			var that = this;

			// The list of plugins which are being loaded (to avoid circular references issues).
			var loading = {};
			// Plugins added to the collection (for the purpose of returning an array of loaded plugins).
			var loaded = [];

			// It may happen that an empty list was passed – don't fail.
			plugins = plugins ? plugins.split( ',' ) : [];

			// Creates a promise for the loading of each plugin and returns a main promise that resolves when all are
			// done.
			return Promise.all( plugins.map( pluginPromise ) )
				.then( function() {
					return loaded;
				} );

			// Returns a promise that will load the plugin and add it to the collection before resolving.
			function pluginPromise( plugin ) {
				return new Promise( function( resolve, reject ) {
					// Do nothing if the plugin is already loaded (or if is being loaded right now).
					if ( that._models[ plugin ] || loading[ plugin ] ) {
						return resolve();
					}

					CKEDITOR.require( [ 'plugin!' + plugin ],
						// Success callback.
						function( LoadedPlugin ) {
							var deps = getPluginDeps( plugin );
							var isPluginDep = plugin.indexOf( '/' ) > 0;

							if ( !isPluginDep ) {
								var loadedPlugin = new LoadedPlugin( that._editor );

								if ( !( loadedPlugin instanceof Plugin ) ) {
									/**
									 * The plugin is not an instance of Plugin.
									 *
									 * @error plugincollection-instance
									 * @param {String} plugin The name of the plugin that is not an instance of Plugin.
									 */
									return reject(
										new CKEditorError(
											'plugincollection-instance: The plugin is not an instance of Plugin.',
											{ plugin: plugin }
										)
									);
								}

								loadedPlugin.name = plugin;
								loadedPlugin.path = CKEDITOR.getPluginPath( plugin );
								loadedPlugin.deps = deps;
							}

							loading[ plugin ] = true;

							// Resolve with a promise that resolves once all dependencies are loaded.
							resolve(
								Promise.all( deps.map( pluginPromise ) )
									.then( function() {
										// Once dependencies are loaded, add the new instance of the loaded plugin to
										// the collection. This guarantees that dependecies come first in the collection.
										if ( !isPluginDep ) {
											that.add( loadedPlugin );
											loaded.push( loadedPlugin );
										}
									} )
							);
						},
						// Error callback.
						function( err ) {
							/**
							 * It was not possible to load the plugin.
							 *
							 * @error plugincollection-load
							 * @param {String} plugin The name of the plugin that could not be loaded.
							 */
							log.error( 'plugincollection-load: It was not possible to load the plugin.', { plugin: plugin } );
							reject( err );
						}
					);
				} );
			}

			function getPluginDeps( name ) {
				// Get the list of AMD modules that the plugin depends on.
				var deps = CKEDITOR._dependencies[ 'plugin!' + name ] || [];

				deps = deps
					// Pick only dependencies that are other plugins.
					.filter( function( dep ) {
						return dep.indexOf( 'plugin!' ) === 0;
					} )
					// Remove the 'plugin!' prefix.
					.map( function( dep ) {
						return dep.substr( 7 );
					} );

				return deps;
			}
		}

		/**
		 * Executes the callback for each model in the collection.
		 *
		 * @param {Function} callback
		 * @param {Model} callback.item
		 * @param {String} callback.name
		 */
		forEach( callback ) {
			for ( var name in this._models ) {
				callback( this._models[ name ], name );
			}
		}
	}

	return PluginCollection;
} );
