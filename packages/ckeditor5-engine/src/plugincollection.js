/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Manages a list of CKEditor plugins, including loading, resolving dependencies and initialization.
 *
 * @class PluginCollection
 */

import CKEDITOR from '../ckeditor.js';
import Plugin from './plugin.js';
import CKEditorError from './ckeditorerror.js';
import log from './log.js';
import load from '../ckeditor5/load.js';

export default class PluginCollection {
	/**
	 * Creates an instance of the PluginCollection class, initializing it with a set of plugins.
	 *
	 * @constructor
	 * @param {core/Editor} editor
	 */
	constructor( editor ) {
		/**
		 * @protected
		 * @property {core/Editor}
		 */
		this._editor = editor;

		/**
		 * @protected
		 * @property {Map}
		 */
		this._plugins = new Map();
	}

	/**
	 * Collection iterator. Returns `[ key, plugin ]` pairs. Plugins which are
	 * kept in the collection twice (under their name and class) will be returned twice.
	 */
	[ Symbol.iterator ]() {
		return this._plugins[ Symbol.iterator ]();
	}

	/**
	 * Gets the plugin instance by its name or class.
	 *
	 * @param {String/Function} key The name of the plugin or the class.
	 * @returns {Plugin}
	 */
	get( key ) {
		return this._plugins.get( key );
	}

	/**
	 * Loads a set of plugins and add them to the collection.
	 *
	 * @param {String[]} plugins An array of plugins to load.
	 * @returns {Promise} A promise which gets resolved once all plugins are loaded and available into the
	 * collection.
	 * @param {core/Plugin[]} returns.loadedPlugins The array of loaded plugins.
	 */
	load( plugins ) {
		const that = this;
		const editor = this._editor;
		const loading = new Set();
		const loaded = [];

		return Promise.all( plugins.map( loadPlugin ) )
			.then( () => loaded );

		function loadPlugin( pluginClassOrName ) {
			// The plugin is already loaded or being loaded - do nothing.
			if ( that.get( pluginClassOrName ) || loading.has( pluginClassOrName ) ) {
				return;
			}

			let promise = ( typeof pluginClassOrName == 'string' ) ?
				loadPluginByName( pluginClassOrName ) :
				loadPluginByClass( pluginClassOrName );

			return promise
				.catch( ( err ) => {
					/**
					 * It was not possible to load the plugin.
					 *
					 * @error plugincollection-load
					 * @param {String} plugin The name of the plugin that could not be loaded.
					 */
					log.error( 'plugincollection-load: It was not possible to load the plugin.', { plugin: pluginClassOrName } );

					throw err;
				} );
		}

		function loadPluginByName( pluginName ) {
			return load( CKEDITOR.getModulePath( pluginName ) )
				.then( ( PluginModule ) => {
					return loadPluginByClass( PluginModule.default, pluginName );
				} );
		}

		function loadPluginByClass( PluginClass, pluginName ) {
			return new Promise( ( resolve ) => {
				loading.add( PluginClass );

				assertIsPlugin( PluginClass );

				if ( PluginClass.requires ) {
					PluginClass.requires.forEach( loadPlugin );
				}

				const plugin = new PluginClass( editor );
				that._add( PluginClass, plugin );
				loaded.push( plugin );

				// Expose the plugin also by its name if loaded through load() by name.
				if ( pluginName ) {
					that._add( pluginName, plugin );
				}

				resolve();
			} );
		}

		function assertIsPlugin( LoadedPlugin ) {
			if ( !( LoadedPlugin.prototype instanceof Plugin ) ) {
				/**
				 * The loaded plugin module is not an instance of Plugin.
				 *
				 * @error plugincollection-instance
				 * @param {LoadedPlugin} plugin The class which is meant to be loaded as a plugin.
				 */
				throw new CKEditorError(
					'plugincollection-instance: The loaded plugin module is not an instance of Plugin.',
					{ plugin: LoadedPlugin }
				);
			}
		}
	}

	/**
	 * Adds the plugin to the collection. Exposed mainly for testing purposes.
	 *
	 * @protected
	 * @param {String/Function} key The name or the plugin class.
	 * @param {Plugin} plugin The instance of the plugin.
	 */
	_add( key, plugin ) {
		this._plugins.set( key, plugin );
	}
}
