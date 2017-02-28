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
	 * Creates an instance of the PluginCollection class, initializing it with a set of plugins.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {Array.<module:core/plugin>} availablePlugins
	 */
	constructor( editor, availablePlugins = [] ) {
		/**
		 * @protected
		 * @member {module:core/editor/editor~Editor} module:core/plugin~PluginCollection#_editor
		 */
		this._editor = editor;

		/**
		 * @protected
		 * @member {Map.<String,module:core/plugin~Plugin>} module:core/plugin~PluginCollection#_availablePlugins
		 */
		this._availablePlugins = new Map();

		/**
		 * @protected
		 * @member {Map} module:core/plugin~PluginCollection#_plugins
		 */
		this._plugins = new Map();

		// Save available plugins.
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
	 * Loads a set of plugins and add them to the collection.
	 *
	 * @param {Array.<module:core/plugin~Plugin|String>} plugins An array of {@link module:core/plugin~Plugin plugin constructors}
	 * or plugin names.
	 * @param {Array.<String>} removePlugins
	 * @returns {Promise} A promise which gets resolved once all plugins are loaded and available into the
	 * collection.
	 * @returns {Array.<module:core/plugin~Plugin>} returns.loadedPlugins The array of loaded plugins.
	 */
	load( plugins, removePlugins = [] ) {
		const that = this;
		const editor = this._editor;
		const loading = new Set();
		const loaded = [];

		// Plugins that will be removed can be the constructors or names.
		// We need to unify this because we are supporting loading plugins using both types.
		removePlugins = removePlugins.reduce( ( arr, PluginConstructorOrName ) => {
			arr.push( PluginConstructorOrName );

			if ( typeof PluginConstructorOrName === 'string' ) {
				arr.push( getPluginConstructor( PluginConstructorOrName ) );
			} else if ( PluginConstructorOrName.pluginName ) {
				arr.push( PluginConstructorOrName.pluginName );
			}

			return arr;
		}, [] );

		return Promise.all( plugins.map( loadPlugin ) )
			.then( () => loaded );

		function loadPlugin( PluginConstructorOrName ) {
			// Don't load the plugin if it cannot be loaded.
			if ( removePlugins.includes( PluginConstructorOrName ) ) {
				return;
			}

			// The plugin is already loaded or being loaded - do nothing.
			if ( that.get( PluginConstructorOrName ) || loading.has( PluginConstructorOrName ) ) {
				return;
			}

			return instantiatePlugin( PluginConstructorOrName )
				.catch( ( err ) => {
					/**
					 * It was not possible to load the plugin.
					 *
					 * @error plugincollection-load
					 * @param {String} plugin The name of the plugin that could not be loaded.
					 */
					log.error( 'plugincollection-load: It was not possible to load the plugin.', { plugin: PluginConstructorOrName } );

					throw err;
				} );
		}

		function instantiatePlugin( PluginConstructorOrName ) {
			return new Promise( ( resolve ) => {
				const PluginConstructor = getPluginConstructor( PluginConstructorOrName );

				loading.add( PluginConstructor );

				assertIsPlugin( PluginConstructor );

				if ( PluginConstructor.requires ) {
					PluginConstructor.requires.forEach( ( RequiredPluginConstructorOrName ) => {
						if ( removePlugins.includes( RequiredPluginConstructorOrName ) ) {
							/**
							 * The plugin dependency cannot be loaded because is listed in `removePlugins` options.
							 *
							 * @error plugincollection-instance
							 * @param {*} plugin The dependency constructor which is meant to be loaded as a plugin.
							 * @param {*} requiredBy The parent constructor which is meant to be loaded as a plugin.
							 */
							throw new CKEditorError(
								'plugincollection-instance: Cannot load dependency plugins because at least one is listed in ' +
								'`removePlugins` options.',
								{ plugin: RequiredPluginConstructorOrName, requiredBy: PluginConstructorOrName }
							);
						}

						loadPlugin( RequiredPluginConstructorOrName );
					} );
				}

				const plugin = new PluginConstructor( editor );
				that._add( PluginConstructor, plugin );
				loaded.push( plugin );

				resolve();
			} );
		}

		function getPluginConstructor( PluginConstructorOrName ) {
			if ( typeof PluginConstructorOrName === 'function' ) {
				return PluginConstructorOrName;
			}

			const PluginConstructor = that._availablePlugins.get( PluginConstructorOrName );

			if ( !PluginConstructor ) {
				/**
				 * The loaded plugin module is not available.
				 *
				 * @error plugincollection-instance
				 * @param {*} plugin The constructor which is meant to be loaded as a plugin.
				 */
				throw new CKEditorError(
					'plugincollection-instance: Given plugin name is not available.',
					{ plugin: PluginConstructorOrName }
				);
			}

			return PluginConstructor;
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
