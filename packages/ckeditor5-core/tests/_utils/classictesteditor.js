/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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
		this.ui.view.editable = new InlineEditableUIView( this.ui.view.locale );

		// A helper to easily replace the editor#element with editor.editable#element.
		this._elementReplacer = new ElementReplacer();

		// Create the ("main") root element of the model tree.
		this.model.document.createRoot();
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._elementReplacer.restore();
		this.ui.destroy();

		return super.destroy();
	}

	/**
	 * @inheritDoc
	 */
	static create( element, config ) {
		return new Promise( resolve => {
			const editor = new this( element, config );

			resolve(
				editor.initPlugins()
					// Simulate EditorUI.init() (e.g. like in ClassicEditorUI). The ui#view
					// should be rendered after plugins are initialized.
					.then( () => {
						const view = editor.ui.view;

						view.render();
						view.main.add( view.editable );
						view.editableElement = view.editable.element;
					} )
					.then( () => {
						editor._elementReplacer.replace( element, editor.ui.view.element );
						editor.ui.ready();
					} )
					.then( () => editor.editing.view.attachDomRoot( editor.ui.view.editableElement ) )
					.then( () => editor.data.init( getDataFromElement( element ) ) )
					.then( () => {
						editor.fire( 'dataReady' );
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
}

mix( ClassicTestEditor, DataApiMixin );
mix( ClassicTestEditor, ElementApiMixin );
