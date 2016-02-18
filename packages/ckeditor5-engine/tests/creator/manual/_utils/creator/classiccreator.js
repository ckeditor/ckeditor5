/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Creator from '/ckeditor5/core/creator.js';
import BoxedEditorUI from '/tests/core/_utils/ui/boxededitorui/boxededitorui.js';
import BoxedEditorUIView from '/tests/core/_utils/ui/boxededitorui/boxededitoruiview.js';
import FramedEditable from '/tests/core/_utils/ui/editable/framed/framededitable.js';
import FramedEditableView from '/tests/core/_utils/ui/editable/framed/framededitableview.js';
import Model from '/ckeditor5/core/ui/model.js';
import Toolbar from '/ckeditor5/ui/toolbar/toolbar.js';
import ToolbarView from '/ckeditor5/ui/toolbar/toolbarview.js';
import Button from '/ckeditor5/ui/button/button.js';
import ButtonView from '/ckeditor5/ui/button/buttonview.js';

export default class ClassicCreator extends Creator {
	constructor( editor ) {
		super( editor );

		editor.ui = this._createEditorUI();
	}

	create() {
		this._imitateFeatures();

		this._replaceElement();
		this._setupEditable();
		this._setupToolbar();

		return super.create()
			.then( () => this.loadDataFromEditorElement() );
	}

	destroy() {
		this.updateEditorElement();

		return super.destroy();
	}

	_setupEditable() {
		const editable = this._createEditable();

		this.editor.editable = editable;
		this.editor.ui.add( 'main', editable );
	}

	_setupToolbar() {
		const toolbar = new Toolbar( this.editor, new Model(), new ToolbarView() );

		toolbar.addButtons( this.editor.config.toolbar );

		this.editor.ui.collections.get( 'top' ).add( toolbar );
	}

	_createEditable() {
		const editable = new FramedEditable( this.editor );
		const editableView = new FramedEditableView( editable.viewModel );

		editable.view = editableView;

		return editable;
	}

	_createEditorUI() {
		const editorUI = new BoxedEditorUI( this.editor );
		const editorUIView = new BoxedEditorUIView( editorUI.viewModel );

		editorUI.view = editorUIView;

		return editorUI;
	}

	/**
	 * Immitates that some features were loaded and did their job.
	 */
	_imitateFeatures() {
		const editor = this.editor;

		const boldModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: 'bold'
		} );

		boldModel.on( 'executed', () => {
			/* global console */
			console.log( 'bold executed' );

			boldModel.isOn = !boldModel.isOn;
		} );

		editor.ui.featureComponents.add( 'bold', Button, ButtonView, boldModel );

		const italicModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: 'italic'
		} );

		italicModel.on( 'executed', () => {
			/* global console */
			console.log( 'italic executed' );

			italicModel.isOn = !italicModel.isOn;
		} );

		editor.ui.featureComponents.add( 'italic', Button, ButtonView, italicModel );

		window.boldModel = boldModel;
		window.italicModel = italicModel;
	}
}
