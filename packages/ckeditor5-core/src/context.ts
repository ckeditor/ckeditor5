/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/context
 */

import {
	Config,
	Collection,
	CKEditorError,
	Locale,
	type LocaleTranslate
} from '@ckeditor/ckeditor5-utils';

import PluginCollection from './plugincollection.js';
import type Editor from './editor/editor.js';
import type { LoadedPlugins, PluginConstructor } from './plugin.js';
import type { EditorConfig } from './editor/editorconfig.js';

/**
 * Provides a common, higher-level environment for solutions that use multiple {@link module:core/editor/editor~Editor editors}
 * or plugins that work outside the editor. Use it instead of {@link module:core/editor/editor~Editor.create `Editor.create()`}
 * in advanced application integrations.
 *
 * All configuration options passed to a context will be used as default options for the editor instances initialized in that context.
 *
 * {@link module:core/contextplugin~ContextPlugin Context plugins} passed to a context instance will be shared among all
 * editor instances initialized in this context. These will be the same plugin instances for all the editors.
 *
 * **Note:** The context can only be initialized with {@link module:core/contextplugin~ContextPlugin context plugins}
 * (e.g. [comments](https://ckeditor.com/collaboration/comments/)). Regular {@link module:core/plugin~Plugin plugins} require an
 * editor instance to work and cannot be added to a context.
 *
 * **Note:** You can add a context plugin to an editor instance, though.
 *
 * If you are using multiple editor instances on one page and use any context plugins, create a context to share the configuration and
 * plugins among these editors. Some plugins will use the information about all existing editors to better integrate between them.
 *
 * If you are using plugins that do not require an editor to work (e.g. [comments](https://ckeditor.com/collaboration/comments/)),
 * enable and configure them using the context.
 *
 * If you are using only a single editor on each page, use {@link module:core/editor/editor~Editor.create `Editor.create()`} instead.
 * In such a case, a context instance will be created by the editor instance in a transparent way.
 *
 * See {@link ~Context.create `Context.create()`} for usage examples.
 */
export default class Context {
	/**
	 * Stores all the configurations specific to this context instance.
	 */
	public readonly config: Config<ContextConfig>;

	/**
	 * The plugins loaded and in use by this context instance.
	 */
	public readonly plugins: PluginCollection<Context | Editor>;

	public readonly locale: Locale;

	/**
	 * Shorthand for {@link module:utils/locale~Locale#t}.
	 */
	public readonly t: LocaleTranslate;

	/**
	 * A list of editors that this context instance is injected to.
	 */
	public readonly editors: Collection<Editor>;

	/**
	 * The default configuration which is built into the `Context` class.
	 *
	 * It was used in the now deprecated CKEditor 5 builds featuring `Context` to provide the default configuration options
	 * which are later used during the context initialization.
	 *
	 * ```ts
	 * Context.defaultConfig = {
	 * 	foo: 1,
	 * 	bar: 2
	 * };
	 *
	 * Context
	 * 	.create()
	 * 	.then( context => {
	 * 		context.config.get( 'foo' ); // -> 1
	 * 		context.config.get( 'bar' ); // -> 2
	 * 	} );
	 *
	 * // The default options can be overridden by the configuration passed to create().
	 * Context
	 * 	.create( { bar: 3 } )
	 * 	.then( context => {
	 * 		context.config.get( 'foo' ); // -> 1
	 * 		context.config.get( 'bar' ); // -> 3
	 * 	} );
	 * ```
	 *
	 * See also {@link module:core/context~Context.builtinPlugins `Context.builtinPlugins`}
	 * and {@link module:core/editor/editor~Editor.defaultConfig `Editor.defaultConfig`}.
	 */
	public static defaultConfig: ContextConfig;

	/**
	 * An array of plugins built into the `Context` class.
	 *
	 * It was used in the now deprecated CKEditor 5 builds featuring `Context` to provide the default configuration options
	 * which are later used during the context initialization.
	 *
	 * They will be automatically initialized by `Context` unless `config.plugins` is passed.
	 *
	 * ```ts
	 * // Build some context plugins into the Context class first.
	 * Context.builtinPlugins = [ FooPlugin, BarPlugin ];
	 *
	 * // Normally, you need to define config.plugins, but since Context.builtinPlugins was
	 * // defined, now you can call create() without any configuration.
	 * Context
	 * 	.create()
	 * 	.then( context => {
	 * 		context.plugins.get( FooPlugin ); // -> An instance of the Foo plugin.
	 * 		context.plugins.get( BarPlugin ); // -> An instance of the Bar plugin.
	 * 	} );
	 * ```
	 *
	 * See also {@link module:core/context~Context.defaultConfig `Context.defaultConfig`}
	 * and {@link module:core/editor/editor~Editor.builtinPlugins `Editor.builtinPlugins`}.
	 */
	public static builtinPlugins: Array<PluginConstructor<Context | Editor>>;

	/**
	 * Reference to the editor which created the context.
	 * Null when the context was created outside of the editor.
	 *
	 * It is used to destroy the context when removing the editor that has created the context.
	 */
	private _contextOwner: Editor | null = null;

	/**
	 * Creates a context instance with a given configuration.
	 *
	 * Usually not to be used directly. See the static {@link module:core/context~Context.create `create()`} method.
	 *
	 * @param config The context configuration.
	 */
	constructor( config?: ContextConfig ) {
		// We don't pass translations to the config, because its behavior of splitting keys
		// with dots (e.g. `resize.width` => `resize: { width }`) breaks the translations.
		const { translations, ...rest } = config || {};

		this.config = new Config<ContextConfig>( rest, ( this.constructor as typeof Context ).defaultConfig );

		const availablePlugins = ( this.constructor as typeof Context ).builtinPlugins;

		this.config.define( 'plugins', availablePlugins );

		this.plugins = new PluginCollection<Context | Editor>( this, availablePlugins );

		const languageConfig = this.config.get( 'language' ) || {};

		this.locale = new Locale( {
			uiLanguage: typeof languageConfig === 'string' ? languageConfig : languageConfig.ui,
			contentLanguage: this.config.get( 'language.content' ),
			translations
		} );

		this.t = this.locale.t;

		this.editors = new Collection<Editor>();
	}

	/**
	 * Loads and initializes plugins specified in the configuration.
	 *
	 * @returns A promise which resolves once the initialization is completed, providing an array of loaded plugins.
	 */
	public initPlugins(): Promise<LoadedPlugins> {
		const plugins = this.config.get( 'plugins' ) || [];
		const substitutePlugins = this.config.get( 'substitutePlugins' ) || [];

		// Plugins for substitution should be checked as well.
		for ( const Plugin of plugins.concat( substitutePlugins ) ) {
			if ( typeof Plugin != 'function' ) {
				/**
				 * Only a constructor function is allowed as a {@link module:core/contextplugin~ContextPlugin context plugin}.
				 *
				 * @error context-initplugins-constructor-only
				 */
				throw new CKEditorError(
					'context-initplugins-constructor-only',
					null,
					{ Plugin }
				);
			}

			if ( Plugin.isContextPlugin !== true ) {
				/**
				 * Only a plugin marked as a {@link module:core/contextplugin~ContextPlugin.isContextPlugin context plugin}
				 * is allowed to be used with a context.
				 *
				 * @error context-initplugins-invalid-plugin
				 */
				throw new CKEditorError(
					'context-initplugins-invalid-plugin',
					null,
					{ Plugin }
				);
			}
		}

		return this.plugins.init( plugins, [], substitutePlugins );
	}

	/**
	 * Destroys the context instance and all editors used with the context,
	 * releasing all resources used by the context.
	 *
	 * @returns A promise that resolves once the context instance is fully destroyed.
	 */
	public destroy(): Promise<unknown> {
		return Promise.all( Array.from( this.editors, editor => editor.destroy() ) )
			.then( () => this.plugins.destroy() );
	}

	/**
	 * Adds a reference to the editor which is used with this context.
	 *
	 * When the given editor has created the context, the reference to this editor will be stored
	 * as a {@link ~Context#_contextOwner}.
	 *
	 * This method should only be used by the editor.
	 *
	 * @internal
	 * @param isContextOwner Stores the given editor as a context owner.
	 */
	public _addEditor( editor: Editor, isContextOwner: boolean ): void {
		if ( this._contextOwner ) {
			/**
			 * Cannot add multiple editors to the context which is created by the editor.
			 *
			 * @error context-addeditor-private-context
			 */
			throw new CKEditorError( 'context-addeditor-private-context' );
		}

		this.editors.add( editor );

		if ( isContextOwner ) {
			this._contextOwner = editor;
		}
	}

	/**
	 * Removes a reference to the editor which was used with this context.
	 * When the context was created by the given editor, the context will be destroyed.
	 *
	 * This method should only be used by the editor.
	 *
	 * @internal
	 * @return A promise that resolves once the editor is removed from the context or when the context was destroyed.
	 */
	public _removeEditor( editor: Editor ): Promise<unknown> {
		if ( this.editors.has( editor ) ) {
			this.editors.remove( editor );
		}

		if ( this._contextOwner === editor ) {
			return this.destroy();
		}

		return Promise.resolve();
	}

	/**
	 * Returns the context configuration which will be copied to the editors created using this context.
	 *
	 * The configuration returned by this method has the plugins configuration removed &ndash; plugins are shared with all editors
	 * through another mechanism.
	 *
	 * This method should only be used by the editor.
	 *
	 * @internal
	 * @returns Configuration as a plain object.
	 */
	public _getEditorConfig(): Partial<EditorConfig> {
		const result: Record<string, unknown> = {};

		for ( const name of this.config.names() ) {
			if ( ![ 'plugins', 'removePlugins', 'extraPlugins' ].includes( name ) ) {
				result[ name ] = this.config.get( name );
			}
		}

		return result;
	}

	/**
	 * Creates and initializes a new context instance.
	 *
	 * ```ts
	 * const commonConfig = { ... }; // Configuration for all the plugins and editors.
	 * const editorPlugins = [ ... ]; // Regular plugins here.
	 *
	 * Context
	 * 	.create( {
	 * 		// Only context plugins here.
	 * 		plugins: [ ... ],
	 *
	 * 		// Configure the language for all the editors (it cannot be overwritten).
	 * 		language: { ... },
	 *
	 * 		// Configuration for context plugins.
	 * 		comments: { ... },
	 * 		...
	 *
	 * 		// Default configuration for editor plugins.
	 * 		toolbar: { ... },
	 * 		image: { ... },
	 * 		...
	 * 	} )
	 * 	.then( context => {
	 * 		const promises = [];
	 *
	 * 		promises.push( ClassicEditor.create(
	 * 			document.getElementById( 'editor1' ),
	 * 			{
	 * 				editorPlugins,
	 * 				context
	 * 			}
	 * 		) );
	 *
	 * 		promises.push( ClassicEditor.create(
	 * 			document.getElementById( 'editor2' ),
	 * 			{
	 * 				editorPlugins,
	 * 				context,
	 * 				toolbar: { ... } // You can overwrite the configuration of the context.
	 * 			}
	 * 		) );
	 *
	 * 		return Promise.all( promises );
	 * 	} );
	 * ```
	 *
	 * @param config The context configuration.
	 * @returns A promise resolved once the context is ready. The promise resolves with the created context instance.
	 */
	public static create( config?: ContextConfig ): Promise<Context> {
		return new Promise( resolve => {
			const context = new this( config );

			resolve( context.initPlugins().then( () => context ) );
		} );
	}
}

/**
 * The context configuration.
 */
export type ContextConfig = {
	plugins?: Array<PluginConstructor<Context | Editor>>;
	substitutePlugins?: Array<PluginConstructor<Context | Editor>>;
} & Omit<EditorConfig, 'plugins' | 'substitutePlugins' | 'removePlugins' | 'extraPlugins'>;
