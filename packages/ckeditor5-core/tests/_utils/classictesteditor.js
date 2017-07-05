/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import StandardEditor from '../../src/editor/standardeditor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import ClassicTestEditorUI from './classictesteditorui';
import BoxedEditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/boxed/boxededitoruiview';
import ElementReplacer from '@ckeditor/ckeditor5-utils/src/elementreplacer';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';

/**
 * A simplified classic editor. Useful for testing features.
 *
 * @memberOf tests.core._utils
 * @extends core.editor.StandardEditor
 */
export default class ClassicTestEditor extends StandardEditor {
	/**
	 * @inheritDoc
	 */
	constructor( element, config ) {
		super( element, config );

		this.document.createRoot();
		this.editing.createRoot( 'div' );
		this.data.processor = new HtmlDataProcessor();

		this.ui = new ClassicTestEditorUI( this, new BoxedEditorUIView( this.locale ) );

		// Expose properties normally exposed by the ClassicEditorUI.
		this.ui.view.editable = new InlineEditableUIView( this.ui.view.locale );
		this.ui.view.main.add( this.ui.view.editable );
		this.ui.view.editableElement = this.ui.view.editable.element;

		this._elementReplacer = new ElementReplacer();
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
					.then( () => editor._elementReplacer.replace( element, editor.ui.view.element ) )
					.then( () => {
						editor.ui.init();
						editor.fire( 'uiReady' );
					} )
					.then( () => editor.editing.view.attachDomRoot( editor.ui.view.editableElement ) )
					.then( () => editor.loadDataFromEditorElement() )
					.then( () => {
						editor.fire( 'dataReady' );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}
