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
 * @TODO
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
		 * When the context is created by an editor then the editor instance is
		 * stored as an owner of this context.
		 *
		 * @readonly
		 * @type {Boolean}
		 */
		this.isCreatedByEditor = false;

		/**
		 * List of editors to which this context instance is injected.
		 *
		 * @private
		 * @type {Set<module:core/editor/editor~Editor>}
		 */
		this._editors = new Set();
	}

	/**
	 * Adds a reference to the editor which is used with this context.
	 *
	 * When the context is created by the editor it is additionally
	 * marked as a {@link ~Context#isCreatedByEditor} what is used
	 * in the destroy chain.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {Boolean} isContextOwner
	 */
	addEditor( editor, isContextOwner ) {
		if ( this.isCreatedByEditor ) {
			/**
			 * Cannot add multiple editors to the context which is created by the editor.
			 *
			 * @error context-addEditor-to-private-context
			 */
			throw new CKEditorError(
				'context-addEditor-to-private-context: Cannot add multiple editors to the context which is created by the editor.'
			);
		}

		this._editors.add( editor );

		if ( isContextOwner ) {
			this.isCreatedByEditor = true;
		}
	}

	/**
	 * Removes a reference to the editor which was used with this context.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 */
	removeEditor( editor ) {
		return this._editors.delete( editor );
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
				throw new CKEditorError(
					'context-initplugins-constructor-only: Only constructor is allowed as a Context plugin.',
					null,
					{ Plugin }
				);
			}

			if ( Plugin.isContextPlugin !== true ) {
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
	 * Returns context configuration which will be copied to editors created using this context.
	 *
	 * The configuration returned by this method has removed plugins configuration - plugins are shared with all editors
	 * in a special way.
	 *
	 * @returns {Object} Configuration as a plain object.
	 */
	getConfigForEditor() {
		const result = {};

		for ( const name of this.config.names() ) {
			if ( ![ 'plugins', 'removePlugins', 'extraPlugins' ].includes( name ) ) {
				result[ name ] = this.config.get( name );
			}
		}

		return result;
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
	 * @TODO
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
