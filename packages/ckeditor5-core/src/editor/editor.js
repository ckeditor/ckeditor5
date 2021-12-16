/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/editor/editor
 */

import Context from '../context';
import Config from '@ckeditor/ckeditor5-utils/src/config';
import EditingController from '@ckeditor/ckeditor5-engine/src/controller/editingcontroller';
import PluginCollection from '../plugincollection';
import CommandCollection from '../commandcollection';
import DataController from '@ckeditor/ckeditor5-engine/src/controller/datacontroller';
import Conversion from '@ckeditor/ckeditor5-engine/src/conversion/conversion';
import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import EditingKeystrokeHandler from '../editingkeystrokehandler';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';

/**
 * The class representing a basic, generic editor.
 *
 * Check out the list of its subclasses to learn about specific editor implementations.
 *
 * All editor implementations (like {@link module:editor-classic/classiceditor~ClassicEditor} or
 * {@link module:editor-inline/inlineeditor~InlineEditor}) should extend this class. They can add their
 * own methods and properties.
 *
 * When you are implementing a plugin, this editor represents the API
 * which your plugin can expect to get when using its {@link module:core/plugin~Plugin#editor} property.
 *
 * This API should be sufficient in order to implement the "editing" part of your feature
 * (schema definition, conversion, commands, keystrokes, etc.).
 * It does not define the editor UI, which is available only if
 * the specific editor implements also the {@link module:core/editor/editorwithui~EditorWithUI} interface
 * (as most editor implementations do).
 *
 * @abstract
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class Editor {
	/**
	 * Creates a new instance of the editor class.
	 *
	 * Usually, not to be used directly. See the static {@link module:core/editor/editor~Editor.create `create()`} method.
	 *
	 * @param {Object} [config={}] The editor configuration.
	 */
	constructor( config = {} ) {
		// Prefer the language passed as the argument to the constructor instead of the constructor's `defaultConfig`, if both are set.
		const language = config.language || ( this.constructor.defaultConfig && this.constructor.defaultConfig.language );

		/**
		 * The editor context.
		 * When it is not provided through the configuration, the editor creates it.
		 *
		 * @protected
		 * @type {module:core/context~Context}
		 */
		this._context = config.context || new Context( { language } );
		this._context._addEditor( this, !config.context );

		// Clone the plugins to make sure that the plugin array will not be shared
		// between editors and make the watchdog feature work correctly.
		const availablePlugins = Array.from( this.constructor.builtinPlugins || [] );

		/**
		 * Stores all configurations specific to this editor instance.
		 *
		 *		editor.config.get( 'image.toolbar' );
		 *		// -> [ 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ]
		 *
		 * @readonly
		 * @member {module:utils/config~Config}
		 */
		this.config = new Config( config, this.constructor.defaultConfig );
		this.config.define( 'plugins', availablePlugins );
		this.config.define( this._context._getEditorConfig() );

		/**
		 * The plugins loaded and in use by this editor instance.
		 *
		 *		editor.plugins.get( 'ClipboardPipeline' ); // -> An instance of the clipboard pipeline plugin.
		 *
		 * @readonly
		 * @member {module:core/plugincollection~PluginCollection}
		 */
		this.plugins = new PluginCollection( this, availablePlugins, this._context.plugins );

		/**
		 * The locale instance.
		 *
		 * @readonly
		 * @type {module:utils/locale~Locale}
		 */
		this.locale = this._context.locale;

		/**
		 * Shorthand for {@link module:utils/locale~Locale#t}.
		 *
		 * @see module:utils/locale~Locale#t
		 * @method #t
		 */
		this.t = this.locale.t;

		/**
		 * Commands registered to the editor.
		 *
		 * Use the shorthand {@link #execute `editor.execute()`} method to execute commands:
		 *
		 *		// Execute the bold command:
		 *		editor.execute( 'bold' );
		 *
		 *		// Check the state of the bold command:
		 *		editor.commands.get( 'bold' ).value;
		 *
		 * @readonly
		 * @member {module:core/commandcollection~CommandCollection}
		 */
		this.commands = new CommandCollection();

		/**
		 * Indicates the editor life-cycle state.
		 *
		 * The editor is in one of the following states:
		 *
		 * * `initializing` &ndash; During the editor initialization (before
		 * {@link module:core/editor/editor~Editor.create `Editor.create()`}) finished its job.
		 * * `ready` &ndash; After the promise returned by the {@link module:core/editor/editor~Editor.create `Editor.create()`}
		 * method is resolved.
		 * * `destroyed` &ndash; Once the {@link #destroy `editor.destroy()`} method was called.
		 *
		 * @observable
		 * @member {'initializing'|'ready'|'destroyed'} #state
		 */
		this.set( 'state', 'initializing' );
		this.once( 'ready', () => ( this.state = 'ready' ), { priority: 'high' } );
		this.once( 'destroy', () => ( this.state = 'destroyed' ), { priority: 'high' } );

		/**
		 * Defines whether this editor is in read-only mode.
		 *
		 * In read-only mode the editor {@link #commands commands} are disabled so it is not possible
		 * to modify the document by using them. Also, the editable element(s) become non-editable.
		 *
		 * In order to make the editor read-only, you can set this value directly:
		 *
		 *		editor.isReadOnly = true;
		 *
		 * @observable
		 * @member {Boolean} #isReadOnly
		 */
		this.set( 'isReadOnly', false );

		/**
		 * The editor's model.
		 *
		 * The central point of the editor's abstract data model.
		 *
		 * @readonly
		 * @member {module:engine/model/model~Model}
		 */
		this.model = new Model();

		const stylesProcessor = new StylesProcessor();

		/**
		 * The {@link module:engine/controller/datacontroller~DataController data controller}.
		 * Used e.g. for setting and retrieving the editor data.
		 *
		 * @readonly
		 * @member {module:engine/controller/datacontroller~DataController}
		 */
		this.data = new DataController( this.model, stylesProcessor );

		/**
		 * The {@link module:engine/controller/editingcontroller~EditingController editing controller}.
		 * Controls user input and rendering the content for editing.
		 *
		 * @readonly
		 * @member {module:engine/controller/editingcontroller~EditingController}
		 */
		this.editing = new EditingController( this.model, stylesProcessor );
		this.editing.view.document.bind( 'isReadOnly' ).to( this );

		/**
		 * Conversion manager through which you can register model-to-view and view-to-model converters.
		 *
		 * See the {@link module:engine/conversion/conversion~Conversion} documentation to learn how to add converters.
		 *
		 * @readonly
		 * @member {module:engine/conversion/conversion~Conversion}
		 */
		this.conversion = new Conversion( [ this.editing.downcastDispatcher, this.data.downcastDispatcher ], this.data.upcastDispatcher );
		this.conversion.addAlias( 'dataDowncast', this.data.downcastDispatcher );
		this.conversion.addAlias( 'editingDowncast', this.editing.downcastDispatcher );

		/**
		 * An instance of the {@link module:core/editingkeystrokehandler~EditingKeystrokeHandler}.
		 *
		 * It allows setting simple keystrokes:
		 *
		 *		// Execute the bold command on Ctrl+E:
		 *		editor.keystrokes.set( 'Ctrl+E', 'bold' );
		 *
		 *		// Execute your own callback:
		 *		editor.keystrokes.set( 'Ctrl+E', ( data, cancel ) => {
		 *			console.log( data.keyCode );
		 *
		 *			// Prevent the default (native) action and stop the underlying keydown event
		 *			// so no other editor feature will interfere.
		 *			cancel();
		 *		} );
		 *
		 * Note: Certain typing-oriented keystrokes (like <kbd>Backspace</kbd> or <kbd>Enter</kbd>) are handled
		 * by a low-level mechanism and trying to listen to them via the keystroke handler will not work reliably.
		 * To handle these specific keystrokes, see the events fired by the
		 * {@link module:engine/view/document~Document editing view document} (`editor.editing.view.document`).
		 *
		 * @readonly
		 * @member {module:core/editingkeystrokehandler~EditingKeystrokeHandler}
		 */
		this.keystrokes = new EditingKeystrokeHandler( this );
		this.keystrokes.listenTo( this.editing.view.document );
	}

	/**
	 * Loads and initializes plugins specified in the configuration.
	 *
	 * @returns {Promise.<module:core/plugin~LoadedPlugins>} A promise which resolves
	 * once the initialization is completed, providing an array of loaded plugins.
	 */
	initPlugins() {
		const config = this.config;
		const plugins = config.get( 'plugins' );
		const removePlugins = config.get( 'removePlugins' ) || [];
		const extraPlugins = config.get( 'extraPlugins' ) || [];
		const substitutePlugins = config.get( 'substitutePlugins' ) || [];

		return this.plugins.init( plugins.concat( extraPlugins ), removePlugins, substitutePlugins );
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * **Note** The editor cannot be destroyed during the initialization phase so if it is called
	 * while the editor {@link #state is being initialized}, it will wait for the editor initialization before destroying it.
	 *
	 * @fires destroy
	 * @returns {Promise} A promise that resolves once the editor instance is fully destroyed.
	 */
	destroy() {
		let readyPromise = Promise.resolve();

		if ( this.state == 'initializing' ) {
			readyPromise = new Promise( resolve => this.once( 'ready', resolve ) );
		}

		return readyPromise
			.then( () => {
				this.fire( 'destroy' );
				this.stopListening();
				this.commands.destroy();
			} )
			.then( () => this.plugins.destroy() )
			.then( () => {
				this.model.destroy();
				this.data.destroy();
				this.editing.destroy();
				this.keystrokes.destroy();
			} )
			// Remove the editor from the context.
			// When the context was created by this editor, the context will be destroyed.
			.then( () => this._context._removeEditor( this ) );
	}

	/**
	 * Executes the specified command with given parameters.
	 *
	 * Shorthand for:
	 *
	 *		editor.commands.get( commandName ).execute( ... );
	 *
	 * @param {String} commandName The name of the command to execute.
	 * @param {*} [...commandParams] Command parameters.
	 * @returns {*} The value returned by the {@link module:core/commandcollection~CommandCollection#execute `commands.execute()`}.
	 */
	execute( ...args ) {
		try {
			return this.commands.execute( ...args );
		} catch ( err ) {
			// @if CK_DEBUG // throw err;
			/* istanbul ignore next */
			CKEditorError.rethrowUnexpectedError( err, this );
		}
	}

	/**
	 * Focuses the editor.
	 *
	 * **Note** To explicitly focus the editing area of the editor, use the
	 * {@link module:engine/view/view~View#focus `editor.editing.view.focus()`} method of the editing view.
	 *
	 * Check out the {@glink framework/guides/deep-dive/ui/focus-tracking#focus-in-the-editor-ui Focus in the editor UI} section
	 * of the {@glink framework/guides/deep-dive/ui/focus-tracking Deep dive into focus tracking} guide to learn more.
	 */
	focus() {
		this.editing.view.focus();
	}

	/**
	 * Creates and initializes a new editor instance.
	 *
	 * This is an abstract method. Every editor type needs to implement its own initialization logic.
	 *
	 * See the `create()` methods of the existing editor types to learn how to use them:
	 *
	 * * {@link module:editor-classic/classiceditor~ClassicEditor.create `ClassicEditor.create()`}
	 * * {@link module:editor-balloon/ballooneditor~BalloonEditor.create `BalloonEditor.create()`}
	 * * {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`}
	 * * {@link module:editor-inline/inlineeditor~InlineEditor.create `InlineEditor.create()`}
	 *
	 * @abstract
	 * @method module:core/editor/editor~Editor.create
	 */
}

mix( Editor, ObservableMixin );

/**
 * Fired when the {@link module:engine/controller/datacontroller~DataController#event:ready data} and all additional
 * editor components are ready.
 *
 * Note: This event is most useful for plugin developers. When integrating the editor with your website or
 * application, you do not have to listen to `editor#ready` because when the promise returned by the static
 * {@link module:core/editor/editor~Editor.create `Editor.create()`} event is resolved, the editor is already ready.
 * In fact, since the first moment when the editor instance is available to you is inside `then()`'s callback,
 * you cannot even add a listener to the `editor#ready` event.
 *
 * See also the {@link #state `editor.state`} property.
 *
 * @event ready
 */

/**
 * Fired when this editor instance is destroyed. The editor at this point is not usable and this event should be used to
 * perform the clean-up in any plugin.
 *
 *
 * See also the {@link #state `editor.state`} property.
 *
 * @event destroy
 */

/**
 * This error is thrown when trying to pass a `<textarea>` element to a `create()` function of an editor class.
 *
 * The only editor type which can be initialized on `<textarea>` elements is
 * the {@glink builds/guides/predefined-builds/overview#classic-editor classic editor}.
 * This editor hides the passed element and inserts its own UI next to it. Other types of editors reuse the passed element as their root
 * editable element and therefore `<textarea>` is not appropriate for them. Use a `<div>` or another text container instead:
 *
 *		<div id="editor">
 *			<p>Initial content.</p>
 *		</div>
 *
 * @error editor-wrong-element
 */

/**
 * An array of plugins built into this editor class.
 *
 * It is used in CKEditor 5 builds to provide a list of plugins which are later automatically initialized
 * during the editor initialization.
 *
 * They will be automatically initialized by the editor, unless listed in `config.removePlugins` and
 * unless `config.plugins` is passed.
 *
 *		// Build some plugins into the editor class first.
 *		ClassicEditor.builtinPlugins = [ FooPlugin, BarPlugin ];
 *
 *		// Normally, you need to define config.plugins, but since ClassicEditor.builtinPlugins was
 *		// defined, now you can call create() without any configuration.
 *		ClassicEditor
 *			.create( sourceElement )
 *			.then( editor => {
 *				editor.plugins.get( FooPlugin ); // -> An instance of the Foo plugin.
 *				editor.plugins.get( BarPlugin ); // -> An instance of the Bar plugin.
 *			} );
 *
 *		ClassicEditor
 *			.create( sourceElement, {
 *				// Do not initialize these plugins (note: it is defined by a string):
 *				removePlugins: [ 'Foo' ]
 *			} )
 *			.then( editor => {
 *				editor.plugins.get( FooPlugin ); // -> Undefined.
 *				editor.config.get( BarPlugin ); // -> An instance of the Bar plugin.
 *			} );
 *
 *		ClassicEditor
 *			.create( sourceElement, {
 *				// Load only this plugin. It can also be defined by a string if
 *				// this plugin was built into the editor class.
 *				plugins: [ FooPlugin ]
 *			} )
 *			.then( editor => {
 *				editor.plugins.get( FooPlugin ); // -> An instance of the Foo plugin.
 *				editor.config.get( BarPlugin ); // -> Undefined.
 *			} );
 *
 * See also {@link module:core/editor/editor~Editor.defaultConfig}.
 *
 * @static
 * @member {Array.<Function>} module:core/editor/editor~Editor.builtinPlugins
 */

/**
 * The default configuration which is built into the editor class.
 *
 * It is used in CKEditor 5 builds to provide the default configuration options which are later used during the editor initialization.
 *
 *		ClassicEditor.defaultConfig = {
 *			foo: 1,
 *			bar: 2
 *		};
 *
 *		ClassicEditor
 *			.create( sourceElement )
 *			.then( editor => {
 *				editor.config.get( 'foo' ); // -> 1
 *				editor.config.get( 'bar' ); // -> 2
 *			} );
 *
 *		// The default options can be overridden by the configuration passed to create().
 *		ClassicEditor
 *			.create( sourceElement, { bar: 3 } )
 *			.then( editor => {
 *				editor.config.get( 'foo' ); // -> 1
 *				editor.config.get( 'bar' ); // -> 3
 *			} );
 *
 * See also {@link module:core/editor/editor~Editor.builtinPlugins}.
 *
 * @static
 * @member {Object} module:core/editor/editor~Editor.defaultConfig
 */
