/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-classic/classiceditor
 */

import StandardEditor from '@ckeditor/ckeditor5-core/src/editor/standardeditor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import ClassicEditorUI from './classiceditorui';
import ClassicEditorUIView from './classiceditoruiview';
import ElementReplacer from '@ckeditor/ckeditor5-utils/src/elementreplacer';

import '../theme/theme.scss';

/**
 * Classic editor. Uses an inline editable and a sticky toolbar, all
 * enclosed in a boxed UI.
 *
 * @extends module:core/editor/standardeditor~StandardEditor
 */
export default class ClassicEditor extends StandardEditor {
	/**
	 * Creates an instance of the classic editor.
	 *
	 * @param {HTMLElement} element The DOM element that will be the source for the created editor.
	 * The data will be loaded from it and loaded back to it once the editor is destroyed.
	 * @param {Object} config The editor configuration.
	 */
	constructor( element, config ) {
		super( element, config );

		this.document.createRoot();
		this.data.processor = new HtmlDataProcessor();
		this.ui = new ClassicEditorUI( this, new ClassicEditorUIView( this.locale ) );

		/**
		 * The element replacer instance used to hide the editor element.
		 *
		 * @protected
		 * @member {module:utils/elementreplacer~ElementReplacer}
		 */
		this._elementReplacer = new ElementReplacer();
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
		this.ui.destroy();

		return super.destroy();
	}

	/**
	 * Creates a classic editor instance.
	 *
	 *		ClassicEditor.create( document.querySelector( '#editor' ), {
	 *			plugins: [ Delete, Enter, Typing, Paragraph, Undo, Bold, Italic ],
	 *			toolbar: [ 'bold', 'italic', 'undo', 'redo' ]
	 *		} )
	 *		.then( editor => {
	 *			console.log( 'Editor was initialized', editor );
	 *		} )
	 *		.catch( err => {
	 *			console.error( err.stack );
	 *		} );
	 *
	 * @param {HTMLElement} element See {@link module:editor-classic/classiceditor~ClassicEditor#constructor}'s parameters.
	 * @param {Object} config See {@link module:editor-classic/classiceditor~ClassicEditor#constructor}'s parameters.
	 * @returns {Promise} A promise resolved once the editor is ready.
	 * @returns {module:core/editor/standardeditor~StandardEditor} return.editor The editor instance.
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
