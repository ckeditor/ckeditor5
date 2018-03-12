/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-decoupled/decouplededitor
 */

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import DecoupledEditorUI from './decouplededitorui';
import DecoupledEditorUIView from './decouplededitoruiview';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * The {@glink builds/guides/overview#decoupled-editor decoupled editor} implementation.
 * It provides an inline editable and a toolbar. However, unlike other editors,
 * it does not render these components anywhere in DOM unless configured.
 *
 * This type of an editor is dedicated for integrations which require a customized UI with an open
 * structure, allowing developers to specify the exact location of the interface.
 *
 * See the document editor {@glink examples/builds/document-editor demo} to learn about possible use cases
 * for the decoupled editor.
 *
 * In order to create a decoupled editor instance, use the static
 * {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`} method.
 *
 * # Decoupled editor and document build
 *
 * The decoupled editor can be used directly from source (if you installed the
 * [`@ckeditor/ckeditor5-editor-decoupled`](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled) package)
 * but it is also available in the {@glink builds/guides/overview#document-editor document build}.
 *
 * {@glink builds/guides/overview Builds} are ready-to-use editors with plugins bundled in. When using the editor from
 * source you need to take care of loading all plugins by yourself
 * (through the {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`} option).
 * Using the editor from source gives much better flexibility and allows easier customization.
 *
 * Read more about initializing the editor from source or as a build in
 * {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`}.
 *
 * @mixes module:core/editor/utils/dataapimixin~DataApiMixin
 * @implements module:core/editor/editorwithui~EditorWithUI
 * @extends module:core/editor/editor~Editor
 */
export default class DecoupledEditor extends Editor {
	/**
	 * Creates an instance of the decoupled editor.
	 *
	 * **Note:** do not use the constructor to create editor instances. Use the static
	 * {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`} method instead.
	 *
	 * @protected
	 * @param {String} data The data to be loaded into the editor.
	 * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
	 */
	constructor( config ) {
		super( config );

		this.data.processor = new HtmlDataProcessor();

		this.model.document.createRoot();

		this.ui = new DecoupledEditorUI( this, new DecoupledEditorUIView( this.locale ) );
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * @returns {Promise}
	 */
	destroy() {
		this.ui.destroy();

		return super.destroy();
	}

	/**
	 * Creates a decoupled editor instance.
	 *
	 * Creating instance when using the {@glink builds/index CKEditor build}:
	 *
	 *		DecoupledEditor
	 *			.create( '<p>Editor data</p>', {
	 *				// The location of the toolbar in DOM.
	 *				toolbarContainer: 'body div.toolbar-container',
	 *
	 *				// The location of the editable in DOM.
	 *				editableContainer: 'body div.editable-container'
	 *			} )
	 *			.then( editor => {
	 *				console.log( 'Editor was initialized', editor );
	 *			} )
	 *			.catch( err => {
	 *				console.error( err.stack );
	 *			} );
	 *
	 * Creating instance when using CKEditor from source (make sure to specify the list of plugins to load and the toolbar):
	 *
	 *		import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
	 *		import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
	 *		import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
	 *		import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
	 *		import ...
	 *
	 *		DecoupledEditor
	 *			.create( '<p>Editor data</p>', {
	 *				plugins: [ Essentials, Bold, Italic, ... ],
	 *				toolbar: [ 'bold', 'italic', ... ],
	 *
	 *				// The location of the toolbar in DOM.
	 *				toolbarContainer: 'div.toolbar-container',
	 *
	 *				// The location of the editable in DOM.
	 *				editableContainer: 'div.editable-container'
	 *			} )
	 *			.then( editor => {
	 *				console.log( 'Editor was initialized', editor );
	 *			} )
	 *			.catch( err => {
	 *				console.error( err.stack );
	 *			} );
	 *
	 * **Note**: {@link module:core/editor/editorconfig~EditorConfig#toolbarContainer `config.toolbarContainer`} and
	 * {@link module:core/editor/editorconfig~EditorConfig#editableContainer `config.editableContainer`} are optional. It is
	 * possible to define the location of the UI elements manually once the editor is up and running:
	 *
	 *		DecoupledEditor
	 *			.create( '<p>Editor data</p>' )
	 *			.then( editor => {
	 *				console.log( 'Editor was initialized', editor );
	 *
	 *				// Append the toolbar and editable straight into the <body> element.
	 *				document.body.appendChild( editor.ui.view.toolbar.element );
	 *				document.body.appendChild( editor.ui.view.editable.element );
	 *			} )
	 *			.catch( err => {
	 *				console.error( err.stack );
	 *			} );
	 *
	 * @param {String} data The data to be loaded into the editor.
	 * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
	 * @returns {Promise} A promise resolved once the editor is ready.
	 * The promise returns the created {@link module:editor-decoupled/decouplededitor~DecoupledEditor} instance.
	 */
	static create( data, config ) {
		return new Promise( resolve => {
			const editor = new this( config );

			resolve(
				editor.initPlugins()
					.then( () => {
						editor.ui.init();
						editor.fire( 'uiReady' );
					} )
					.then( () => editor.editing.view.attachDomRoot( editor.ui.view.editableElement ) )
					.then( () => editor.data.set( data ) )
					.then( () => {
						editor.fire( 'dataReady' );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}

mix( DecoupledEditor, DataApiMixin );

/**
 * A configuration of the {@link module:editor-decoupled/decouplededitor~DecoupledEditor}.
 *
 * When specified, it controls the location of the {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#toolbar}.
 * It can be defined as a DOM element:
 *
 *		DecoupledEditor
 *			.create( '<p>Hello world!</p>', {
 *				// Append the toolbar to the <body> element.
 *				toolbarContainer: document.body
 *			} )
 *			.then( editor => {
 *				console.log( editor );
 *			} )
 *			.catch( error => {
 *				console.error( error );
 *			} );
 *
 * or a selector string corresponding to the CSS selector:
 *
 *		DecoupledEditor
 *			.create( '<p>Hello world!</p>', {
 *				// Append the toolbar to the <div class="container">...</div>
 *				toolbarContainer: 'div.container'
 *			} )
 *			.then( editor => {
 *				console.log( editor );
 *			} )
 *			.catch( error => {
 *				console.error( error );
 *			} );
 *
 * **Note**: If not specified, the toolbar must be manually injected into DOM. See
 * {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`}
 * to learn more.
 *
 * @member {String|HTMLElement} module:core/editor/editorconfig~EditorConfig#toolbarContainer
 */

/**
 * A configuration of the {@link module:editor-decoupled/decouplededitor~DecoupledEditor}.
 *
 * When specified, it controls the location of the {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#editable}.
 * It can be defined as a DOM element:
 *
 *		DecoupledEditor
 *			.create( '<p>Hello world!</p>', {
 *				// Append the editable to the <body> element.
 *				editableContainer: document.body
 *			} )
 *			.then( editor => {
 *				console.log( editor );
 *			} )
 *			.catch( error => {
 *				console.error( error );
 *			} );
 *
 * or a selector string corresponding to the CSS selector:
 *
 *		DecoupledEditor
 *			.create( '<p>Hello world!</p>', {
 *				// Append the editable to the <div class="container">...</div>.
 *				editableContainer: 'div.container'
 *			} )
 *			.then( editor => {
 *				console.log( editor );
 *			} )
 *			.catch( error => {
 *				console.error( error );
 *			} );
 *
 * **Note**: If not specified, the editable must be manually injected into DOM. See
 * {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`}
 * to learn more.
 *
 * @member {String|HTMLElement} module:core/editor/editorconfig~EditorConfig#editableContainer
 */
