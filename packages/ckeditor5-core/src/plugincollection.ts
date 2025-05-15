/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/plugincollection
 */

import { CKEditorError, EmitterMixin } from '@ckeditor/ckeditor5-utils';
import type { LoadedPlugins, PluginClassConstructor, PluginConstructor, PluginInterface } from './plugin.js';

/**
 * Manages a list of CKEditor plugins, including loading, resolving dependencies and initialization.
 */
export default class PluginCollection<TContext extends object>
	extends /* #__PURE__ */ EmitterMixin()
	implements Iterable<PluginEntry<TContext>> {
	private _context: TContext;

	private _plugins = new Map<PluginConstructor<TContext> | string, PluginInterface>();

	/**
	 * A map of plugin constructors that can be retrieved by their names.
	 */
	private _availablePlugins: Map<string, PluginConstructor<TContext>>;

	/**
	 * Map of {@link module:core/contextplugin~ContextPlugin context plugins} which can be retrieved by their constructors or instances.
	 */
	private _contextPlugins: Map<PluginConstructor<TContext> | PluginInterface, PluginConstructor<TContext> | PluginInterface>;

	/**
	 * Creates an instance of the plugin collection class.
	 * Allows loading and initializing plugins and their dependencies.
	 * Allows providing a list of already loaded plugins. These plugins will not be destroyed along with this collection.
	 *
	 * @param availablePlugins Plugins (constructors) which the collection will be able to use
	 * when {@link module:core/plugincollection~PluginCollection#init} is used with the plugin names (strings, instead of constructors).
	 * Usually, the editor will pass its built-in plugins to the collection so they can later be
	 * used in `config.plugins` or `config.removePlugins` by names.
	 * @param contextPlugins A list of already initialized plugins represented by a `[ PluginConstructor, pluginInstance ]` pair.
	 */
	constructor(
		context: TContext,
		availablePlugins: Iterable<PluginConstructor<TContext>> = [],
		contextPlugins: Iterable<PluginEntry<TContext>> = []
	) {
		super();

		this._context = context;
		this._availablePlugins = new Map();

		for ( const PluginConstructor of availablePlugins ) {
			if ( PluginConstructor.pluginName ) {
				this._availablePlugins.set( PluginConstructor.pluginName, PluginConstructor );
			}
		}

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
	 */
	public* [ Symbol.iterator ](): IterableIterator<PluginEntry<TContext>> {
		for ( const entry of this._plugins ) {
			if ( typeof entry[ 0 ] == 'function' ) {
				yield entry as any;
			}
		}
	}

	public get<TConstructor extends PluginClassConstructor<TContext>>( key: TConstructor ): InstanceType<TConstructor>;
	public get<TName extends string>( key: TName ): PluginsMap[ TName ];

	/**
	 * Gets the plugin instance by its constructor or name.
	 *
	 * ```ts
	 * // Check if 'Clipboard' plugin was loaded.
	 * if ( editor.plugins.has( 'ClipboardPipeline' ) ) {
	 * 	// Get clipboard plugin instance
	 * 	const clipboard = editor.plugins.get( 'ClipboardPipeline' );
	 *
	 * 	this.listenTo( clipboard, 'inputTransformation', ( evt, data ) => {
	 * 		// Do something on clipboard input.
	 * 	} );
	 * }
	 * ```
	 *
	 * **Note**: This method will throw an error if a plugin is not loaded. Use `{@link #has editor.plugins.has()}`
	 * to check if a plugin is available.
	 *
	 * @param key The plugin constructor or {@link module:core/plugin~PluginStaticMembers#pluginName name}.
	 */
	public get( key: PluginConstructor<TContext> | string ): PluginInterface {
		const plugin = this._plugins.get( key );

		if ( !plugin ) {
			let pluginName = key;

			if ( typeof key == 'function' ) {
				pluginName = key.pluginName || key.name;
			}

			/**
			 * The plugin is not loaded and could not be obtained.
			 *
			 * Plugin classes (constructors) need to be provided to the editor and must be loaded before they can be obtained from
			 * the plugin collection.
			 *
			 * **Note**: You can use `{@link module:core/plugincollection~PluginCollection#has editor.plugins.has()}`
			 * to check if a plugin was loaded.
			 *
			 * @error plugincollection-plugin-not-loaded
			 * @param {string} plugin The name of the plugin which is not loaded.
			 */
			throw new CKEditorError( 'plugincollection-plugin-not-loaded', this._context, { plugin: pluginName } );
		}

		return plugin;
	}

	/**
	 * Checks if a plugin is loaded.
	 *
	 * ```ts
	 * // Check if the 'Clipboard' plugin was loaded.
	 * if ( editor.plugins.has( 'ClipboardPipeline' ) ) {
	 * 	// Now use the clipboard plugin instance:
	 * 	const clipboard = editor.plugins.get( 'ClipboardPipeline' );
	 *
	 * 	// ...
	 * }
	 * ```
	 *
	 * @param key The plugin constructor or {@link module:core/plugin~PluginStaticMembers#pluginName name}.
	 */
	public has( key: PluginConstructor<TContext> | string ): boolean {
		return this._plugins.has( key );
	}

	/**
	 * Initializes a set of plugins and adds them to the collection.
	 *
	 * @param plugins An array of {@link module:core/plugin~PluginInterface plugin constructors}
	 * or {@link module:core/plugin~PluginStaticMembers#pluginName plugin names}.
	 * @param pluginsToRemove Names of the plugins or plugin constructors
	 * that should not be loaded (despite being specified in the `plugins` array).
	 * @param pluginsSubstitutions An array of {@link module:core/plugin~PluginInterface plugin constructors}
	 * that will be used to replace plugins of the same names that were passed in `plugins` or that are in their dependency tree.
	 * A useful option for replacing built-in plugins while creating tests (for mocking their APIs). Plugins that will be replaced
	 * must follow these rules:
	 *   * The new plugin must be a class.
	 *   * The new plugin must be named.
	 *   * Both plugins must not depend on other plugins.
	 * @returns A promise which gets resolved once all plugins are loaded and available in the collection.
	 */
	public init(
		plugins: ReadonlyArray<PluginConstructor<TContext> | string>,
		pluginsToRemove: ReadonlyArray<PluginConstructor<TContext> | string> = [],
		pluginsSubstitutions: ReadonlyArray<PluginConstructor<TContext>> = []
	): Promise<LoadedPlugins> {
		// Plugin initialization procedure consists of 2 main steps:
		// 1) collecting all available plugin constructors,
		// 2) verification whether all required plugins can be instantiated.
		//
		// In the first step, all plugin constructors, available in the provided `plugins` array and inside
		// plugin's dependencies (from the `Plugin.requires` array), are recursively collected and added to the existing
		// `this._availablePlugins` map, but without any verification at the given moment. Performing the verification
		// at this point (during the plugin constructor searching) would cause false errors to occur, that some plugin
		// is missing but in fact it may be defined further in the array as the dependency of other plugin. After
		// traversing the entire dependency tree, it will be checked if all required "top level" plugins are available.
		//
		// In the second step, the list of plugins that have not been explicitly removed is traversed to get all the
		// plugin constructors to be instantiated in the correct order and to validate against some rules. Finally, if
		// no plugin is missing and no other error has been found, they all will be instantiated.
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		const context = this._context;

		findAvailablePluginConstructors( plugins );

		validatePlugins( plugins );

		const pluginsToLoad = plugins.filter( plugin => !isPluginRemoved( plugin, pluginsToRemove ) );

		const pluginConstructors = [ ...getPluginConstructors( pluginsToLoad ) ];

		substitutePlugins( pluginConstructors, pluginsSubstitutions );

		const pluginInstances = loadPlugins( pluginConstructors );

		return initPlugins( pluginInstances, 'init' )
			.then( () => initPlugins( pluginInstances, 'afterInit' ) )
			.then( () => pluginInstances );

		function isPluginConstructor( plugin: PluginConstructor<TContext> | string | null ): plugin is PluginConstructor<TContext> {
			return typeof plugin === 'function';
		}

		function isContextPlugin(
			plugin: PluginConstructor<TContext> | string | null
		): plugin is PluginConstructor<TContext> & { isContextPlugin: true } {
			return isPluginConstructor( plugin ) && !!plugin.isContextPlugin;
		}

		function isPluginRemoved(
			plugin: PluginConstructor<TContext> | string,
			pluginsToRemove: ReadonlyArray<PluginConstructor<TContext> | string>
		) {
			return pluginsToRemove.some( removedPlugin => {
				if ( removedPlugin === plugin ) {
					return true;
				}

				if ( getPluginName( plugin ) === removedPlugin ) {
					return true;
				}

				if ( getPluginName( removedPlugin ) === plugin ) {
					return true;
				}

				return false;
			} );
		}

		function getPluginName( plugin: PluginConstructor<TContext> | string ) {
			return isPluginConstructor( plugin ) ?
				plugin.pluginName || plugin.name :
				plugin;
		}

		function findAvailablePluginConstructors(
			plugins: ReadonlyArray<PluginConstructor<TContext> | string>,
			processed = new Set<PluginConstructor<TContext>>()
		) {
			plugins.forEach( plugin => {
				if ( !isPluginConstructor( plugin ) ) {
					return;
				}

				if ( processed.has( plugin ) ) {
					return;
				}

				processed.add( plugin );

				if ( plugin.pluginName && !that._availablePlugins.has( plugin.pluginName ) ) {
					that._availablePlugins.set( plugin.pluginName, plugin );
				}

				if ( plugin.requires ) {
					findAvailablePluginConstructors( plugin.requires, processed );
				}
			} );
		}

		function getPluginConstructors(
			plugins: ReadonlyArray<PluginConstructor<TContext> | string>,
			processed = new Set<PluginConstructor<TContext>>()
		) {
			return plugins
				.map( plugin => {
					return isPluginConstructor( plugin ) ?
						plugin :
						that._availablePlugins.get( plugin )!;
				} )
				.reduce( ( result, plugin ) => {
					if ( processed.has( plugin ) ) {
						return result;
					}

					processed.add( plugin );

					if ( plugin.requires ) {
						validatePlugins( plugin.requires, plugin );

						getPluginConstructors( plugin.requires, processed ).forEach( plugin => result.add( plugin ) );
					}

					return result.add( plugin );
				}, new Set<PluginConstructor<TContext>>() );
		}

		function validatePlugins(
			plugins: ReadonlyArray<PluginConstructor<TContext> | string>,
			parentPluginConstructor: PluginConstructor<TContext> | null = null
		) {
			plugins
				.map( plugin => {
					return isPluginConstructor( plugin ) ?
						plugin :
						that._availablePlugins.get( plugin ) || plugin;
				} )
				.forEach( plugin => {
					checkMissingPlugin( plugin, parentPluginConstructor );
					checkContextPlugin( plugin, parentPluginConstructor );
					checkRemovedPlugin( plugin, parentPluginConstructor );
				} );
		}

		function checkMissingPlugin(
			plugin: PluginConstructor<TContext> | string,
			parentPluginConstructor: PluginConstructor<TContext> | null
		) {
			if ( isPluginConstructor( plugin ) ) {
				return;
			}

			if ( parentPluginConstructor ) {
				/**
				 * A required "soft" dependency was not found on the plugin list.
				 *
				 * When configuring the editor, either prior to building (via
				 * {@link module:core/editor/editor~Editor.builtinPlugins `Editor.builtinPlugins`}) or when
				 * creating a new instance of the editor (e.g. via
				 * {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`}), you need to provide
				 * some of the dependencies for other plugins that you used.
				 *
				 * This error is thrown when one of these dependencies was not provided. The name of the missing plugin
				 * can be found in `missingPlugin` and the plugin that required it in `requiredBy`.
				 *
				 * In order to resolve it, you need to import the missing plugin and add it to the
				 * current list of plugins (`Editor.builtinPlugins` or `config.plugins`/`config.extraPlugins`).
				 *
				 * Soft requirements were introduced in version 26.0.0. If you happen to stumble upon this error
				 * when upgrading to version 26.0.0, read also the
				 * {@glink updating/guides/update-to-26 Migration to 26.0.0} guide.
				 *
				 * @error plugincollection-soft-required
				 * @param {string} missingPlugin The name of the required plugin.
				 * @param {string} requiredBy The name of the plugin that requires the other plugin.
				 */
				throw new CKEditorError(
					'plugincollection-soft-required',
					context,
					{ missingPlugin: plugin, requiredBy: getPluginName( parentPluginConstructor ) }
				);
			}

			/**
			 * A plugin is not available and could not be loaded.
			 *
			 * Plugin classes (constructors) need to be provided to the editor before they can be loaded by name.
			 * This is usually done in the now deprecated CKEditor 5 builds by setting
			 * the {@link module:core/editor/editor~Editor.builtinPlugins} property.
			 *
			 * **If you see this warning when using one of the deprecated CKEditor 5 Builds**,
			 * it means that you tried to enable a plugin that was not included in that build. This may be due to a typo
			 * in the plugin name or simply because that plugin was not a part of this build.
			 *
			 * **Predefined builds are no longer supported and you need to
			 * {@glink updating/nim-migration/migration-to-new-installation-methods migrate to new installation methods}**.
			 *
			 * **If you see this warning when using one of the editor creators directly** (not a build), then it means
			 * that you tried loading plugins by name. However, unlike CKEditor 4, CKEditor 5 does not implement a "plugin loader".
			 * This means that CKEditor 5 does not know where to load the plugin modules from. Therefore, you need to
			 * provide each plugin through a reference (as a constructor function). Check out the examples in the
			 * {@glink getting-started/installation/cloud/quick-start Quick start} guide.
			 *
			 * @error plugincollection-plugin-not-found
			 * @param {string} plugin The name of the plugin which could not be loaded.
			 */
			throw new CKEditorError(
				'plugincollection-plugin-not-found',
				context,
				{ plugin }
			);
		}

		function checkContextPlugin(
			plugin: PluginConstructor<TContext> | string,
			parentPluginConstructor: PluginConstructor<TContext> | null
		) {
			if ( !isContextPlugin( parentPluginConstructor ) ) {
				return;
			}

			if ( isContextPlugin( plugin ) ) {
				return;
			}

			/**
			 * If a plugin is a context plugin, all plugins it requires should also be context plugins
			 * instead of plugins. In other words, if one plugin can be used in the context,
			 * all its requirements should also be ready to be used in the context. Note that the context
			 * provides only a part of the API provided by the editor. If one plugin needs a full
			 * editor API, all plugins which require it are considered as plugins that need a full
			 * editor API.
			 *
			 * @error plugincollection-context-required
			 * @param {string} plugin The name of the required plugin.
			 * @param {string} requiredBy The name of the parent plugin.
			 */
			throw new CKEditorError(
				'plugincollection-context-required',
				context,
				{ plugin: getPluginName( plugin ), requiredBy: getPluginName( parentPluginConstructor ) }
			);
		}

		function checkRemovedPlugin(
			plugin: PluginConstructor<TContext> | string,
			parentPluginConstructor: PluginConstructor<TContext> | null
		) {
			if ( !parentPluginConstructor ) {
				return;
			}

			if ( !isPluginRemoved( plugin, pluginsToRemove ) ) {
				return;
			}

			/**
			 * Cannot load a plugin because one of its dependencies is listed in the `removePlugins` option.
			 *
			 * @error plugincollection-required
			 * @param {string} plugin The name of the required plugin.
			 * @param {string} requiredBy The name of the parent plugin.
			 */
			throw new CKEditorError(
				'plugincollection-required',
				context,
				{ plugin: getPluginName( plugin ), requiredBy: getPluginName( parentPluginConstructor ) }
			);
		}

		function loadPlugins( pluginConstructors: ReadonlyArray<PluginConstructor<TContext>> ) {
			return pluginConstructors.map( PluginConstructor => {
				let pluginInstance = that._contextPlugins.get( PluginConstructor ) as ( PluginInterface | undefined );

				pluginInstance = pluginInstance || new ( PluginConstructor as PluginClassConstructor<TContext> )( context );

				that._add( PluginConstructor, pluginInstance );

				return pluginInstance;
			} );
		}

		function initPlugins( pluginInstances: ReadonlyArray<PluginInterface>, method: 'init' | 'afterInit' ) {
			return pluginInstances.reduce<Promise<unknown>>( ( promise, plugin ) => {
				if ( !plugin[ method ] ) {
					return promise;
				}

				if ( that._contextPlugins.has( plugin ) ) {
					return promise;
				}

				return promise.then( plugin[ method ]!.bind( plugin ) );
			}, Promise.resolve() );
		}

		/**
		 * Replaces plugin constructors with the specified set of plugins.
		 */
		function substitutePlugins(
			pluginConstructors: Array<PluginConstructor<TContext>>,
			pluginsSubstitutions: ReadonlyArray<PluginConstructor<TContext>>
		) {
			for ( const pluginItem of pluginsSubstitutions ) {
				if ( typeof pluginItem != 'function' ) {
					/**
					 * The plugin replacing an existing plugin must be a function.
					 *
					 * @error plugincollection-replace-plugin-invalid-type
					 * @param {never} pluginItem The plugin item.
					 */
					throw new CKEditorError( 'plugincollection-replace-plugin-invalid-type', null, { pluginItem } );
				}

				const pluginName = pluginItem.pluginName;

				if ( !pluginName ) {
					/**
					 * The plugin replacing an existing plugin must have a name.
					 *
					 * @error plugincollection-replace-plugin-missing-name
					 * @param {module:core/plugin~PluginConstructor} pluginItem The plugin item.
					 */
					throw new CKEditorError( 'plugincollection-replace-plugin-missing-name', null, { pluginItem } );
				}

				if ( pluginItem.requires && pluginItem.requires.length ) {
					/**
					 * The plugin replacing an existing plugin cannot depend on other plugins.
					 *
					 * @error plugincollection-plugin-for-replacing-cannot-have-dependencies
					 * @param {string} pluginName The name of the plugin.
					 */
					throw new CKEditorError( 'plugincollection-plugin-for-replacing-cannot-have-dependencies', null, { pluginName } );
				}

				const pluginToReplace = that._availablePlugins.get( pluginName );

				if ( !pluginToReplace ) {
					/**
					 * The replaced plugin does not exist in the
					 * {@link module:core/plugincollection~PluginCollection available plugins} collection.
					 *
					 * @error plugincollection-plugin-for-replacing-not-exist
					 * @param {string} pluginName The name of the plugin.
					 */
					throw new CKEditorError( 'plugincollection-plugin-for-replacing-not-exist', null, { pluginName } );
				}

				const indexInPluginConstructors = pluginConstructors.indexOf( pluginToReplace );

				if ( indexInPluginConstructors === -1 ) {
					// The Context feature can substitute plugins as well.
					// It may happen that the editor will be created with the given context, where the plugin for substitute
					// was already replaced. In such a case, we don't want to do it again.
					if ( that._contextPlugins.has( pluginToReplace ) ) {
						return;
					}

					/**
					 * The replaced plugin will not be loaded so it cannot be replaced.
					 *
					 * @error plugincollection-plugin-for-replacing-not-loaded
					 * @param {string} pluginName The name of the plugin.
					 */
					throw new CKEditorError( 'plugincollection-plugin-for-replacing-not-loaded', null, { pluginName } );
				}

				if ( pluginToReplace.requires && pluginToReplace.requires.length ) {
					/**
					 * The replaced plugin cannot depend on other plugins.
					 *
					 * @error plugincollection-replaced-plugin-cannot-have-dependencies
					 * @param {string} pluginName The name of the plugin.
					 */
					throw new CKEditorError( 'plugincollection-replaced-plugin-cannot-have-dependencies', null, { pluginName } );
				}

				pluginConstructors.splice( indexInPluginConstructors, 1, pluginItem );
				that._availablePlugins.set( pluginName, pluginItem );
			}
		}
	}

	/**
	 * Destroys all loaded plugins.
	 */
	public destroy(): Promise<unknown> {
		const promises: Array<unknown> = [];

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
	 * @param PluginConstructor The plugin constructor.
	 * @param plugin The instance of the plugin.
	 */
	private _add( PluginConstructor: PluginConstructor<TContext>, plugin: PluginInterface ) {
		this._plugins.set( PluginConstructor, plugin );

		const pluginName = PluginConstructor.pluginName;

		if ( !pluginName ) {
			return;
		}

		if ( this._plugins.has( pluginName ) ) {
			/**
			 * Two plugins with the same {@link module:core/plugin~PluginStaticMembers#pluginName} were loaded.
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
			 * Predefined builds are a deprecated solution and we strongly advise
			 * {@glink updating/nim-migration/migration-to-new-installation-methods migrating to new installation methods}.
			 *
			 * The second option is that your `node_modules/` directory contains duplicated versions of the same
			 * CKEditor 5 packages. Normally, on clean installations, npm deduplicates packages in `node_modules/`, so
			 * it may be enough to call `rm -rf node_modules && npm i`. However, if you installed conflicting versions
			 * of some packages, their dependencies may need to be installed in more than one version which may lead to this
			 * warning.
			 *
			 * Technically speaking, this error occurs because after adding a plugin to an existing editor build
			 * the dependencies of this plugin are being duplicated.
			 * They are already built into that editor build and now get added for the second time as dependencies
			 * of the plugin you are installing.
			 *
			 * @error plugincollection-plugin-name-conflict
			 * @param {string} pluginName The duplicated plugin name.
			 * @param {module:core/plugin~PluginConstructor} plugin1 The first plugin constructor.
			 * @param {module:core/plugin~PluginConstructor} plugin2 The second plugin constructor.
			 */
			throw new CKEditorError(
				'plugincollection-plugin-name-conflict',
				null,
				{ pluginName, plugin1: this._plugins.get( pluginName )!.constructor, plugin2: PluginConstructor }
			);
		}

		this._plugins.set( pluginName, plugin );
	}
}

/**
 * A `[ PluginConstructor, pluginInstance ]` pair.
 */
export type PluginEntry<TContext> = [ PluginConstructor<TContext>, PluginInterface ];

/**
 * Helper type that maps plugin names to their types.
 * It is meant to be extended with module augmentation.
 *
 * ```ts
 * class MyPlugin extends Plugin {
 * 	public static pluginName() {
 * 		return 'MyPlugin' as const;
 * 	}
 * }
 *
 * declare module '@ckeditor/ckeditor5-core' {
 * 	interface PluginsMap {
 * 		[ MyPlugin.pluginName ]: MyPlugin;
 * 	}
 * }
 *
 * // Returns `MyPlugin`.
 * const myPlugin = editor.plugins.get( 'MyPlugin' );
 * ```
 */
export interface PluginsMap {
	[ name: string ]: PluginInterface;
}
