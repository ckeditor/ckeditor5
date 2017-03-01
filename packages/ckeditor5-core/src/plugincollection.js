/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/plugincollection
 */

import Plugin from './plugin';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import log from '@ckeditor/ckeditor5-utils/src/log';

/**
 * Manages a list of CKEditor plugins, including loading, resolving dependencies and initialization.
 */
export default class PluginCollection {
	/**
	 * Creates an instance of the PluginCollection class.
	 * Allows loading and initializing plugins and their dependencies.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {Array.<Function>} availablePlugins Plugins (constructor) which the collection will be able to use
	 * when {@link module:core/plugin~PluginCollection#load} is given strings (plugin names).
	 * Usually, the editor will pass its built-in plugins to the collection so they can later be
	 * used in `config.plugins` or `config.removePlugins` by names.
	 */
	constructor( editor, availablePlugins = [] ) {
		/**
		 * @protected
		 * @member {module:core/editor/editor~Editor} module:core/plugin~PluginCollection#_editor
		 */
		this._editor = editor;

		/**
		 * Map of plugin constructors which can be retrieved by their names.
		 *
		 * @protected
		 * @member {Map.<String|Function,Function>} module:core/plugin~PluginCollection#_availablePlugins
		 */
		this._availablePlugins = new Map();

		/**
		 * @protected
		 * @member {Map} module:core/plugin~PluginCollection#_plugins
		 */
		this._plugins = new Map();

		for ( const PluginConstructor of availablePlugins ) {
			this._availablePlugins.set( PluginConstructor, PluginConstructor );

			if ( PluginConstructor.pluginName ) {
				this._availablePlugins.set( PluginConstructor.pluginName, PluginConstructor );
			}
		}
	}

	/**
	 * Collection iterator. Returns `[ PluginConstructor, pluginInstance ]` pairs.
	 */
	*[ Symbol.iterator ]() {
		for ( const entry of this._plugins ) {
			if ( typeof entry[ 0 ] == 'function' ) {
				yield entry;
			}
		}
	}

	/**
	 * Gets the plugin instance by its constructor or name.
	 *
	 * @param {Function|String} key The plugin constructor or {@link module:core/plugin~Plugin.pluginName name}.
	 * @returns {module:core/plugin~Plugin}
	 */
	get( key ) {
		return this._plugins.get( key );
	}

	/**
	 * Loads a set of plugins and adds them to the collection.
	 *
	 * @param {Array.<Function|String>} plugins An array of {@link module:core/plugin~Plugin plugin constructors}
	 * or {@link module:core/plugin~Plugin.pluginName plugin names}. The second option (names) work only if
	 * `availablePlugins` were passed to the {@link #constructor}.
	 * @param {Array.<String|Function>} removePlugins Names of plugins or plugin constructors
	 *  which should not be loaded (despite being specified in the `plugins` array).
	 * @returns {Promise} A promise which gets resolved once all plugins are loaded and available into the
	 * collection.
	 * @returns {Promise.<Array.<module:core/plugin~Plugin>>} returns.loadedPlugins The array of loaded plugins.
	 */
	load( plugins, removePlugins = [] ) {
		const that = this;
		const editor = this._editor;
		const loading = new Set();
		const loaded = [];

		// In order to avoid using plugin names or constructors alternatively, we map all passed plugin as plugins constructors.
		const pluginConstructorsToLoad = plugins
			.map( ( item ) => getPluginConstructor( item ) )
			.filter( ( PluginConstructor ) => !!PluginConstructor );

		const missingPlugins = getMissingPlugins( plugins );

		if ( missingPlugins ) {
			log.error( 'plugincollection-load: It was not possible to load the plugins.', { plugins: missingPlugins } );

			/**
			 * The plugins cannot be loaded by name.
			 *
			 * Plugin classes need to be provided to the editor before they can be loaded by name.
			 * This is usually done by the builder.
			 *
			 * @error plugincollection-plugin-not-found
			 * @param {Array.<String>} plugins The name of the plugins which could not be loaded.
			 */
			return Promise.reject( new CKEditorError(
				'plugincollection-plugin-not-found: The plugin cannot be loaded by name.',
				{ plugins: missingPlugins }
			) );

			// TODO update this error with links to docs because it will be a frequent problem.
		}

		// Plugins that will be removed can be the constructors or names. We need to transform plugin names to plugin constructors.
		const pluginConstructorsToRemove = removePlugins.map( ( item ) => getPluginConstructor( item ) )
			.filter( ( PluginConstructor ) => !!PluginConstructor );

		return Promise.all( pluginConstructorsToLoad.map( loadPlugin ) )
			.then( () => loaded );

		function loadPlugin( PluginConstructor ) {
			if ( pluginConstructorsToRemove.includes( PluginConstructor ) ) {
				return;
			}

			// The plugin is already loaded or being loaded - do nothing.
			if ( that.get( PluginConstructor ) || loading.has( PluginConstructor ) ) {
				return;
			}

			return instantiatePlugin( PluginConstructor )
				.catch( ( err ) => {
					/**
					 * It was not possible to load the plugin.
					 *
					 * @error plugincollection-load
					 * @param {String} plugin The name of the plugin that could not be loaded.
					 */
					log.error( 'plugincollection-load: It was not possible to load the plugin.', { plugin: PluginConstructor } );

					throw err;
				} );
		}

		function instantiatePlugin( PluginConstructor ) {
			return new Promise( ( resolve ) => {
				loading.add( PluginConstructor );

				assertIsPlugin( PluginConstructor );

				if ( PluginConstructor.requires ) {
					PluginConstructor.requires.forEach( ( RequiredPluginConstructorOrName ) => {
						const RequiredPluginConstructor = getPluginConstructor( RequiredPluginConstructorOrName );

						if ( removePlugins.includes( RequiredPluginConstructor ) ) {
							/**
							 * Cannot load a plugin because one of its dependencies is listed in the `removePlugins` options.
							 *
							 * @error plugincollection-required
							 * @param {Function} plugin The required plugin.
							 * @param {Function} requiredBy The parent plugin.
							 */
							throw new CKEditorError(
								'plugincollection-required: Cannot load a plugin because one of its dependencies is listed in' +
								'the `removePlugins` options.',
								{ plugin: RequiredPluginConstructor, requiredBy: PluginConstructor }
							);
						}

						loadPlugin( RequiredPluginConstructor );
					} );
				}

				const plugin = new PluginConstructor( editor );
				that._add( PluginConstructor, plugin );
				loaded.push( plugin );

				resolve();
			} );
		}

		function getPluginConstructor( PluginConstructorOrName ) {
			if ( typeof PluginConstructorOrName == 'function' ) {
				return PluginConstructorOrName;
			}

			return that._availablePlugins.get( PluginConstructorOrName );
		}

		function assertIsPlugin( PluginConstructor ) {
			if ( !( PluginConstructor.prototype instanceof Plugin ) ) {
				/**
				 * The loaded plugin module is not an instance of {@link module:core/plugin~Plugin}.
				 *
				 * @error plugincollection-instance
				 * @param {*} plugin The constructor which is meant to be loaded as a plugin.
				 */
				throw new CKEditorError(
					'plugincollection-instance: The loaded plugin module is not an instance of Plugin.',
					{ plugin: PluginConstructor }
				);
			}
		}

		function getMissingPlugins( plugins ) {
			const missingPlugins = [];

			for ( const PluginNameOrConstructor of plugins ) {
				const PluginConstructor = getPluginConstructor( PluginNameOrConstructor );

				if ( !PluginConstructor ) {
					missingPlugins.push( PluginNameOrConstructor );
				}
			}

			return missingPlugins.length ? missingPlugins : null;
		}
	}

	/**
	 * Adds the plugin to the collection. Exposed mainly for testing purposes.
	 *
	 * @protected
	 * @param {Function} PluginConstructor The plugin constructor.
	 * @param {module:core/plugin~Plugin} plugin The instance of the plugin.
	 */
	_add( PluginConstructor, plugin ) {
		this._plugins.set( PluginConstructor, plugin );

		if ( PluginConstructor.pluginName ) {
			this._plugins.set( PluginConstructor.pluginName, plugin );
		}
	}
}
