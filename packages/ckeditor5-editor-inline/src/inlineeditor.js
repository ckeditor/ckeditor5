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
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

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
	 * Creates an `InlineEditor` instance.
	 *
	 * There are two general ways how the editor can be initialized.
	 *
	 * You can initialize the editor using an existing DOM element:
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
	 * The element's content will be used as the editor data and the element will become the editable element.
	 *
	 * Alternatively, you can initialize the editor by passing the initial data directly as a `String`.
	 * In this case, the editor will render an element that must be inserted into the DOM for the editor to work properly:
	 *
	 *		InlineEditor
	 *			.create( '<p>Hello world!</p>' )
	 *			.then( editor => {
	 *				console.log( 'Editor was initialized', editor );
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
	 *		InlineEditor
	 *			.create( document.querySelector( '#editor' ), {
	 *				initialData: '<h2>Initial data</h2><p>Foo bar.</p>'
	 *			} )
	 *			.then( editor => {
	 *				console.log( 'Editor was initialized', editor );
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
	 * It is available under {@link module:editor-inline/inlineeditorui~InlineEditorUI#element `editor.ui.element`} property.
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

mix( InlineEditor, DataApiMixin );
mix( InlineEditor, ElementApiMixin );

function getInitialData( sourceElementOrData ) {
	return isElement( sourceElementOrData ) ? getDataFromElement( sourceElementOrData ) : sourceElementOrData;
}
