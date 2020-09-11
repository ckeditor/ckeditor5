/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/plugincollection
 */

/* globals console */

import CKEditorError, { attachLinkToDocumentation } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Manages a list of CKEditor plugins, including loading, resolving dependencies and initialization.
 *
 * @mixes module:utils/emittermixin~EmitterMixin
 */
export default class PluginCollection {
	/**
	 * Creates an instance of the plugin collection class.
	 * Allows loading and initializing plugins and their dependencies.
	 * Allows to provide a list of already loaded plugins. These plugins will not be destroyed along with this collection.
	 *
	 * @param {module:core/editor/editor~Editor|module:core/context~Context} context
	 * @param {Array.<Function>} [availablePlugins] Plugins (constructors) which the collection will be able to use
	 * when {@link module:core/plugincollection~PluginCollection#init} is used with plugin names (strings, instead of constructors).
	 * Usually, the editor will pass its built-in plugins to the collection so they can later be
	 * used in `config.plugins` or `config.removePlugins` by names.
	 * @param {Iterable.<Array>} contextPlugins A list of already initialized plugins represented by a
	 * `[ PluginConstructor, pluginInstance ]` pair.
	 */
	constructor( context, availablePlugins = [], contextPlugins = [] ) {
		/**
		 * @protected
		 * @type {module:core/editor/editor~Editor|module:core/context~Context}
		 */
		this._context = context;

		/**
		 * @protected
		 * @type {Map}
		 */
		this._plugins = new Map();

		/**
		 * A map of plugin constructors that can be retrieved by their names.
		 *
		 * @protected
		 * @type {Map.<String|Function,Function>}
		 */
		this._availablePlugins = new Map();

		for ( const PluginConstructor of availablePlugins ) {
			if ( PluginConstructor.pluginName ) {
				this._availablePlugins.set( PluginConstructor.pluginName, PluginConstructor );
			}
		}

		/**
		 * Map of {@link module:core/contextplugin~ContextPlugin context plugins} which can be retrieved by their constructors or instances.
		 *
		 * @protected
		 * @type {Map<Function,Function>}
		 */
		this._contextPlugins = new Map();

		for ( const [ PluginConstructor, pluginInstance ] of contextPlugins ) {
			this._contextPlugins.set( PluginConstructor, pluginInstance );
			this._contextPlugins.set( pluginInstance, PluginConstructor );

			// To make it possible to require a plugin by its name.
			if ( PluginConstructor.pluginName ) {
				this._availablePlugins.set( PluginConstructor.pluginName, PluginConstructor );
			}
		}
	}

	/**
	 * Iterable interface.
	 *
	 * Returns `[ PluginConstructor, pluginInstance ]` pairs.
	 *
	 * @returns {Iterable.<Array>}
	 */
	* [ Symbol.iterator ]() {
		for ( const entry of this._plugins ) {
			if ( typeof entry[ 0 ] == 'function' ) {
				yield entry;
			}
		}
	}

	/**
	 * Gets the plugin instance by its constructor or name.
	 *
	 *		// Check if 'Clipboard' plugin was loaded.
	 *		if ( editor.plugins.has( 'Clipboard' ) ) {
	 *			// Get clipboard plugin instance
	 *			const clipboard = editor.plugins.get( 'Clipboard' );
	 *
	 *			this.listenTo( clipboard, 'inputTransformation', ( evt, data ) => {
	 *				// Do something on clipboard input.
	 *			} );
	 *		}
	 *
	 * **Note**: This method will throw error if plugin is not loaded. Use `{@link #has editor.plugins.has()}`
	 * to check if plugin is available.
	 *
	 * @param {Function|String} key The plugin constructor or {@link module:core/plugin~PluginInterface.pluginName name}.
	 * @returns {module:core/plugin~PluginInterface}
	 */
	get( key ) {
		const plugin = this._plugins.get( key );

		if ( !plugin ) {
			/**
			 * The plugin is not loaded and could not be obtained.
			 *
			 * Plugin classes (constructors) need to be provided to the editor and must be loaded before they can be obtained from
			 * the plugin collection.
			 * This is usually done in CKEditor 5 builds by setting the {@link module:core/editor/editor~Editor.builtinPlugins}
			 * property.
			 *
			 * **Note**: You can use `{@link module:core/plugincollection~PluginCollection#has editor.plugins.has()}`
			 * to check if plugin was loaded.
			 *
			 * @error plugincollection-plugin-not-loaded
			 * @param {String} plugin The name of the plugin which is not loaded.
			 */
			const errorMsg = 'plugincollection-plugin-not-loaded: The requested plugin is not loaded.';

			let pluginName = key;

			if ( typeof key == 'function' ) {
				pluginName = key.pluginName || key.name;
			}

			throw new CKEditorError( errorMsg, this._context, { plugin: pluginName } );
		}

		return plugin;
	}

	/**
	 * Checks if a plugin is loaded.
	 *
	 *		// Check if the 'Clipboard' plugin was loaded.
	 *		if ( editor.plugins.has( 'Clipboard' ) ) {
	 *			// Now use the clipboard plugin instance:
	 *			const clipboard = editor.plugins.get( 'Clipboard' );
	 *
	 *			// ...
	 *		}
	 *
	 * @param {Function|String} key The plugin constructor or {@link module:core/plugin~PluginInterface.pluginName name}.
	 * @returns {Boolean}
	 */
	has( key ) {
		return this._plugins.has( key );
	}

	/**
	 * Initializes a set of plugins and adds them to the collection.
	 *
	 * @param {Array.<Function|String>} plugins An array of {@link module:core/plugin~PluginInterface plugin constructors}
	 * or {@link module:core/plugin~PluginInterface.pluginName plugin names}. The second option (names) works only if
	 * `availablePlugins` were passed to the {@link #constructor}.
	 * @param {Array.<String|Function>} [removePlugins] Names of plugins or plugin constructors
	 * that should not be loaded (despite being specified in the `plugins` array).
	 * @returns {Promise.<module:core/plugin~LoadedPlugins>} A promise which gets resolved once all plugins are loaded
	 * and available in the collection.
	 */
	init( plugins, removePlugins = [] ) {
		const that = this;
		const context = this._context;
		const loading = new Set();
		const loaded = [];

		const pluginConstructors = mapToAvailableConstructors( plugins );
		const removePluginConstructors = mapToAvailableConstructors( removePlugins );
		const missingPlugins = getMissingPluginNames( plugins );

		if ( missingPlugins ) {
			/**
			 * Some plugins are not available and could not be loaded.
			 *
			 * Plugin classes (constructors) need to be provided to the editor before they can be loaded by name.
			 * This is usually done in CKEditor 5 builds by setting the {@link module:core/editor/editor~Editor.builtinPlugins}
			 * property.
			 *
			 * **If you see this warning when using one of the {@glink builds/index CKEditor 5 Builds}**, it means
			 * that you try to enable a plugin which was not included in that build. This may be due to a typo
			 * in the plugin name or simply because that plugin is not a part of this build. In the latter scenario,
			 * read more about {@glink builds/guides/development/custom-builds custom builds}.
			 *
			 * **If you see this warning when using one of the editor creators directly** (not a build), then it means
			 * that you tried loading plugins by name. However, unlike CKEditor 4, CKEditor 5 does not implement a "plugin loader".
			 * This means that CKEditor 5 does not know where to load the plugin modules from. Therefore, you need to
			 * provide each plugin through reference (as a constructor function). Check out the examples in
			 * {@glink builds/guides/integration/advanced-setup#scenario-2-building-from-source "Building from source"}.
			 *
			 * @error plugincollection-plugin-not-found
			 * @param {Array.<String>} plugins The name of the plugins which could not be loaded.
			 */
			const errorMsg = 'plugincollection-plugin-not-found: Some plugins are not available and could not be loaded.';

			// Log the error so it's more visible on the console. Hopefully, for better DX.
			console.error( attachLinkToDocumentation( errorMsg ), { plugins: missingPlugins } );

			return Promise.reject( new CKEditorError( errorMsg, context, { plugins: missingPlugins } ) );
		}

		return Promise.all( pluginConstructors.map( loadPlugin ) )
			.then( () => initPlugins( loaded, 'init' ) )
			.then( () => initPlugins( loaded, 'afterInit' ) )
			.then( () => loaded );

		function loadPlugin( PluginConstructor ) {
			if ( removePluginConstructors.includes( PluginConstructor ) ) {
				return;
			}

			// The plugin is already loaded or being loaded - do nothing.
			if ( that._plugins.has( PluginConstructor ) || loading.has( PluginConstructor ) ) {
				return;
			}

			return instantiatePlugin( PluginConstructor )
				.catch( err => {
					/**
					 * It was not possible to load the plugin.
					 *
					 * This is a generic error logged to the console when a JavaSript error is thrown during the initialization
					 * of one of the plugins.
					 *
					 * If you correctly handled the promise returned by the editor's `create()` method (like shown below),
					 * you will find the original error logged to the console, too:
					 *
					 *		ClassicEditor.create( document.getElementById( 'editor' ) )
					 *			.then( editor => {
					 *				// ...
					 * 			} )
					 *			.catch( error => {
					 *				console.error( error );
					 *			} );
					 *
					 * @error plugincollection-load
					 * @param {String} plugin The name of the plugin that could not be loaded.
					 */
					console.error( attachLinkToDocumentation(
						'plugincollection-load: It was not possible to load the plugin.'
					), { plugin: PluginConstructor } );

					throw err;
				} );
		}

		function initPlugins( loadedPlugins, method ) {
			return loadedPlugins.reduce( ( promise, plugin ) => {
				if ( !plugin[ method ] ) {
					return promise;
				}

				if ( that._contextPlugins.has( plugin ) ) {
					return promise;
				}

				return promise.then( plugin[ method ].bind( plugin ) );
			}, Promise.resolve() );
		}

		function instantiatePlugin( PluginConstructor ) {
			return new Promise( resolve => {
				loading.add( PluginConstructor );

				if ( PluginConstructor.requires ) {
					PluginConstructor.requires.forEach( RequiredPluginConstructorOrName => {
						const RequiredPluginConstructor = getPluginConstructor( RequiredPluginConstructorOrName );

						if ( PluginConstructor.isContextPlugin && !RequiredPluginConstructor.isContextPlugin ) {
							/**
							 * If a plugin is a context plugin, all plugins it requires should also be context plugins
							 * instead of plugins. In other words, if one plugin can be used in the context,
							 * all its requirements should also be ready to be used in the context. Note that the context
							 * provides only a part of the API provided by the editor. If one plugin needs a full
							 * editor API, all plugins which require it are considered as plugins that need a full
							 * editor API.
							 *
							 * @error plugincollection-context-required
							 * @param {String} plugin The name of the required plugin.
							 * @param {String} requiredBy The name of the parent plugin.
							 */
							throw new CKEditorError(
								'plugincollection-context-required',
								null,
								{ plugin: RequiredPluginConstructor.name, requiredBy: PluginConstructor.name }
							);
						}

						if ( removePlugins.includes( RequiredPluginConstructor ) ) {
							/**
							 * Cannot load a plugin because one of its dependencies is listed in the `removePlugins` option.
							 *
							 * @error plugincollection-required
							 * @param {String} plugin The name of the required plugin.
							 * @param {String} requiredBy The name of the parent plugin.
							 */
							throw new CKEditorError(
								'plugincollection-required',
								context,
								{ plugin: RequiredPluginConstructor.name, requiredBy: PluginConstructor.name }
							);
						}

						loadPlugin( RequiredPluginConstructor );
					} );
				}

				const plugin = that._contextPlugins.get( PluginConstructor ) || new PluginConstructor( context );
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

		function getMissingPluginNames( plugins ) {
			const missingPlugins = [];

			for ( const pluginNameOrConstructor of plugins ) {
				if ( !getPluginConstructor( pluginNameOrConstructor ) ) {
					missingPlugins.push( pluginNameOrConstructor );
				}
			}

			return missingPlugins.length ? missingPlugins : null;
		}

		function mapToAvailableConstructors( plugins ) {
			return plugins
				.map( pluginNameOrConstructor => getPluginConstructor( pluginNameOrConstructor ) )
				.filter( PluginConstructor => !!PluginConstructor );
		}
	}

	/**
	 * Destroys all loaded plugins.
	 *
	 * @returns {Promise}
	 */
	destroy() {
		const promises = [];

		for ( const [ , pluginInstance ] of this ) {
			if ( typeof pluginInstance.destroy == 'function' && !this._contextPlugins.has( pluginInstance ) ) {
				promises.push( pluginInstance.destroy() );
			}
		}

		return Promise.all( promises );
	}

	/**
	 * Adds the plugin to the collection. Exposed mainly for testing purposes.
	 *
	 * @protected
	 * @param {Function} PluginConstructor The plugin constructor.
	 * @param {module:core/plugin~PluginInterface} plugin The instance of the plugin.
	 */
	_add( PluginConstructor, plugin ) {
		this._plugins.set( PluginConstructor, plugin );

		const pluginName = PluginConstructor.pluginName;

		if ( !pluginName ) {
			return;
		}

		if ( this._plugins.has( pluginName ) ) {
			/**
			 * Two plugins with the same {@link module:core/plugin~PluginInterface.pluginName} were loaded.
			 * This will lead to runtime conflicts between these plugins.
			 *
			 * In practice, this warning usually means that new plugins were added to an existing CKEditor 5 build.
			 * Plugins should always be added to a source version of the editor (`@ckeditor/ckeditor5-editor-*`),
			 * not to an editor imported from one of the `@ckeditor/ckeditor5-build-*` packages.
			 *
			 * Check your import paths and the list of plugins passed to
			 * {@link module:core/editor/editor~Editor.create `Editor.create()`}
			 * or specified in {@link module:core/editor/editor~Editor.builtinPlugins `Editor.builtinPlugins`}.
			 *
			 * The second option is that your `node_modules/` directory contains duplicated versions of the same
			 * CKEditor 5 packages. Normally, on clean installations, npm deduplicates packages in `node_modules/`, so
			 * it may be enough to call `rm -rf node_modules && npm i`. However, if you installed conflicting versions
			 * of packages, their dependencies may need to be installed in more than one version which may lead to this
			 * warning.
			 *
			 * Technically speaking, this error occurs because after adding a plugin to an existing editor build
			 * dependencies of this plugin are being duplicated.
			 * They are already built into that editor build and now get added for the second time as dependencies
			 * of the plugin you are installing.
			 *
			 * Read more about {@glink builds/guides/integration/installing-plugins installing plugins}.
			 *
			 * @error plugincollection-plugin-name-conflict
			 * @param {String} pluginName The duplicated plugin name.
			 * @param {Function} plugin1 The first plugin constructor.
			 * @param {Function} plugin2 The second plugin constructor.
			 */
			throw new CKEditorError(
				'plugincollection-plugin-name-conflict',
				null,
				{ pluginName, plugin1: this._plugins.get( pluginName ).constructor, plugin2: PluginConstructor }
			);
		}

		this._plugins.set( pluginName, plugin );
	}
}

mix( PluginCollection, EmitterMixin );
