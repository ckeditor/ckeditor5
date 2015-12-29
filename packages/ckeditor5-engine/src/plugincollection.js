/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Manages a list of CKEditor plugins, including loading, initialization and destruction.
 *
 * @class PluginCollection
 * @extends Map
 */

import CKEDITOR from '../ckeditor.js';
import Plugin from './plugin.js';
import CKEditorError from './ckeditorerror.js';
import log from './log.js';
import load from '../ckeditor5/load.js';

export default class PluginCollection extends Map {
	/**
	 * Creates an instance of the PluginCollection class, initializing it with a set of plugins.
	 *
	 * @constructor
	 * @param {core/Editor} editor
	 */
	constructor( editor ) {
		super();

		/**
		 * @protected
		 * @property {core/Editor}
		 */
		this._editor = editor;
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
				that.set( PluginClass, plugin );
				loaded.push( plugin );

				// Expose the plugin also by its name if loaded through load() by name.
				if ( pluginName ) {
					that.set( pluginName, plugin );
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
}
