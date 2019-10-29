/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/scope
 */

import Config from '@ckeditor/ckeditor5-utils/src/config';
import PluginCollection from './plugincollection';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

export default class Scope {
	constructor( config ) {
		/**
		 * Holds all configurations specific to this scope instance.
		 *
		 * @readonly
		 * @type {module:utils/config~Config}
		 */
		this.config = new Config( config );

		/**
		 * The plugins loaded and in use by this scope instance.
		 *
		 * @readonly
		 * @type {module:core/plugincollection~PluginCollection}
		 */
		this.plugins = new PluginCollection( this, this.config.get( 'plugins' ) );

		const languageConfig = this.config.get( 'language' ) || {};

		/**
		 * @readonly
		 * @member {module:utils/locale~Locale}
		 */
		this.locale = new Locale( {
			uiLanguage: typeof languageConfig === 'string' ? languageConfig : languageConfig.ui,
			contentLanguage: this.config.get( 'language.content' )
		} );

		/**
		 * List of editors used with this scope.
		 *
		 * @private
		 * @type {Set<module:core/editor/editor~Editor>}
		 */
		this._editors = new Set();
	}

	/**
	 * @param {module:core/editor/editor~Editor} editor
	 */
	addEditor( editor ) {
		this._editors.add( editor );
	}

	/**
	 * @param {module:core/editor/editor~Editor} editor
	 */
	removeEditor( editor ) {
		return this._editors.delete( editor );
	}

	initPlugins() {
		const plugins = this.config.get( 'plugins' );

		for ( const plugin of plugins ) {
			if ( typeof plugin != 'function' ) {
				throw new CKEditorError( 'scope-initplugins: Only constructor is allowed as a Scope plugin' );
			}
		}

		return this.plugins.init( plugins );
	}

	/**
	 * Destroys the scope instance, releasing all resources used by it.
	 *
	 * @returns {Promise} A promise that resolves once the scope instance is fully destroyed.
	 */
	destroy() {
		const promises = [];

		for ( const editor of Array.from( this._editors ) ) {
			editor.scope = null;
			promises.push( editor.destroy() );
		}

		return Promise.all( promises )
			.then( () => this.plugins.destroy() );
	}

	static create( config ) {
		return new Promise( resolve => {
			const scope = new this( config );

			resolve( scope.initPlugins().then( () => scope ) );
		} );
	}
}
