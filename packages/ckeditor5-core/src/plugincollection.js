/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/plugincollection
 */

import Plugin from './plugin.js';
import CKEditorError from '../utils/ckeditorerror.js';
import log from '../utils/log.js';

/**
 * Manages a list of CKEditor plugins, including loading, resolving dependencies and initialization.
 */
export default class PluginCollection {
	/**
	 * Creates an instance of the PluginCollection class, initializing it with a set of plugins.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 */
	constructor( editor ) {
		/**
		 * @protected
		 * @member {module:core/editor/editor~Editor} module:core/plugin~PluginCollection#_editor
		 */
		this._editor = editor;

		/**
		 * @protected
		 * @member {Map} module:core/plugin~PluginCollection#_plugins
		 */
		this._plugins = new Map();
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
	 * @param {Function[]} plugins An array of {@link module:core/plugin~Plugin plugin constructors}.
	 * @returns {Promise} A promise which gets resolved once all plugins are loaded and available into the
	 * collection.
	 * @param {Array.<module:core/plugin~Plugin>} returns.loadedPlugins The array of loaded plugins.
	 */
	load( plugins ) {
		const that = this;
		const editor = this._editor;
		const loading = new Set();
		const loaded = [];

		return Promise.all( plugins.map( loadPlugin ) )
			.then( () => loaded );

		function loadPlugin( PluginConstructor ) {
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
					PluginConstructor.requires.forEach( loadPlugin );
				}

				const plugin = new PluginConstructor( editor );
				that._add( PluginConstructor, plugin );
				loaded.push( plugin );

				resolve();
			} );
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
