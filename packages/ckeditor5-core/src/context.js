/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/context
 */

import Config from '@ckeditor/ckeditor5-utils/src/config';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import PluginCollection from './plugincollection';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Provides a common, higher-level environment for solutions that use multiple {@link module:core/editor/editor~Editor editors}
 * or plugins that work outside the editor. Use it instead of {@link module:core/editor/editor~Editor.create `Editor.create()`}
 * in advanced application integrations.
 *
 * All configuration options passed to a context will be used as default options for editor instances initialized in that context.
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
 * In such case, a context instance will be created by the editor instance in a transparent way.
 *
 * See {@link module:core/context~Context.create `Context.create()`} for usage examples.
 */
export default class Context {
	/**
	 * Creates a context instance with a given configuration.
	 *
	 * Usually not to be used directly. See the static {@link module:core/context~Context.create `create()`} method.
	 *
	 * @param {Object} [config={}] The context configuration.
	 */
	constructor( config ) {
		/**
		 * Stores all the configurations specific to this context instance.
		 *
		 * @readonly
		 * @type {module:utils/config~Config}
		 */
		this.config = new Config( config, this.constructor.defaultConfig );

		const availablePlugins = this.constructor.builtinPlugins;

		this.config.define( 'plugins', availablePlugins );

		/**
		 * The plugins loaded and in use by this context instance.
		 *
		 * @readonly
		 * @type {module:core/plugincollection~PluginCollection}
		 */
		this.plugins = new PluginCollection( this, availablePlugins );

		const languageConfig = this.config.get( 'language' ) || {};

		/**
		 * @readonly
		 * @type {module:utils/locale~Locale}
		 */
		this.locale = new Locale( {
			uiLanguage: typeof languageConfig === 'string' ? languageConfig : languageConfig.ui,
			contentLanguage: this.config.get( 'language.content' )
		} );

		/**
		 * Shorthand for {@link module:utils/locale~Locale#t}.
		 *
		 * @see module:utils/locale~Locale#t
		 * @method #t
		 */
		this.t = this.locale.t;

		/**
		 * A list of editors that this context instance is injected to.
		 *
		 * @readonly
		 * @type {module:utils/collection~Collection}
		 */
		this.editors = new Collection();

		/**
		 * Reference to the editor which created the context.
		 * Null when the context was created outside of the editor.
		 *
		 * It is used to destroy the context when removing the editor that has created the context.
		 *
		 * @private
		 * @type {module:core/editor/editor~Editor|null}
		 */
		this._contextOwner = null;
	}

	/**
	 * Loads and initializes plugins specified in the configuration.
	 *
	 * @returns {Promise.<module:core/plugin~LoadedPlugins>} A promise which resolves
	 * once the initialization is completed, providing an array of loaded plugins.
	 */
	initPlugins() {
		const plugins = this.config.get( 'plugins' ) || [];

		for ( const Plugin of plugins ) {
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

		return this.plugins.init( plugins );
	}

	/**
	 * Destroys the context instance and all editors used with the context,
	 * releasing all resources used by the context.
	 *
	 * @returns {Promise} A promise that resolves once the context instance is fully destroyed.
	 */
	destroy() {
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
	 * @protected
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {Boolean} isContextOwner Stores the given editor as a context owner.
	 */
	_addEditor( editor, isContextOwner ) {
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
	 * @protected
	 * @param {module:core/editor/editor~Editor} editor
	 * @return {Promise} A promise that resolves once the editor is removed from the context or when the context was destroyed.
	 */
	_removeEditor( editor ) {
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
	 * The configuration returned by this method has the plugins configuration removed &mdash; plugins are shared with all editors
	 * through another mechanism.
	 *
	 * This method should only be used by the editor.
	 *
	 * @protected
	 * @returns {Object} Configuration as a plain object.
	 */
	_getEditorConfig() {
		const result = {};

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
	 *		const commonConfig = { ... }; // Configuration for all the plugins and editors.
	 *		const editorPlugins = [ ... ]; // Regular plugins here.
	 *
	 *		Context
	 *			.create( {
	 *				// Only context plugins here.
	 *				plugins: [ ... ],
	 *
	 *				// Configure the language for all the editors (it cannot be overwritten).
	 *				language: { ... },
	 *
	 *				// Configuration for context plugins.
	 *				comments: { ... },
	 *				...
	 *
	 *				// Default configuration for editor plugins.
	 *				toolbar: { ... },
	 *				image: { ... },
	 *				...
	 *			} )
	 *			.then( context => {
	 *				const promises = [];
	 *
	 *				promises.push( ClassicEditor.create(
	 *					document.getElementById( 'editor1' ),
	 *					{
	 *						editorPlugins,
	 *						context
	 *					}
	 *				) );
	 *
	 *				promises.push( ClassicEditor.create(
	 *					document.getElementById( 'editor2' ),
	 *					{
	 *						editorPlugins,
	 *						context,
	 *						toolbar: { ... } // You can overwrite the configuration of the context.
	 *					}
	 *				) );
	 *
	 *				return Promise.all( promises );
	 *			} );
	 *
	 * @param {Object} [config] The context configuration.
	 * @returns {Promise} A promise resolved once the context is ready. The promise resolves with the created context instance.
	 */
	static create( config ) {
		return new Promise( resolve => {
			const context = new this( config );

			resolve( context.initPlugins().then( () => context ) );
		} );
	}
}

/**
 * An array of plugins built into the `Context` class.
 *
 * It is used in CKEditor 5 builds featuring `Context` to provide a list of context plugins which are later automatically initialized
 * during the context initialization.
 *
 * They will be automatically initialized by `Context` unless `config.plugins` is passed.
 *
 *		// Build some context plugins into the Context class first.
 *		Context.builtinPlugins = [ FooPlugin, BarPlugin ];
 *
 *		// Normally, you need to define config.plugins, but since Context.builtinPlugins was
 *		// defined, now you can call create() without any configuration.
 *		Context
 *			.create()
 *			.then( context => {
 *				context.plugins.get( FooPlugin ); // -> An instance of the Foo plugin.
 *				context.plugins.get( BarPlugin ); // -> An instance of the Bar plugin.
 *			} );
 *
 * See also {@link module:core/context~Context.defaultConfig `Context.defaultConfig`}
 * and {@link module:core/editor/editor~Editor.builtinPlugins `Editor.builtinPlugins`}.
 *
 * @static
 * @member {Array.<Function>} module:core/context~Context.builtinPlugins
 */

/**
 * The default configuration which is built into the `Context` class.
 *
 * It is used in CKEditor 5 builds featuring `Context` to provide the default configuration options which are later used during the
 * context initialization.
 *
 *		Context.defaultConfig = {
 *			foo: 1,
 *			bar: 2
 *		};
 *
 *		Context
 *			.create()
 *			.then( context => {
 *				context.config.get( 'foo' ); // -> 1
 *				context.config.get( 'bar' ); // -> 2
 *			} );
 *
 *		// The default options can be overridden by the configuration passed to create().
 *		Context
 *			.create( { bar: 3 } )
 *			.then( context => {
 *				context.config.get( 'foo' ); // -> 1
 *				context.config.get( 'bar' ); // -> 3
 *			} );
 *
 * See also {@link module:core/context~Context.builtinPlugins `Context.builtinPlugins`}
 * and {@link module:core/editor/editor~Editor.defaultConfig `Editor.defaultConfig`}.
 *
 * @static
 * @member {Object} module:core/context~Context.defaultConfig
 */
