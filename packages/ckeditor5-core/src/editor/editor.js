/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/editor/editor
 */

import EmitterMixin from 'ckeditor5-utils/src/emittermixin';
import Config from 'ckeditor5-utils/src/config';
import PluginCollection from '../plugincollection';
import Locale from 'ckeditor5-utils/src/locale';
import DataController from 'ckeditor5-engine/src/controller/datacontroller';
import Document from 'ckeditor5-engine/src/model/document';

import CKEditorError from 'ckeditor5-utils/src/ckeditorerror';
import mix from 'ckeditor5-utils/src/mix';

/**
 * Class representing a basic editor. It contains a base architecture, without much additional logic.
 *
 * See also {@link module:core/editor/standardeditor~StandardEditor}.
 *
 * @mixes module:utils/emittermixin~EmitterMixin
 */
export default class Editor {
	/**
	 * Creates a new instance of the Editor class.
	 *
	 * @param {Object} config The editor config.
	 */
	constructor( config ) {
		/**
		 * Holds all configurations specific to this editor instance.
		 *
		 * @readonly
		 * @member {utils.Config}
		 */
		this.config = new Config( config );

		/**
		 * The plugins loaded and in use by this editor instance.
		 *
		 * @readonly
		 * @member {module:core/plugin~PluginCollection}
		 */
		this.plugins = new PluginCollection( this );

		/**
		 * Commands registered to the editor.
		 *
		 * @readonly
		 * @member {Map.<module:core/command/command~Command>}
		 */
		this.commands = new Map();

		/**
		 * @readonly
		 * @member {module:utils/locale~Locale}
		 */
		this.locale = new Locale( this.config.get( 'lang' ) );

		/**
		 * Shorthand for {@link module:utils/locale~Locale#t}.
		 *
		 * @see module:utils/locale~Locale#t
		 * @method #t
		 */
		this.t = this.locale.t;

		/**
		 * Tree Model document managed by this editor.
		 *
		 * @readonly
		 * @member {module:engine/model/document~Document}
		 */
		this.document = new Document();

		/**
		 * Instance of the {@link module:engine/controller/datacontroller~DataController data controller}.
		 *
		 * @readonly
		 * @member {module:engine/controller/datacontroller~DataController}
		 */
		this.data = new DataController( this.document );

		/**
		 * Instance of the {@link module:engine/controller/editingcontroller~EditingController editing controller}.
		 *
		 * This property is set by more specialized editor classes (such as {@link module:core/editor/standardeditor~StandardEditor}),
		 * however, it's required for features to work as their engine-related parts will try to connect converters.
		 *
		 * When defining a virtual editor class, like one working in Node.js, it's possible to plug a virtual
		 * editing controller which only instantiates necessary properties, but without any observers and listeners.
		 *
		 * @readonly
		 * @member {module:engine/controller/editingcontroller~EditingController} #editing
		 */
	}

	/**
	 * Loads and initializes plugins specified in the config.
	 *
	 * @returns {Promise} A promise which resolves once the initialization is completed.
	 */
	initPlugins() {
		const that = this;
		const config = this.config;

		return loadPlugins()
			.then( ( loadedPlugins ) => {
				return initPlugins( loadedPlugins, 'init' )
					.then( () => initPlugins( loadedPlugins, 'afterInit' ) );
			} )
			.then( () => this.fire( 'pluginsReady' ) );

		function loadPlugins() {
			return that.plugins.load( config.get( 'plugins' ) || [] );
		}

		function initPlugins( loadedPlugins, method ) {
			return loadedPlugins.reduce( ( promise, plugin ) => {
				return promise.then( plugin[ method ].bind( plugin ) );
			}, Promise.resolve() );
		}
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * @fires module:core/editor/editor~Editor#destroy
	 * @returns {Promise} A promise that resolves once the editor instance is fully destroyed.
	 */
	destroy() {
		this.fire( 'destroy' );
		this.stopListening();

		return Promise.resolve()
			.then( () => {
				this.document.destroy();
				this.data.destroy();
			} );
	}

	/**
	 * Executes specified command with given parameter.
	 *
	 * @param {String} commandName Name of command to execute.
	 * @param {*} [commandParam] If set, command will be executed with this parameter.
	 */
	execute( commandName, commandParam ) {
		let command = this.commands.get( commandName );

		if ( !command ) {
			/**
			 * Specified command has not been added to the editor.
			 *
			 * @error editor-command-not-found
			 */
			throw new CKEditorError( 'editor-command-not-found: Specified command has not been added to the editor.' );
		}

		command._execute( commandParam );
	}

	/**
	 * Creates a basic editor instance.
	 *
	 * @param {Object} config See {@link module:core/editor/editor~Editor}'s param.
	 * @returns {Promise} Promise resolved once editor is ready.
	 * @returns {module:core/editor/editor~Editor} return.editor The editor instance.
	 */
	static create( config ) {
		return new Promise( ( resolve ) => {
			const editor = new this( config );

			resolve(
				editor.initPlugins()
					.then( () => {
						editor.fire( 'dataReady' );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}

mix( Editor, EmitterMixin );

/**
 * Fired after {@link #initPlugins plugins are initialized}.
 *
 * @event pluginsReady
 */

/**
 * Fired when the editor UI is ready. This event won't be fired if the editor has no UI.
 *
 * @event uiReady
 */

/**
 * Fired when the data loaded to the editor is ready. If a specific editor doesn't load
 * any data initially, this event will be fired right before {@link #event:ready}.
 *
 * @event dataReady
 */

/**
 * Fired when {@link #event:pluginsReady plugins}, {@link #event:uiReady UI} and {@link #event:dataReady data} and all additional
 * editor components are ready.
 *
 * @event ready
 */

/**
 * Fired when this editor instance is destroyed. The editor at this point is not usable and this event should be used to
 * perform the clean-up in any plugin.
 *
 * @event destroy
 */
