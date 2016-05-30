/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import StandardEditor from '../editor/standardeditor.js';

import HtmlDataProcessor from '../engine/dataprocessor/htmldataprocessor.js';

import BoxedEditorUI from '../ui/editorui/boxed/boxededitorui.js';
import BoxedEditorUIView from '../ui/editorui/boxed/boxededitoruiview.js';

import EditableUI from '../ui/editableui/editableui.js';
import InlineEditableUIView from '../ui/editableui/inline/inlineeditableuiview.js';

import Model from '../ui/model.js';
import Toolbar from '../ui/bindings/toolbar.js';
import StickyToolbarView from '../ui/stickytoolbar/stickytoolbarview.js';

import ElementReplacer from '../utils/elementreplacer.js';

/**
 * Classic editor. Uses inline editable and sticky toolbar, all
 * enclosed in a boxed UI.
 *
 * @memberOf editor-classic
 * @extends ckeditor5.editor.StandardEditor
 */
export default class ClassicEditor extends StandardEditor {
	/**
	 * Creates an instance of the classic editor.
	 *
	 * @param {HTMLElement} element The DOM element that will be the source for the created editor.
	 * The data will be loaded from it and loaded back to it once the editor is destroyed.
	 * @param {Object} config The editor config.
	 */
	constructor( element, config ) {
		super( element, config );

		this.document.createRoot();

		this.editing.createRoot( 'div' );

		this.data.processor = new HtmlDataProcessor();

		/**
		 * The element replacer instance used to hide editor element.
		 *
		 * @private
		 * @member {utils.ElementReplacer} editor-classic.Classic#_elementReplacer
		 */
		this._elementReplacer = new ElementReplacer();

		/**
		 * Toolbar controller.
		 *
		 * @protected
		 * @member {ui.toolbar.Toolbar} editor-classic.Classic#_toolbar
		 */

		/**
		 * Editable UI controller.
		 *
		 * @protected
		 * @member {ui.editableUI.EditableUI} editor-classic.Classic#_editableUI
		 */
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * Updates the original editor element with the data.
	 *
	 * @returns {Promise}
	 */
	destroy() {
		this.updateEditorElement();
		this._elementReplacer.restore();

		return this.ui.destroy()
			.then( () => super.destroy() );
	}

	/**
	 * Creates a classic editor instance.
	 *
	 *		ClassicEditor.create( document.querySelector( '#editor' ), {
	 *			features: [ 'delete', 'enter', 'typing', 'paragraph', 'undo', 'basic-styles/bold', 'basic-styles/italic' ],
	 *			toolbar: [ 'bold', 'italic', 'undo', 'redo' ]
	 *		} )
	 *		.then( editor => {
	 *			console.log( 'Editor was initialized', editor );
	 *		} )
	 *		.catch( err => {
	 *			console.error( err.stack );
	 *		} );
	 *
	 * @param {HTMLElement} element See {@link ckeditor5.editor.ClassicEditor#constructor}'s param.
	 * @param {Object} config See {@link ckeditor5.editor.ClassicEditor#constructor}'s param.
	 * @returns {Promise} Promise resolved once editor is ready.
	 * @returns {ckeditor5.editor.StandardEditor} return.editor The editor instance.
	 */
	static create( element, config ) {
		return new Promise( ( resolve ) => {
			const editor = new ClassicEditor( element, config );

			resolve(
				editor._createUI()
					.then( () => editor.initPlugins() )
					.then( () => editor._initUI() )
					.then( () => editor.loadDataFromEditorElement() )
					.then( () => editor )
			);
		} );
	}

	/**
	 * Creates editor UI (the {@link ui.editorUI.BoxedEditorUI boxed version} of it) with a sticky toolbar and an
	 * inline editable.
	 *
	 * @protected
	 * @returns {Promise}
	 */
	_createUI() {
		const editorUI = new BoxedEditorUI( this );
		const editorUIView = new BoxedEditorUIView( editorUI.viewModel, this.locale );

		editorUI.view = editorUIView;

		this.ui = editorUI;

		this._createToolbar();
		this._createEditableUI();

		this._elementReplacer.replace( this.element, this.ui.view.element );

		return Promise.resolve();
	}

	/**
	 * Initializes editor UI. The UI has to be {@link #_createUI created} beforehand.
	 *
	 * @protected
	 * @returns {Promise}
	 */
	_initUI() {
		if ( this.config.toolbar ) {
			this._toolbar.addButtons( this.config.toolbar );
		}

		return this.ui.init()
			.then( () => this.editing.view.attachDomRoot( this._editableUI.view.element ) );
	}

	/**
	 * Creates editor sticky toolbar.
	 *
	 * @protected
	 */
	_createToolbar() {
		const toolbarModel = new Model();
		const toolbarView = new StickyToolbarView( toolbarModel, this.locale );
		const toolbar = new Toolbar( toolbarModel, toolbarView, this );

		toolbarModel.bind( 'isActive' ).to( this.editing.view.getRoot(), 'isFocused' );

		this.ui.add( 'top', toolbar );

		this._toolbar = toolbar;
	}

	/**
	 * Creates editor main editable.
	 *
	 * @protected
	 */
	_createEditableUI() {
		const editable = this.editing.view.getRoot();
		const editableUI = new EditableUI( this, editable );
		const editableUIView = new InlineEditableUIView( editableUI.viewModel, this.locale );

		editableUI.view = editableUIView;

		this.ui.add( 'main', editableUI );

		this._editableUI = editableUI;
	}
}
