/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ObservableMixin from './utils/observablemixin.js';
import EditorConfig from './editorconfig.js';
import PluginCollection from './plugincollection.js';
import EditableCollection from './editablecollection.js';
import CKEditorError from './utils/ckeditorerror.js';
import Locale from './utils/locale.js';
import isArray from './utils/lib/lodash/isArray.js';
import nth from './utils/nth.js';
import mix from './utils/mix.js';

/**
 * Represents a single editor instance.
 *
 * @memberOf ckeditor5
 * @mixes utils.ObservaleMixin
 */
export default class Editor {
	/**
	 * Creates a new instance of the Editor class.
	 *
	 * This constructor should be rarely used. When creating new editor instance use instead the
	 * {@link CKEDITOR#create `CKEDITOR.create()` method}.
	 *
	 * @param {Object.<String, HTMLElement>|null} [elements] The DOM elements that will be the source
	 * for the created editor.
	 * @param {Object} config The editor config.
	 */
	constructor( elements, config ) {
		/**
		 * The original host page elements upon which the editor is created.
		 *
		 * @readonly
		 * @member {Map.<String, HTMLElement>|null} ckeditor5.Editor#elements
		 */
		if ( elements ) {
			this.elements = new Map();

			for ( let name in elements ) {
				this.elements.set( name, elements[ name ] );
			}
		} else {
			this.elements = null;
		}

		/**
		 * Holds all configurations specific to this editor instance.
		 *
		 * This instance of the {@link utils.Config} class is customized so its {@link utils.Config#get} method will retrieve
		 * global configurations available in {@link CKEDITOR.config} if configurations are not found in the
		 * instance itself.
		 *
		 * @readonly
		 * @member {utils.Config} ckeditor5.Editor#config
		 */
		this.config = config = new EditorConfig( config );

		/**
		 * The plugins loaded and in use by this editor instance.
		 *
		 * @readonly
		 * @member {ckeditor5.PluginCollection} ckeditor5.Editor#plugins
		 */
		this.plugins = new PluginCollection( this );

		/**
		 * The editables of the editor.
		 *
		 * @readonly
		 * @member {ckeditor5.EditableCollection} ckeditor5.Editor#editables
		 */
		this.editables = new EditableCollection();

		/**
		 * Commands registered to the editor.
		 *
		 * @readonly
		 * @member {Map.<ckeditor5.command.Command>} ckeditor5.Editor#commands
		 */
		this.commands = new Map();

		/**
		 * @readonly
		 * @member {utils.Locale} ckeditor5.Editor#locale
		 */
		this.locale = new Locale( config.lang );

		/**
		 * Shorthand for {@link utils.Locale#t}.
		 *
		 * @see utils.Locale#t
		 * @method ckeditor5.Editor#t
		 */
		this.t = this.locale.t;

		/**
		 * Tree Model document managed by this editor.
		 *
		 * This property is set by the {@link ckeditor5.creator.Creator}.
		 *
		 * @readonly
		 * @member {engine.treeModel.Document} ckeditor5.Editor#document
		 */

		/**
		 * Instance of the {@link engine.treecontroller.EditingController editing controller}.
		 *
		 * This property is set by the {@link ckeditor5.creator.Creator}.
		 *
		 * @readonly
		 * @member {engine.treecontroller.EditingController} ckeditor5.Editor#editing
		 */

		/**
		 * Instance of the {@link engine.treecontroller.DataController data controller}.
		 *
		 * This property is set by the {@link ckeditor5.creator.Creator}.
		 *
		 * @readonly
		 * @member {engine.treecontroller.DataController} ckeditor5.Editor#data
		 */

		/**
		 * The chosen creator.
		 *
		 * @protected
		 * @member {ckeditor5.creator.Creator} ckeditor5.Editor#_creator
		 */
	}

	/**
	 * First element from {@link ckeditor5.Editor#elements}.
	 *
	 * @readonly
	 * @type {HTMLElement|null}
	 */
	get firstElement() {
		if ( !this.elements ) {
			return null;
		}

		return nth( 0, this.elements )[ 1 ];
	}

	/**
	 * Name of the first element from {@link ckeditor5.Editor#elements}.
	 *
	 * @readonly
	 * @type {String|null}
	 */
	get firstElementName() {
		if ( !this.elements ) {
			return null;
		}

		return nth( 0, this.elements )[ 0 ];
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
	 * @fires ckeditor5.Editor#destroy
	 * @returns {Promise} A promise that resolves once the editor instance is fully destroyed.
	 */
	destroy() {
		this.fire( 'destroy' );
		this.stopListening();

		// Note: The destruction order should be the reverse of the initialization order.
		return Promise.resolve()
			.then( () => {
				return this._creator && this._creator.destroy();
			} )
			.then( () => this.editables.destroy() );
	}

	/**
	 * Sets the data in the specified editor's editable root.
	 *
	 * @param {*} data The data to load.
	 * @param {String} [editableRootName] The name of the editable root to which the data should be loaded.
	 * If not specified and if there's only one editable root added to the editor, then the data will be loaded
	 * to that editable.
	 */
	setData( data, editableRootName ) {
		if ( !this.data ) {
			/**
			 * Data controller has not been defined yet, so methds like {@link ckeditor5.Editor#setData} and
			 * {@link ckeditor5.Editor#getData} cannot be used.
			 *
			 * @error editor-no-datacontroller
			 */
			throw new CKEditorError( 'editor-no-datacontroller: Data controller has not been defined yet.' );
		}

		this.data.set( editableRootName || this._getDefaultRootName(), data );
	}

	/**
	 * Gets the data from the specified editor's editable root.
	 *
	 * @param {String} [editableRootName] The name of the editable root to get the data from.
	 * If not specified and if there's only one editable root added to the editor, then the data will be retrieved
	 * from it.
	 */
	getData( editableRootName ) {
		if ( !this.data ) {
			throw new CKEditorError( 'editor-no-datacontroller: Data controller has not been defined yet.' );
		}

		return this.data.get( editableRootName || this._getDefaultRootName() );
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
	 * Returns name of the editable root if there is only one. If there are multiple or no editable roots, throws an error.
	 *
	 * Note: The error message makes sense only for methods like {@link ckeditor5.Editor#setData} and
	 * {@link ckeditor5.Editor#getData}.
	 *
	 * @private
	 * @returns {String}
	 */
	_getDefaultRootName() {
		const rootNames = Array.from( this.document.rootNames );

		if ( rootNames.length > 1 ) {
			/**
			 * The name of the editable root must be specified. There are multiple editable roots added to the editor,
			 * so the name of the editable must be specified.
			 *
			 * @error editor-editable-root-name-missing
			 */
			throw new CKEditorError( 'editor-editable-root-name-missing: The name of the editable root must be specified.' );
		}

		if ( rootNames.length === 0 ) {
			/**
			 * The editor does not contain any editable roots, so the data cannot be set or read from it.
			 *
			 * @error editor-no-editable-roots
			 */
			throw new CKEditorError( 'editor-no-editable-roots: There are no editable roots defined.' );
		}

		return rootNames[ 0 ];
	}
}

mix( Editor, ObservableMixin );

/**
 * Fired when this editor instance is destroyed. The editor at this point is not usable and this event should be used to
 * perform the clean-up in any plugin.
 *
 * @event ckeditor5.Editor#destroy
 */
