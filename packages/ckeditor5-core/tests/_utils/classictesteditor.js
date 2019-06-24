/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Editor from '../../src/editor/editor';
import ElementApiMixin from '../../src/editor/utils/elementapimixin';
import DataApiMixin from '../../src/editor/utils/dataapimixin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import EditorUI from '../../src/editor/editorui';
import BoxedEditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/boxed/boxededitoruiview';
import ElementReplacer from '@ckeditor/ckeditor5-utils/src/elementreplacer';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * A simplified classic editor. Useful for testing features.
 *
 * @memberOf tests.core._utils
 * @extends core.editor.Editor
 */
export default class ClassicTestEditor extends Editor {
	/**
	 * @inheritDoc
	 */
	constructor( element, config ) {
		super( config );

		// The element on which the editor has been initialized.
		this.element = element;

		// Use the HTML data processor in this editor.
		this.data.processor = new HtmlDataProcessor();

		this.ui = new ClassicTestEditorUI( this, new BoxedEditorUIView( this.locale ) );

		// Expose properties normally exposed by the ClassicEditorUI.
		this.ui.view.editable = new InlineEditableUIView( this.ui.view.locale, this.editing.view );

		// Create the ("main") root element of the model tree.
		this.model.document.createRoot();
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this.ui.destroy();

		return super.destroy();
	}

	/**
	 * @inheritDoc
	 */
	static create( element, config = {} ) {
		return new Promise( resolve => {
			const editor = new this( element, config );

			resolve(
				editor.initPlugins()
					// Simulate EditorUI.init() (e.g. like in ClassicEditorUI). The ui#view
					// should be rendered after plugins are initialized.
					.then( () => editor.ui.init( element ) )
					.then( () => editor.editing.view.attachDomRoot( editor.ui.getEditableElement() ) )
					.then( () => editor.data.init( config.initialData || getDataFromElement( element ) ) )
					.then( () => {
						editor.state = 'ready';
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}

/**
 * A simplified classic editor ui class.
 *
 * @memberOf tests.core._utils
 * @extends core.editor.EditorUI
 */
class ClassicTestEditorUI extends EditorUI {
	/**
	 * @inheritDoc
	 */
	constructor( editor, view ) {
		super( editor );

		// A helper to easily replace the editor#element with editor.editable#element.
		this._elementReplacer = new ElementReplacer();

		this._view = view;
	}

	/**
	 * The main (top–most) view of the editor UI.
	 *
	 * @readonly
	 * @member {module:ui/editorui/editoruiview~EditorUIView} #view
	 */
	get view() {
		return this._view;
	}

	init( element ) {
		const view = this.view;
		const editable = view.editable;
		const editingView = this.editor.editing.view;
		const editingRoot = editingView.document.getRoot();

		editable.name = editingRoot.rootName;

		view.render();

		view.main.add( view.editable );

		this._editableElements.set( 'main', view.editable.element );

		this._elementReplacer.replace( element, view.element );

		this.fire( 'ready' );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._elementReplacer.restore();

		this._view.destroy();

		super.destroy();
	}
}

mix( ClassicTestEditor, DataApiMixin );
mix( ClassicTestEditor, ElementApiMixin );
