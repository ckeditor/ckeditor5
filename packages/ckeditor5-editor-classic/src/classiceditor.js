/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
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
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { isElement } from 'lodash-es';

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
	 * @param {HTMLElement|String} sourceElementOrData The DOM element that will be the source for the created editor
	 * or the editor's initial data. For more information see
	 * {@link module:editor-classic/classiceditor~ClassicEditor.create `ClassicEditor.create()`}.
	 * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
	 */
	constructor( sourceElementOrData, config ) {
		super( config );

		if ( isElement( sourceElementOrData ) ) {
			this.sourceElement = sourceElementOrData;
		}

		this.data.processor = new HtmlDataProcessor();

		this.model.document.createRoot();

		this.ui = new ClassicEditorUI( this, new ClassicEditorUIView( this.locale, this.editing.view ) );

		attachToForm( this );
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * Updates the editor's source element with the data.
	 *
	 * @returns {Promise}
	 */
	destroy() {
		if ( this.sourceElement ) {
			this.updateSourceElement();
		}

		this.ui.destroy();

		return super.destroy();
	}

	/**
	 * Creates a classic editor instance.
	 *
	 * Creating an instance when using a {@glink builds/index CKEditor build}:
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
	 * Creating an instance when using CKEditor from source (make sure to specify the list of plugins to load and the toolbar):
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
	 * Creating an instance when using initial data instead of a DOM element:
	 *
	 *		import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
	 *		import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
	 *		import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
	 *		import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
	 *		import ...
	 *
	 *		ClassicEditor
	 *			.create( '<p>Hello world!</p>' )
	 *			.then( editor => {
	 *				console.log( 'Editor was initialized', editor );
	 *
	 *				// Initial data was provided so `editor.element` needs to be added manually to the DOM.
	 *				document.body.appendChild( editor.element );
	 *			} )
	 *			.catch( err => {
	 *				console.error( err.stack );
	 *			} );
	 *
	 * @param {HTMLElement|String} sourceElementOrData The DOM element that will be the source for the created editor
	 * or the editor's initial data.
	 *
	 * If a source element is passed, then its contents will be automatically
	 * {@link module:editor-classic/classiceditor~ClassicEditor#setData loaded} to the editor on startup
	 * and the {@link module:core/editor/editorui~EditorUI#getEditableElement editor element} will replace the passed element in the DOM
	 * (the original one will be hidden and the editor will be injected next to it).
	 *
	 * Moreover, the data will be set back to the source element once the editor is destroyed and
	 * (if the element is a `<textarea>`) when a form in which this element is contained is submitted (which ensures
	 * automatic integration with native web forms).
	 *
	 * If the data is passed, a detached editor will be created. It means that you need to insert it into the DOM manually (by accessing
	 * it via the {@link module:editor-classic/classiceditorui~ClassicEditorUI#getEditableElement `editor.ui.getEditableElement()`} method).
	 *
	 * See the examples above to learn more.
	 *
	 * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
	 * @returns {Promise} A promise resolved once the editor is ready.
	 * The promise returns the created {@link module:editor-classic/classiceditor~ClassicEditor} instance.
	 */
	static create( sourceElementOrData, config ) {
		return new Promise( resolve => {
			const editor = new this( sourceElementOrData, config );

			resolve(
				editor.initPlugins()
					.then( () => editor.ui.init( isElement( sourceElementOrData ) ? sourceElementOrData : null ) )
					.then( () => {
						const initialData = isElement( sourceElementOrData ) ?
							getDataFromElement( sourceElementOrData ) :
							sourceElementOrData;

						return editor.data.init( initialData );
					} )
					.then( () => editor.fire( 'ready' ) )
					.then( () => editor )
			);
		} );
	}
}

mix( ClassicEditor, DataApiMixin );
mix( ClassicEditor, ElementApiMixin );
