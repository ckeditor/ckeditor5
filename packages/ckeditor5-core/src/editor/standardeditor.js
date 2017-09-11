/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/editor/standardeditor
 */

import Editor from './editor';
import EditingKeystrokeHandler from '../editingkeystrokehandler';
import EditingController from '@ckeditor/ckeditor5-engine/src/controller/editingcontroller';
import isFunction from '@ckeditor/ckeditor5-utils/src/lib/lodash/isFunction';

import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';

/**
 * Class representing a typical browser-based editor. It handles a single source element and
 * uses {@link module:engine/controller/editingcontroller~EditingController}.
 *
 * @extends module:core/editor/editor~Editor
 */
export default class StandardEditor extends Editor {
	/**
	 * Creates a new instance of the standard editor.
	 *
	 * @param {HTMLElement} element The DOM element that will be the source
	 * for the created editor.
	 * @param {Object} config The editor config.
	 */
	constructor( element, config ) {
		super( config );

		/**
		 * The element on which the editor has been initialized.
		 *
		 * @readonly
		 * @member {HTMLElement}
		 */
		this.element = element;

		// Documented in Editor.
		this.editing = new EditingController( this.document );
		this.editing.view.bind( 'isReadOnly' ).to( this );

		/**
		 * Instance of the {@link module:core/editingkeystrokehandler~EditingKeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:core/editingkeystrokehandler~EditingKeystrokeHandler}
		 */
		this.keystrokes = new EditingKeystrokeHandler( this );

		/**
		 * Editor UI instance.
		 *
		 * This property is set by more specialized editor constructors. However, it's required
		 * for plugins to work (their UI-related part will try to interact with editor UI),
		 * so every editor class which is meant to work with default plugins should set this property.
		 *
		 * @readonly
		 * @member {module:core/editor/editorui~EditorUI} #ui
		 */

		this.keystrokes.listenTo( this.editing.view );

		this._attachToForm();
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		return Promise.resolve()
			.then( () => this.keystrokes.destroy() )
			.then( () => this.editing.destroy() )
			.then( super.destroy() );
	}

	/**
	 * Sets the data in the editor's main root.
	 *
	 * @param {*} data The data to load.
	 */
	setData( data ) {
		this.data.set( data );
	}

	/**
	 * Gets the data from the editor's main root.
	 */
	getData() {
		return this.data.get();
	}

	/**
	 * Updates the {@link #element editor element}'s content with the data.
	 */
	updateEditorElement() {
		setDataInElement( this.element, this.getData() );
	}

	/**
	 * Loads the data from the {@link #element editor element} to the main root.
	 */
	loadDataFromEditorElement() {
		this.setData( getDataFromElement( this.element ) );
	}

	/**
	 * Checks if editor is initialized on textarea element that belongs to a form. If yes - updates editor's element
	 * contents before submitting the form.
	 *
	 * @private
	 */
	_attachToForm() {
		const element = this.element;

		// Only when replacing a textarea which is inside of a form element.
		if ( element && element.tagName.toLowerCase() === 'textarea' && element.form ) {
			let originalSubmit;
			const form = element.form;
			const onSubmit = () => this.updateEditorElement();

			// Replace the original form#submit() to call a custom submit function first.
			// Check if #submit is a function because the form might have an input named "submit".
			if ( isFunction( form.submit ) ) {
				originalSubmit = form.submit;

				form.submit = () => {
					onSubmit();
					originalSubmit.apply( form );
				};
			}

			// Update the replaced textarea with data before each form#submit event.
			form.addEventListener( 'submit', onSubmit );

			// Remove the submit listener and revert the original submit method on
			// editor#destroy.
			this.on( 'destroy', () => {
				form.removeEventListener( 'submit', onSubmit );

				if ( originalSubmit ) {
					form.submit = originalSubmit;
				}
			} );
		}
	}

	/**
	 * Creates a standard editor instance.
	 *
	 * @param {HTMLElement} element See {@link module:core/editor/standardeditor~StandardEditor}'s param.
	 * @param {Object} config The editor config. You can find the list of config options in
	 * {@link module:core/editor/editorconfig~EditorConfig}.
	 * @returns {Promise} Promise resolved once editor is ready.
	 * @returns {module:core/editor/standardeditor~StandardEditor} return.editor The editor instance.
	 */
	static create( element, config ) {
		return new Promise( resolve => {
			const editor = new this( element, config );

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
