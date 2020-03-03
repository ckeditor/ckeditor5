/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-balloon/ballooneditor
 */

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import BalloonToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/balloon/balloontoolbar';
import BalloonEditorUI from './ballooneditorui';
import BalloonEditorUIView from './ballooneditoruiview';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import ElementApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/elementapimixin';
import attachToForm from '@ckeditor/ckeditor5-core/src/editor/utils/attachtoform';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { isElement } from 'lodash-es';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import secureSourceElement from '@ckeditor/ckeditor5-core/src/editor/utils/securesourceelement';

/**
 * The {@glink builds/guides/overview#balloon-editor balloon editor} implementation (Medium-like editor).
 * It uses an inline editable and a toolbar based on the {@link module:ui/toolbar/balloon/balloontoolbar~BalloonToolbar}.
 * See the {@glink examples/builds/balloon-editor demo}.
 *
 * In order to create a balloon editor instance, use the static
 * {@link module:editor-balloon/ballooneditor~BalloonEditor.create `BalloonEditor.create()`} method.
 *
 * # Balloon editor and balloon build
 *
 * The balloon editor can be used directly from source (if you installed the
 * [`@ckeditor/ckeditor5-editor-balloon`](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon) package)
 * but it is also available in the {@glink builds/guides/overview#balloon-editor balloon build}.
 *
 * {@glink builds/guides/overview Builds} are ready-to-use editors with plugins bundled in. When using the editor from
 * source you need to take care of loading all plugins by yourself
 * (through the {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`} option).
 * Using the editor from source gives much better flexibility and allows easier customization.
 *
 * Read more about initializing the editor from source or as a build in
 * {@link module:editor-balloon/ballooneditor~BalloonEditor.create `BalloonEditor.create()`}.
 *
 * @mixes module:core/editor/utils/dataapimixin~DataApiMixin
 * @mixes module:core/editor/utils/elementapimixin~ElementApiMixin
 * @implements module:core/editor/editorwithui~EditorWithUI
 * @extends module:core/editor/editor~Editor
 */
export default class BalloonEditor extends Editor {
	/**
	 * Creates an instance of the balloon editor.
	 *
	 * **Note:** do not use the constructor to create editor instances. Use the static
	 * {@link module:editor-balloon/ballooneditor~BalloonEditor.create `BalloonEditor.create()`} method instead.
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
			secureSourceElement( this );
		}

		const plugins = this.config.get( 'plugins' );
		plugins.push( BalloonToolbar );

		this.config.set( 'plugins', plugins );

		this.config.define( 'balloonToolbar', this.config.get( 'toolbar' ) );

		this.data.processor = new HtmlDataProcessor( this.editing.view.document );

		this.model.document.createRoot();

		const view = new BalloonEditorUIView( this.locale, this.editing.view, this.sourceElement );
		this.ui = new BalloonEditorUI( this, view );

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
	 * Creates a new balloon editor instance.
	 *
	 * There are three general ways how the editor can be initialized.
	 *
	 * # Using an existing DOM element (and loading data from it)
	 *
	 * You can initialize the editor using an existing DOM element:
	 *
	 *		BalloonEditor
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
	 * # Creating a detached editor
	 *
	 * Alternatively, you can initialize the editor by passing the initial data directly as a string.
	 * In this case, the editor will render an element that must be inserted into the DOM for the editor to work properly:
	 *
	 *		BalloonEditor
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
	 * web page content is generated on the client side and the DOM structure is not ready at the moment when you initialize the editor.
	 *
	 * # Using an existing DOM element (and data provided in `config.initialData`)
	 *
	 * You can also mix these two ways by providing a DOM element to be used and passing the initial data through the configuration:
	 *
	 *		BalloonEditor
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
	 * This method can be used to initialize the editor on an existing element with the specified content in case if your integration
	 * makes it difficult to set the content of the source element.
	 *
	 * Note that an error will be thrown if you pass the initial data both as the first parameter and also in the configuration.
	 *
	 * # Configuring the editor
	 *
	 * See the {@link module:core/editor/editorconfig~EditorConfig editor configuration documentation} to learn more about
	 * customizing plugins, toolbar and more.
	 *
	 * # Using the editor from source
	 *
	 * The code samples listed in the previous sections of this documentation assume that you are using an
	 * {@glink builds/guides/overview editor build} (for example – `@ckeditor/ckeditor5-build-balloon`).
	 *
	 * If you want to use the balloon editor from source (`@ckeditor/ckeditor5-editor-balloon/src/ballooneditor`),
	 * you need to define the list of
	 * {@link module:core/editor/editorconfig~EditorConfig#plugins plugins to be initialized} and
	 * {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar items}. Read more about using the editor from
	 * source in the {@glink builds/guides/integration/advanced-setup "Advanced setup" guide}.
	 *
	 * @param {HTMLElement|String} sourceElementOrData The DOM element that will be the source for the created editor
	 * or the editor's initial data.
	 *
	 * If a DOM element is passed, its content will be automatically loaded to the editor upon initialization.
	 * Moreover, the editor data will be set back to the original element once the editor is destroyed.
	 *
	 * If the initial data is passed, a detached editor will be created. In this case you need to insert it into the DOM manually.
	 * It is available under the {@link module:editor-balloon/ballooneditorui~BalloonEditorUI#element `editor.ui.element`} property.
	 *
	 * @param {module:core/editor/editorconfig~EditorConfig} [config] The editor configuration.
	 * @returns {Promise} A promise resolved once the editor is ready. The promise resolves with the created editor instance.
	 */
	static create( sourceElementOrData, config = {} ) {
		return new Promise( resolve => {
			const isHTMLElement = isElement( sourceElementOrData );

			if ( isHTMLElement && sourceElementOrData.tagName === 'TEXTAREA' ) {
				// Documented in core/editor/editor.js
				throw new CKEditorError(
					'editor-wrong-element: This type of editor cannot be initialized inside <textarea> element.',
					null
				);
			}

			const editor = new this( sourceElementOrData, config );

			resolve(
				editor.initPlugins()
					.then( () => {
						editor.ui.init();
					} )
					.then( () => {
						if ( !isHTMLElement && config.initialData ) {
							// Documented in core/editor/editorconfig.jdoc.
							throw new CKEditorError(
								'editor-create-initial-data: ' +
								'The config.initialData option cannot be used together with initial data passed in Editor.create().',
								null
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

mix( BalloonEditor, DataApiMixin );
mix( BalloonEditor, ElementApiMixin );

function getInitialData( sourceElementOrData ) {
	return isElement( sourceElementOrData ) ? getDataFromElement( sourceElementOrData ) : sourceElementOrData;
}
