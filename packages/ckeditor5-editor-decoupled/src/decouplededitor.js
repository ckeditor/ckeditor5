/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
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
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { isElement } from 'lodash-es';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * The {@glink builds/guides/overview#document-editor decoupled editor} implementation.
 * It provides an inline editable and a toolbar. However, unlike other editors,
 * it does not render these components anywhere in the DOM unless configured.
 *
 * This type of an editor is dedicated to integrations which require a customized UI with an open
 * structure, allowing developers to specify the exact location of the interface.
 *
 * See the document editor {@glink examples/builds/document-editor demo} to learn about possible use cases
 * for the decoupled editor.
 *
 * In order to create a decoupled editor instance, use the static
 * {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`} method.
 *
 * # Decoupled editor and document editor build
 *
 * The decoupled editor can be used directly from source (if you installed the
 * [`@ckeditor/ckeditor5-editor-decoupled`](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled) package)
 * but it is also available in the {@glink builds/guides/overview#document-editor document editor build}.
 *
 * {@glink builds/guides/overview Builds} are ready-to-use editors with plugins bundled in. When using the editor from
 * source you need to take care of loading all plugins by yourself
 * (through the {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`} option).
 * Using the editor from source gives much better flexibility and allows for easier customization.
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
	 * **Note:** Do not use the constructor to create editor instances. Use the static
	 * {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`} method instead.
	 *
	 * @protected
	 * @param {HTMLElement|String} sourceElementOrData The DOM element that will be the source for the created editor
	 * (on which the editor will be initialized) or initial data for the editor. For more information see
	 * {@link module:editor-balloon/ballooneditor~BalloonEditor.create `BalloonEditor.create()`}.
	 * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
	 */
	constructor( sourceElementOrData, config ) {
		super( config );

		if ( isElement( sourceElementOrData ) ) {
			this.sourceElement = sourceElementOrData;
		}

		this.data.processor = new HtmlDataProcessor();

		this.model.document.createRoot();

		const view = new DecoupledEditorUIView( this.locale, this.editing.view, this.sourceElement );
		this.ui = new DecoupledEditorUI( this, view );
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * **Note**: The decoupled editor does not remove the toolbar and editable when destroyed. You can
	 * do that yourself in the destruction chain:
	 *
	 *		editor.destroy()
	 *			.then( () => {
	 *				// Remove the toolbar from DOM.
	 *				editor.ui.view.toolbar.element.remove();
	 *
	 *				// Remove the editable from DOM.
	 *				editor.ui.view.editable.element.remove();
	 *
	 *				console.log( 'Editor was destroyed' );
	 *			} );
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
	 * Creates a `DecoupledEditor` instance.
	 *
	 * Remember that `DecoupledEditor` do not append the toolbar element to your web page so you have to do it manually after the editor
	 * has been initialized.
	 *
	 * There are two general ways how the editor can be initialized.
	 *
	 * You can initialize the editor using an existing DOM element:
	 *
	 *		DecoupledEditor
	 *			.create( document.querySelector( '#editor' ) )
	 *			.then( editor => {
	 *				console.log( 'Editor was initialized', editor );
	 *
	 *				// Append the toolbar to the <body> element.
	 *				document.body.appendChild( editor.ui.view.toolbar.element );
	 *			} )
	 *			.catch( err => {
	 *				console.error( err.stack );
	 *			} );
	 *
	 * The element's content will be used as the editor data. The editable element will replace the source element on your web page.
	 *
	 * Alternatively, you can initialize the editor by passing the initial data directly as a `String`.
	 * In this case, you will have to manually append to your web page both the toolbar element and the editable element.
	 *
	 *		DecoupledEditor
	 *			.create( '<p>Hello world!</p>' )
	 *			.then( editor => {
	 *				console.log( 'Editor was initialized', editor );
	 *
	 *				// Append the toolbar to the <body> element.
	 *				document.body.appendChild( editor.ui.view.toolbar.element );
	 *
	 *				// Initial data was provided so the editor UI element needs to be added manually to the DOM.
	 *				document.body.appendChild( editor.ui.element );
	 *			} )
	 *			.catch( err => {
	 *				console.error( err.stack );
	 *			} );
	 *
	 * This lets you dynamically append the editor to your web page whenever it is convenient for you. You may use this method if your
	 * web page content is generated on the client-side and the DOM structure is not ready at the moment when you initialize the editor.
	 *
	 * You can also mix those two ways by providing a DOM element to be used and passing the initial data through the config:
	 *
	 *		DecoupledEditor
	 *			.create( document.querySelector( '#editor' ), {
	 *				initialData: '<h2>Initial data</h2><p>Foo bar.</p>'
	 *			} )
	 *			.then( editor => {
	 *				console.log( 'Editor was initialized', editor );
	 *
	 *				// Append the toolbar to the <body> element.
	 *				document.body.appendChild( editor.ui.view.toolbar.element );
	 *			} )
	 *			.catch( err => {
	 *				console.error( err.stack );
	 *			} );
	 *
	 * This method can be used to initialize the editor on an existing element with specified content in case if your integration
	 * makes it difficult to set the content of the source element.
	 *
	 * Note that an error will be thrown if you pass initial data both as the first parameter and also in the config.
	 *
	 * See also the {@link module:core/editor/editorconfig~EditorConfig editor configuration documentation} to learn more about
	 * customizing plugins, toolbar and other.
	 *
	 * @param {HTMLElement|String} sourceElementOrData The DOM element that will be the source for the created editor
	 * or the editor's initial data.
	 *
	 * If a DOM element is passed, its content will be automatically loaded to the editor upon initialization.
	 * Moreover, the editor data will be set back to the original element once the editor is destroyed.
	 *
	 * If the initial data is passed, a detached editor will be created. In this case you need to insert it into the DOM manually.
	 * It is available under {@link module:editor-decoupled/decouplededitorui~DecoupledEditorUI#element `editor.ui.element`} property.
	 *
	 * @param {module:core/editor/editorconfig~EditorConfig} [config] The editor configuration.
	 * @returns {Promise} A promise resolved once the editor is ready. The promise resolves with the created editor instance.
	 */
	static create( sourceElementOrData, config = {} ) {
		return new Promise( resolve => {
			const editor = new this( sourceElementOrData, config );

			resolve(
				editor.initPlugins()
					.then( () => {
						editor.ui.init();
					} )
					.then( () => {
						if ( !isElement( sourceElementOrData ) && config.initialData ) {
							throw new CKEditorError(
								'editor-create-initial-data: ' +
								'EditorConfig#initialData cannot be used together with initial data passed in Editor#create()'
							);
						}

						const initialData = config.initialData || getInitialData( sourceElementOrData );

						return editor.data.init( initialData );
					} )
					.then( () => editor.fire( 'ready' ) )
					.then( () => editor )
			);
		} );
	}
}

mix( DecoupledEditor, DataApiMixin );

function getInitialData( sourceElementOrData ) {
	return isElement( sourceElementOrData ) ? getDataFromElement( sourceElementOrData ) : sourceElementOrData;
}
