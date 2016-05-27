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
import StickyToolbar from '../ui/bindings/stickytoolbar.js';
import StickyToolbarView from '../ui/stickytoolbar/stickytoolbarview.js';

import ElementReplacer from '../utils/elementreplacer.js';

/**
 * Classic editor creator using inline editable and sticky toolbar, all
 * enclosed in a boxed UI.
 *
 * @memberOf editor-classic
 * @extends ckeditor5.editor.StandardEditor
 */
export default class ClassicEditor extends StandardEditor {
	/**
	 * Creates an instance of the classic creator.
	 *
	 * @param {ckeditor5.Editor} The editor instance.
	 */
	constructor( element, config ) {
		super( element, config );

		this.document.createRoot();

		this.editing.createRoot( 'div' );

		this.data.processor = new HtmlDataProcessor();

		this._elementReplacer = new ElementReplacer();
	}

	/**
	 * Updates the original editor element with data and destroys
	 * the UI.
	 *
	 * @returns {Promise}
	 */
	destroy() {
		this.updateEditorElement();
		this._elementReplacer.restore();

		return this.ui.destroy()
			.then( () => super.destroy() );
	}

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

	_initUI() {
		this._toolbar.addButtons( this.config.toolbar );

		return this.ui.init()
			.then( () => this.editing.view.attachDomRoot( this._editableUI.view.element ) );
	}

	static create( element, config ) {
		const editor = new ClassicEditor( element, config );

		return editor._createUI()
			.then( () => editor.initPlugins() )
			.then( () => editor._initUI() )
			.then( () => editor.loadDataFromEditorElement() )
			.then( () => editor );
	}

	/**
	 * Creates editor sticky toolbar and fills it with children using the configuration.
	 *
	 * @protected
	 */
	_createToolbar() {
		// Note: StickyToolbar and StickyToolbarView share the same model. It may change in the future.
		const toolbarModel = new Model();
		const toolbarView = new StickyToolbarView( toolbarModel, this.locale );
		const toolbar = new StickyToolbar( toolbarModel, toolbarView, this );

		this.ui.add( 'top', toolbar );

		this._toolbar = toolbar;
	}

	_createEditableUI() {
		const editable = this.editing.view.getRoot();
		const editableUI = new EditableUI( this, editable );
		const editableUIView = new InlineEditableUIView( editableUI.viewModel, this.locale );

		editableUI.view = editableUIView;

		this.ui.add( 'main', editableUI );

		this._editableUI = editableUI;
	}
}
