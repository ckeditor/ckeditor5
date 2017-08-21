/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/editor/editor
 */

import Config from '@ckeditor/ckeditor5-utils/src/config';
import PluginCollection from '../plugincollection';
import CommandCollection from '../commandcollection';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import DataController from '@ckeditor/ckeditor5-engine/src/controller/datacontroller';
import Document from '@ckeditor/ckeditor5-engine/src/model/document';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Class representing a basic editor. It contains a base architecture, without much additional logic.
 *
 * See also {@link module:core/editor/standardeditor~StandardEditor}.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class Editor {
	/**
	 * Creates a new instance of the Editor class.
	 *
	 * @param {Object} config The editor config.
	 */
	constructor( config ) {
		const availablePlugins = this.constructor.build && this.constructor.build.plugins;

		/**
		 * Holds all configurations specific to this editor instance.
		 *
		 * @readonly
		 * @member {module:utils/config~Config}
		 */
		this.config = new Config( config, this.constructor.build && this.constructor.build.config );

		this.config.define( 'plugins', availablePlugins );

		/**
		 * The plugins loaded and in use by this editor instance.
		 *
		 * @readonly
		 * @member {module:core/plugin~PluginCollection}
		 */
		this.plugins = new PluginCollection( this, availablePlugins );

		/**
		 * Commands registered to the editor.
		 *
		 * @readonly
		 * @member {module:core/commandcollection~CommandCollection}
		 */
		this.commands = new CommandCollection();

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
		 * The editor's model document.
		 *
		 * The center of the editor's abstract data model. The document contains
		 * {@link module:engine/model/document~Document#getRoot all editing roots},
		 * {@link module:engine/model/document~Document#selection} and allows
		 * applying changes to through the {@link module:engine/model/document~Document#batch batch interface}.
		 *
		 * Besides the model document, the editor usually contains two controllers –
		 * {@link #data data controller} and {@link #editing editing controller}.
		 * The former is used e.g. when setting or retrieving editor data and contains a useful
		 * set of methods for operating on the content. The latter controls user input and rendering
		 * the content for editing.
		 *
		 * @readonly
		 * @member {module:engine/model/document~Document}
		 */
		this.document = new Document();

		/**
		 * The {@link module:engine/controller/datacontroller~DataController data controller}.
		 *
		 * @readonly
		 * @member {module:engine/controller/datacontroller~DataController}
		 */
		this.data = new DataController( this.document );

		/**
		 * Defines whether this editor is in read-only mode.
		 *
		 * In read-only mode the editor {@link #commands commands} are disabled so it is not possible
		 * to modify document using them.
		 *
		 * @observable
		 * @member {Boolean} #isReadOnly
		 */
		this.set( 'isReadOnly', false );

		/**
		 * The {@link module:engine/controller/editingcontroller~EditingController editing controller}.
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
			.then( loadedPlugins => {
				return initPlugins( loadedPlugins, 'init' )
					.then( () => initPlugins( loadedPlugins, 'afterInit' ) );
			} )
			.then( () => this.fire( 'pluginsReady' ) );

		function loadPlugins() {
			const plugins = config.get( 'plugins' ) || [];
			const removePlugins = config.get( 'removePlugins' ) || [];

			return that.plugins.load( plugins, removePlugins );
		}

		function initPlugins( loadedPlugins, method ) {
			return loadedPlugins.reduce( ( promise, plugin ) => {
				if ( !plugin[ method ] ) {
					return promise;
				}

				return promise.then( plugin[ method ].bind( plugin ) );
			}, Promise.resolve() );
		}
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * @fires destroy
	 * @returns {Promise} A promise that resolves once the editor instance is fully destroyed.
	 */
	destroy() {
		this.fire( 'destroy' );

		this.stopListening();

		this.commands.destroy();

		return this.plugins.destroy()
			.then( () => {
				this.document.destroy();
				this.data.destroy();
			} );
	}

	/**
	 * Executes specified command with given parameters.
	 *
	 * Shorthand for:
	 *
	 *		editor.commands.get( commandName ).execute( ... );
	 *
	 * @param {String} commandName Name of command to execute.
	 * @param {*} [...commandParams] Command parameters.
	 */
	execute( ...args ) {
		this.commands.execute( ...args );
	}

	/**
	 * Creates a basic editor instance.
	 *
	 * @param {Object} config The editor config. You can find the list of config options in
	 * {@link module:core/editor/editorconfig~EditorConfig}.
	 * @returns {Promise} Promise resolved once editor is ready.
	 * @returns {module:core/editor/editor~Editor} return.editor The editor instance.
	 */
	static create( config ) {
		return new Promise( resolve => {
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

mix( Editor, ObservableMixin );

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

/**
 * Additional data built into the editor class. It's used while bundling the editor in order to provide
 * the default set of plugins and config options which are later used during editor initialization.
 *
 * Two properties are supported:
 *
 * * `plugins` – an array of plugin constructors. They will be automatically initialized by the editor, unless listed
 * in `config.removePlugins` or unless `config.plugins` is passed.
 * * `config` – the defalt config options.
 *
 * @static
 * @member {Object} module:core/editor/editor~Editor.build
 */
