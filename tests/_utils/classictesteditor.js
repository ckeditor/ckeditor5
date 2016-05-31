/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import StandardEditor from '/ckeditor5/editor/standardeditor.js';

import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';

import BoxedEditorUI from '/ckeditor5/ui/editorui/boxed/boxededitorui.js';
import BoxedEditorUIView from '/ckeditor5/ui/editorui/boxed/boxededitoruiview.js';

/**
 * A simplified classic editor. Useful for testing features.
 *
 * @memberOf tests.ckeditor5._utils
 * @extends ckeditor5.editor.StandardEditor
 */
export default class ClassicTestEditor extends StandardEditor {
	/**
	 * @inheritDoc
	 */
	constructor( element, config ) {
		super( element, config );

		const editableElement = document.createElement( 'div' );

		document.body.appendChild( editableElement );

		this.document.createRoot();

		this.editing.createRoot( editableElement );

		this.data.processor = new HtmlDataProcessor();
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		return this.ui.destroy()
			.then( () => super.destroy() );
	}

	/**
	 * @inheritDoc
	 */
	static create( element, config ) {
		return new Promise( ( resolve ) => {
			const editor = new this( element, config );

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
	 * Creates boxed editor UI.
	 *
	 * @protected
	 * @returns {Promise}
	 */
	_createUI() {
		const editorUI = new BoxedEditorUI( this );
		const editorUIView = new BoxedEditorUIView( editorUI.viewModel, this.locale );

		editorUI.view = editorUIView;

		this.ui = editorUI;

		return Promise.resolve();
	}

	/**
	 * Initilizes editor UI.
	 *
	 * @protected
	 * @returns {Promise}
	 */
	_initUI() {
		return this.ui.init();
	}
}
