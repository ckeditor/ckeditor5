/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import EmitterMixin from '../utils/emittermixin.js';
import Config from '../utils/config.js';
import PluginCollection from '../plugincollection.js';
import Locale from '../utils/locale.js';
import DataController from '../engine/datacontroller.js';
import Document from '../engine/model/document.js';

import CKEditorError from '../utils/ckeditorerror.js';
import isArray from '../utils/lib/lodash/isArray.js';
import mix from '../utils/mix.js';

/**
 * Class representing a basic editor. It contains a base architecture, without much additional logic.
 *
 * See also {@link ckeditor5.editor.StandardEditor}.
 *
 * @memberOf ckeditor5.editor
 * @mixes utils.EmitterMixin
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
		 * @member {utils.Config} ckeditor5.Editor#config
		 */
		this.config = new Config( config );

		/**
		 * The plugins loaded and in use by this editor instance.
		 *
		 * @readonly
		 * @member {ckeditor5.PluginCollection} ckeditor5.Editor#plugins
		 */
		this.plugins = new PluginCollection( this );

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
		this.locale = new Locale( this.config.get( 'lang' ) );

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
		 * @readonly
		 * @member {engine.model.Document} ckeditor5.Editor#document
		 */
		this.document = new Document();

		/**
		 * Instance of the {@link engine.DataController data controller}.
		 *
		 * @readonly
		 * @member {engine.DataController} ckeditor5.Editor#data
		 */
		this.data = new DataController( this.document );

		/**
		 * Instance of the {@link engine.EditingController editing controller}.
		 *
		 * This property is set by more specialized editor classes (such as {@link ckeditor5.editor.StandardEditor}),
		 * however, it's required for features to work as their engine-related parts will try to connect converters.
		 *
		 * When defining a virtual editor class, like one working in Node.js, it's possible to plug a virtual
		 * editing controller which only instantiates necessary properties, but without any observers and listeners.
		 *
		 * @readonly
		 * @member {engine.EditingController} ckeditor5.editor.Editor#editing
		 */
	}

	/**
	 * Loads and initilizes plugins specified in config features.
	 *
	 * @returns {Promise} A promise which resolves once the initialization is completed.
	 */
	initPlugins() {
		const that = this;
		const config = this.config;

		return loadPlugins()
			.then( initPlugins );

		function loadPlugins() {
			let plugins = config.get( 'features' ) || [];

			// Handle features passed as a string.
			if ( !isArray( plugins ) ) {
				plugins = plugins.split( ',' );
			}

			return that.plugins.load( plugins );
		}

		function initPlugins( loadedPlugins ) {
			return loadedPlugins.reduce( ( promise, plugin ) => {
				return promise.then( plugin.init.bind( plugin ) );
			}, Promise.resolve() );
		}
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * @fires ckeditor5.editor.Editor#destroy
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
	 * @param {Object} config See {@link ckeditor5.editor.StandardEditor}'s param.
	 * @returns {Promise} Promise resolved once editor is ready.
	 * @returns {ckeditor5.editor.StandardEditor} return.editor The editor instance.
	 */
	static create( config ) {
		return new Promise( ( resolve ) => {
			const editor = new this( config );

			resolve(
				editor.initPlugins()
					.then( () => editor )
			);
		} );
	}
}

mix( Editor, EmitterMixin );

/**
 * Fired when this editor instance is destroyed. The editor at this point is not usable and this event should be used to
 * perform the clean-up in any plugin.
 *
 * @event ckeditor5.editor.Editor#destroy
 */
