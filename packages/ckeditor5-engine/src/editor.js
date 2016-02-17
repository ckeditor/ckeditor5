/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ObservableMixin from './observablemixin.js';
import EditorConfig from './editorconfig.js';
import PluginCollection from './plugincollection.js';
import CKEditorError from './ckeditorerror.js';
import isArray from './lib/lodash/isArray.js';
import utils from './utils.js';

/**
 * Represents a single editor instance.
 *
 * @class core.Editor
 * @mixins core.ObservableMixin
 */

export default class Editor {
	/**
	 * Creates a new instance of the Editor class.
	 *
	 * This constructor should be rarely used. When creating new editor instance use instead the
	 * {@link CKEDITOR#create CKEDITOR.create() method}.
	 *
	 * @param {HTMLElement} element The DOM element that will be the source for the created editor.
	 * @constructor
	 */
	constructor( element, config ) {
		/**
		 * The original host page element upon which the editor is created. It is only supposed to be provided on
		 * editor creation and is not subject to be modified.
		 *
		 * @readonly
		 * @type {HTMLElement}
		 */
		this.element = element;

		/**
		 * Holds all configurations specific to this editor instance.
		 *
		 * This instance of the {@link Config} class is customized so its {@link Config#get} method will retrieve
		 * global configurations available in {@link CKEDITOR.config} if configurations are not found in the
		 * instance itself.
		 *
		 * @readonly
		 * @type {Config}
		 */
		this.config = new EditorConfig( config );

		/**
		 * The plugins loaded and in use by this editor instance.
		 *
		 * @readonly
		 * @type {PluginCollection}
		 */
		this.plugins = new PluginCollection( this );

		/**
		 * The chosen creator.
		 *
		 * @protected
		 * @type {Creator}
		 */
	}

	/**
	 * Initializes the editor instance object after its creation.
	 *
	 * The initialization consists of the following procedures:
	 *
	 * * Loading and initializing the configured features and creator.
	 * * Firing the editor creator.
	 *
	 * This method should be rarely used as {@link CKEDITOR#create} calls it one should never use the `Editor`
	 * constructor directly.
	 *
	 * @returns {Promise} A promise which resolves once the initialization is completed.
	 */
	init() {
		const that = this;
		const config = this.config;
		let creatorName = config.creator;

		if ( !creatorName ) {
			/**
			 * The `config.creator` option was not defined.
			 *
			 * @error editor-undefined-creator
			 */
			return Promise.reject(
				new CKEditorError( 'editor-undefined-creator: The config.creator option was not defined.' )
			);
		}

		return loadPlugins()
			.then( initPlugins )
			.then( fireCreator );

		function loadPlugins() {
			let plugins = config.features || [];

			// Handle features passed as a string.
			if ( !isArray( plugins ) ) {
				plugins = plugins.split( ',' );
			}

			plugins.push( creatorName );

			return that.plugins.load( plugins );
		}

		function initPlugins( loadedPlugins ) {
			return loadedPlugins.reduce( ( promise, plugin ) => {
				return promise.then( plugin.init.bind( plugin ) );
			}, Promise.resolve() );
		}

		function fireCreator() {
			// We can always get the creator by its name because config.creator (which is requried) is passed
			// to PluginCollection.load().
			that._creator = that.plugins.get( creatorName );

			// Finally fire the creator. It may be asynchronous, returning a promise.
			return that._creator.create();
		}
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it. If the editor replaced an element, the
	 * element will be recovered.
	 *
	 * @fires destroy
	 * @returns {Promise} A promise that resolves once the editor instance is fully destroyed.
	 */
	destroy() {
		const that = this;

		this.fire( 'destroy' );
		this.stopListening();

		return Promise.resolve()
			.then( () => {
				return that._creator && that._creator.destroy();
			} )
			.then( () => {
				delete this.element;
			} );
	}

	setData( data ) {
		this.editable.setData( data );
	}

	getData() {
		return this.editable.getData();
	}
}

utils.mix( Editor, ObservableMixin );

/**
 * Fired when this editor instance is destroyed. The editor at this point is not usable and this event should be used to
 * perform the clean-up in any plugin.
 *
 * @event destroy
 */

/**
 * @cfg {String[]} features
 */

/**
 * @cfg {String} creator
 */
