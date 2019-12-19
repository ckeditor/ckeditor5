/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/context
 */

import Config from '@ckeditor/ckeditor5-utils/src/config';
import PluginCollection from './plugincollection';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Provides a common, higher level environment for solutions which use multiple {@link module:core/editor/editor~Editor editors}
 * or/and plugins that work outside of an editor. Use it instead of {@link module:core/editor/editor~Editor.create `Editor.create()`}
 * in advanced application integrations.
 *
 * All configuration options passed to a `Context` will be used as default options for editor instances initialized in that context.
 *
 * {@link module:core/contextplugin~ContextPlugin `ContextPlugin`s} passed to a `Context` instance will be shared among all
 * editor instances initialized in that context. These will be the same plugin instances for all the editors.
 *
 * **Note:** `Context` can only be initialized with {@link module:core/contextplugin~ContextPlugin `ContextPlugin`s}
 * (e.g. {@glink features/collaboration/comments/comments comments}). Regular {@link module:core/plugin~Plugin `Plugin`s} require an
 * editor instance to work and cannot be added to a `Context`.
 *
 * **Note:** You can add `ContextPlugin` to an editor instance, though.
 *
 * If you are using multiple editor instances on one page and use any `ContextPlugin`s, create `Context` to share configuration and plugins
 * among those editors. Some plugins will use the information about all existing editors to better integrate between them.
 *
 * If you are using plugins that do not require an editor to work (e.g. {@glink features/collaboration/comments/comments comments})
 * enable and configure them using `Context`.
 *
 * If you are using only a single editor on each page use {@link module:core/editor/editor~Editor.create `Editor.create()`} instead.
 * In such case, `Context` instance will be created by the editor instance in a transparent way.
 *
 * See {@link module:core/context~Context.create `Context.create()`} for usage examples.
 */
export default class Context {
	/**
	 * Creates a context instance with a given configuration.
	 *
	 * Usually, not to be used directly. See the static {@link module:core/context~Context.create `create()`} method.
	 *
	 * @param {Object} [config={}] The context config.
	 */
	constructor( config ) {
		/**
		 * Holds all configurations specific to this context instance.
		 *
		 * @readonly
		 * @type {module:utils/config~Config}
		 */
		this.config = new Config( config );

		/**
		 * The plugins loaded and in use by this context instance.
		 *
		 * @readonly
		 * @type {module:core/plugincollection~PluginCollection}
		 */
		this.plugins = new PluginCollection( this );

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
		 * List of editors to which this context instance is injected.
		 *
		 * @private
		 * @type {Set<module:core/editor/editor~Editor>}
		 */
		this._editors = new Set();

		/**
		 * Reference to the editor which created the context.
		 * Null when the context was created outside of the editor.
		 *
		 * It is used to destroy the context when removing the editor that created the context.
		 *
		 * @private
		 * @type {module:core/editor/editor~Editor|null}
		 */
		this._contextOwner = null;
	}

	/**
	 * Loads and initializes plugins specified in the config.
	 *
	 * @returns {Promise.<module:core/plugin~LoadedPlugins>} A promise which resolves
	 * once the initialization is completed providing an array of loaded plugins.
	 */
	initPlugins() {
		const plugins = this.config.get( 'plugins' ) || [];

		for ( const Plugin of plugins ) {
			if ( typeof Plugin != 'function' ) {
				/**
				 * Only constructor is allowed as a Context plugin.
				 *
				 * @error context-initplugins-constructor-only
				 */
				throw new CKEditorError(
					'context-initplugins-constructor-only: Only constructor is allowed as a Context plugin.',
					null,
					{ Plugin }
				);
			}

			if ( Plugin.isContextPlugin !== true ) {
				/**
				 * Only plugin marked as a ContextPlugin is allowed to be used with a context.
				 *
				 * @error context-initplugins-invalid-plugin
				 */
				throw new CKEditorError(
					'context-initplugins-invalid-plugin: Only plugin marked as a ContextPlugin is allowed.',
					null,
					{ Plugin }
				);
			}
		}

		return this.plugins.init( plugins );
	}

	/**
	 * Destroys the context instance, releasing all resources used by it.
	 *
	 * @returns {Promise} A promise that resolves once the context instance is fully destroyed.
	 */
	destroy() {
		return Promise.all( Array.from( this._editors, editor => editor.destroy() ) )
			.then( () => this.plugins.destroy() );
	}

	/**
	 * Adds a reference to the editor which is used with this context.
	 *
	 * When the given editor has created the context then the reference to this editor will be stored
	 * as a {@link ~Context#_contextOwner}.
	 *
	 * This method should be used only by the editor.
	 *
	 * @protected
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {Boolean} isContextOwner
	 */
	_addEditor( editor, isContextOwner ) {
		if ( this._contextOwner ) {
			/**
			 * Cannot add multiple editors to the context which is created by the editor.
			 *
			 * @error context-addEditor-private-context
			 */
			throw new CKEditorError(
				'context-addEditor-private-context: Cannot add multiple editors to the context which is created by the editor.'
			);
		}

		this._editors.add( editor );

		if ( isContextOwner ) {
			this._contextOwner = editor;
		}
	}

	/**
	 * Removes a reference to the editor which was used with this context.
	 * When the context was created by the given editor then the context will be destroyed.
	 *
	 * This method should be used only by the editor.
	 *
	 * @protected
	 * @param {module:core/editor/editor~Editor} editor
	 * @return {Promise} A promise that resolves once the editor is removed from the context or when the context has been destroyed.
	 */
	_removeEditor( editor ) {
		this._editors.delete( editor );

		if ( this._contextOwner === editor ) {
			return this.destroy();
		}

		return Promise.resolve();
	}

	/**
	 * Returns context configuration which will be copied to editors created using this context.
	 *
	 * The configuration returned by this method has removed plugins configuration - plugins are shared with all editors
	 * through another mechanism.
	 *
	 * This method should be used only by the editor.
	 *
	 * @protected
	 * @returns {Object} Configuration as a plain object.
	 */
	_getConfigForEditor() {
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
	 *		const editorPlugins = [ ... ]; // Regular `Plugin`s here.
	 *
	 *		const context = await Context.create( {
	 *			// Only `ContextPlugin`s here.
	 *			plugins: [ ... ],
	 *
	 *			// Configure language for all the editors (it cannot be overwritten).
	 *			language: { ... },
	 *
	 *			// Configuration for context plugins.
	 *			comments: { ... },
	 *			...
	 *
	 *			// Default configuration for editor plugins.
	 *			toolbar: { ... },
	 *			image: { ... },
	 *			...
	 *		} );
	 *
	 *		const editor1 = await ClassicEditor.create(
	 *			document.getElementById( 'editor1' ),
	 *			{
	 *				editorPlugins,
	 *				context
	 *			}
	 *		);
	 *
	 *		const editor2 = await ClassicEditor.create(
	 *			document.getElementById( 'editor2' ),
	 *			{
	 *				editorPlugins,
	 *				context,
	 *				toolbar: { ... } // You can overwrite context's configuration.
	 *			}
	 *		);
	 *
	 * @param {Object} [config] The context config.
	 * @returns {Promise} A promise resolved once the context is ready. The promise resolves with the created context instance.
	 */
	static create( config ) {
		return new Promise( resolve => {
			const context = new this( config );

			resolve( context.initPlugins().then( () => context ) );
		} );
	}
}
