/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-inline/inlineeditor
 */

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import ElementApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/elementapimixin';
import attachToForm from '@ckeditor/ckeditor5-core/src/editor/utils/attachtoform';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import InlineEditorUI from './inlineeditorui';
import InlineEditorUIView from './inlineeditoruiview';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { isElement } from 'lodash-es';

/**
 * The {@glink builds/guides/overview#inline-editor inline editor} implementation.
 * It uses an inline editable and a floating toolbar.
 * See the {@glink examples/builds/inline-editor demo}.
 *
 * In order to create a inline editor instance, use the static
 * {@link module:editor-inline/inlineeditor~InlineEditor.create `InlineEditor.create()`} method.
 *
 * # Inline editor and inline build
 *
 * The inline editor can be used directly from source (if you installed the
 * [`@ckeditor/ckeditor5-editor-inline`](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline) package)
 * but it is also available in the {@glink builds/guides/overview#inline-editor inline build}.
 *
 * {@glink builds/guides/overview Builds} are ready-to-use editors with plugins bundled in. When using the editor from
 * source you need to take care of loading all plugins by yourself
 * (through the {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`} option).
 * Using the editor from source gives much better flexibility and allows easier customization.
 *
 * Read more about initializing the editor from source or as a build in
 * {@link module:editor-inline/inlineeditor~InlineEditor.create `InlineEditor.create()`}.
 *
 * @mixes module:core/editor/utils/dataapimixin~DataApiMixin
 * @mixes module:core/editor/utils/elementapimixin~ElementApiMixin
 * @implements module:core/editor/editorwithui~EditorWithUI
 * @extends module:core/editor/editor~Editor
 */
export default class InlineEditor extends Editor {
	/**
	 * Creates an instance of the inline editor.
	 *
	 * **Note:** Do not use the constructor to create editor instances. Use the static
	 * {@link module:editor-inline/inlineeditor~InlineEditor.create `InlineEditor.create()`} method instead.
	 *
	 * @protected
	 * @param {HTMLElement|String} sourceElementOrData The DOM element that will be the source for the created editor
	 * (on which the editor will be initialized) or initial data for the editor. For more information see
	 * {@link module:editor-inline/inlineeditor~InlineEditor.create `InlineEditor.create()`}.
	 * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
	 */
	constructor( sourceElementOrData, config ) {
		super( config );

		this.data.processor = new HtmlDataProcessor();

		this.model.document.createRoot();

		if ( isElement( sourceElementOrData ) ) {
			this.sourceElement = sourceElementOrData;
		}

		const view = new InlineEditorUIView( this.locale, this.editing.view, this.sourceElement );
		this.ui = new InlineEditorUI( this, view );

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
		// Cache the data, then destroy.
		// It's safe to assume that the model->view conversion will not work after super.destroy().
		const data = this.getData();

		this.ui.destroy();

		return super.destroy()
			.then( () => {
				if ( this.sourceElement ) {
					setDataInElement( this.sourceElement, data );
				}
			} );
	}

	/**
	 * Creates an inline editor instance.
	 *
	 * Creating an instance when using a {@glink builds/index CKEditor build}:
	 *
	 *		InlineEditor
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
	 *		import InlineEditor from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';
	 *		import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
	 *		import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
	 *		import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
	 *		import ...
	 *
	 *		InlineEditor
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
	 * Creating an instance when using the initial data instead of a DOM element:
	 *
	 *		import InlineEditor from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';
	 *		import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
	 *		import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
	 *		import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
	 *		import ...
	 *
	 *		InlineEditor
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
	 * (on which the editor will be initialized) or the initial data for the editor.
	 *
	 * If a source element is passed, then its contents will be automatically
	 * {@link module:editor-inline/inlineeditor~InlineEditor#setData loaded} to the editor on startup and the element
	 * itself will be used as the editor's editable element.
	 *
	 * If data is provided, then `editor.element` will be created automatically and needs to be added
	 * to the DOM manually.
	 * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
	 * @returns {Promise} A promise resolved once the editor is ready.
	 * The promise returns the created {@link module:editor-inline/inlineeditor~InlineEditor} instance.
	 */
	static create( sourceElementOrData, config ) {
		return new Promise( resolve => {
			const editor = new this( sourceElementOrData, config );

			resolve(
				editor.initPlugins()
					.then( () => {
						editor.ui.init();
					} )
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

mix( InlineEditor, DataApiMixin );
mix( InlineEditor, ElementApiMixin );
