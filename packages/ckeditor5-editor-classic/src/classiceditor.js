/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-classic/classiceditor
 */

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import ElementApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/elementapimixin';
import attachToForm from '@ckeditor/ckeditor5-core/src/editor/utils/attachtoform';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import ClassicEditorUI from './classiceditorui';
import ClassicEditorUIView from './classiceditoruiview';
import ElementReplacer from '@ckeditor/ckeditor5-utils/src/elementreplacer';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * The {@glink builds/guides/overview#classic-editor classic editor} implementation.
 * It uses an inline editable and a sticky toolbar, all enclosed in a boxed UI.
 * See the {@glink examples/builds/classic-editor demo}.
 *
 * In order to create a classic editor instance, use the static
 * {@link module:editor-classic/classiceditor~ClassicEditor.create `ClassicEditor.create()`} method.
 *
 * # Classic editor and classic build
 *
 * The classic editor can be used directly from source (if you installed the
 * [`@ckeditor/ckeditor5-editor-classic`](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic) package)
 * but it is also available in the {@glink builds/guides/overview#classic-editor classic build}.
 *
 * {@glink builds/guides/overview Builds} are ready-to-use editors with plugins bundled in. When using the editor from
 * source you need to take care of loading all plugins by yourself
 * (through the {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`} option).
 * Using the editor from source gives much better flexibility and allows easier customization.
 *
 * Read more about initializing the editor from source or as a build in
 * {@link module:editor-classic/classiceditor~ClassicEditor.create `ClassicEditor.create()`}.
 *
 * @mixes module:core/editor/utils/dataapimixin~DataApiMixin
 * @mixes module:core/editor/utils/elementapimixin~ElementApiMixin
 * @implements module:core/editor/editorwithui~EditorWithUI
 * @extends module:core/editor/editor~Editor
 */
export default class ClassicEditor extends Editor {
	/**
	 * Creates an instance of the classic editor.
	 *
	 * **Note:** do not use the constructor to create editor instances. Use the static
	 * {@link module:editor-classic/classiceditor~ClassicEditor.create `ClassicEditor.create()`} method instead.
	 *
	 * @protected
	 * @param {HTMLElement} element The DOM element that will be the source for the created editor.
	 * The data will be loaded from it and loaded back to it once the editor is destroyed.
	 * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
	 */
	constructor( element, config ) {
		super( config );

		/**
		 * The element replacer instance used to hide the editor element.
		 *
		 * @protected
		 * @member {module:utils/elementreplacer~ElementReplacer}
		 */
		this._elementReplacer = new ElementReplacer();

		this.element = element;

		this.data.processor = new HtmlDataProcessor();

		this.model.document.createRoot();

		this.ui = new ClassicEditorUI( this, new ClassicEditorUIView( this.locale ) );

		attachToForm( this );
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * Updates the original editor element with the data.
	 *
	 * @returns {Promise}
	 */
	destroy() {
		this.updateElement();
		this._elementReplacer.restore();
		this.ui.destroy();

		return super.destroy();
	}

	/**
	 * Creates a classic editor instance.
	 *
	 * Creating instance when using {@glink builds/index CKEditor build}:
	 *
	 *		ClassicEditor
	 *			.create( document.querySelector( '#editor' ) )
	 *			.then( editor => {
	 *				console.log( 'Editor was initialized', editor );
	 *			} )
	 *			.catch( err => {
	 *				console.error( err.stack );
	 *			} );
	 *
	 * Creating instance when using CKEditor from source (make sure to specify the list of plugins to load and the toolbar):
	 *
	 *		import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
	 *		import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
	 *		import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
	 *		import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
	 *		import ...
	 *
	 *		ClassicEditor
	 *			.create( document.querySelector( '#editor' ), {
	 *				plugins: [ Essentials, Bold, Italic, ... ],
	 *				toolbar: [ 'bold', 'italic', ... ]
	 *			} )
	 *			.then( editor => {
	 *				console.log( 'Editor was initialized', editor );
	 *			} )
	 *			.catch( err => {
	 *				console.error( err.stack );
	 *			} );
	 *
	 * @param {HTMLElement} element The DOM element that will be the source for the created editor.
	 * The data will be loaded from it and loaded back to it once the editor is destroyed.
	 * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
	 * @returns {Promise} A promise resolved once the editor is ready.
	 * The promise returns the created {@link module:editor-classic/classiceditor~ClassicEditor} instance.
	 */
	static create( element, config ) {
		return new Promise( resolve => {
			const editor = new this( element, config );

			resolve(
				editor.initPlugins()
					.then( () => editor.ui.init() )
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

mix( ClassicEditor, DataApiMixin );
mix( ClassicEditor, ElementApiMixin );
