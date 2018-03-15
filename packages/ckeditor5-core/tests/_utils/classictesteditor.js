/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from '../../src/editor/editor';
import ElementApiMixin from '../../src/editor/utils/elementapimixin';
import DataApiMixin from '../../src/editor/utils/dataapimixin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import ClassicTestEditorUI from './classictesteditorui';
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
		this.ui.view.main.add( this.ui.view.editable );
		this.ui.view.editableElement = this.ui.view.editable.element;

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
					.then( () => editor.ui.view.render() )
					.then( () => {
						editor._elementReplacer.replace( element, editor.ui.view.element );
						editor.fire( 'uiReady' );
					} )
					.then( () => editor.editing.view.attachDomRoot( editor.ui.view.editableElement ) )
					.then( () => editor.data.init( getDataFromElement( element ) ) )
					.then( () => {
						editor.fire( 'dataReady' );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}

mix( ClassicTestEditor, DataApiMixin );
mix( ClassicTestEditor, ElementApiMixin );
