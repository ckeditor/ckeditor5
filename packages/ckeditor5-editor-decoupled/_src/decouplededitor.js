/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-decoupled/decouplededitor
 */

import { Editor, ElementApiMixin, DataApiMixin, secureSourceElement } from 'ckeditor5/src/core';
import { CKEditorError, getDataFromElement, mix } from 'ckeditor5/src/utils';

import { isElement } from 'lodash-es';

import DecoupledEditorUI from './decouplededitorui';
import DecoupledEditorUIView from './decouplededitoruiview';

/**
 * The {@glink installation/getting-started/predefined-builds#document-editor decoupled editor} implementation.
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
 * but it is also available in the
 * {@glink installation/getting-started/predefined-builds#document-editor document editor build}.
 *
 * {@glink installation/getting-started/predefined-builds Builds}
 * are ready-to-use editors with plugins bundled in. When using the editor from
 * source you need to take care of loading all plugins by yourself
 * (through the {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`} option).
 * Using the editor from source gives much better flexibility and allows for easier customization.
 *
 * Read more about initializing the editor from source or as a build in
 * {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`}.
 *
 * @mixes module:core/editor/utils/dataapimixin~DataApiMixin
 * @mixes module:core/editor/utils/elementapimixin~ElementApiMixin
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
	 * @param {module:core/editor/editorconfig~EditorConfig} [config] The editor configuration.
	 */
	constructor( sourceElementOrData, config = {} ) {
		// If both `config.initialData` is set and initial data is passed as the constructor parameter, then throw.
		if ( !isElement( sourceElementOrData ) && config.initialData !== undefined ) {
			// Documented in core/editor/editorconfig.jsdoc.
			// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
			throw new CKEditorError( 'editor-create-initial-data', null );
		}

		super( config );

		if ( this.config.get( 'initialData' ) === undefined ) {
			this.config.set( 'initialData', getInitialData( sourceElementOrData ) );
		}

		if ( isElement( sourceElementOrData ) ) {
			this.sourceElement = sourceElementOrData;
			secureSourceElement( this );
		}

		this.model.document.createRoot();

		const shouldToolbarGroupWhenFull = !this.config.get( 'toolbar.shouldNotGroupWhenFull' );
		const view = new DecoupledEditorUIView( this.locale, this.editing.view, {
			editableElement: this.sourceElement,
			shouldToolbarGroupWhenFull
		} );

		this.ui = new DecoupledEditorUI( this, view );
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * Updates the original editor element with the data if the
	 * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy `updateSourceElementOnDestroy`}
	 * configuration option is set to `true`.
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
					this.updateSourceElement( data );
				}
			} );
	}

	/**
	 * Creates a new decoupled editor instance.
	 *
	 * Remember that `DecoupledEditor` does not append the toolbar element to your web page so you have to do it manually after the editor
	 * has been initialized.
	 *
	 * There are two ways how the editor can be initialized.
	 *
	 * # Using an existing DOM element (and loading data from it)
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
	 * The element's content will be used as the editor data and the element will become the editable element.
	 *
	 * # Creating a detached editor
	 *
	 * Alternatively, you can initialize the editor by passing the initial data directly as a string.
	 * In this case, you will have to manually append both the toolbar element and the editable element to your web page.
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
	 *				document.body.appendChild( editor.ui.getEditableElement() );
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
	 * {@glink installation/getting-started/predefined-builds editor build}
	 * (for example – `@ckeditor/ckeditor5-build-decoupled`).
	 *
	 * If you want to use the decoupled editor from source (`@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor`),
	 * you need to define the list of
	 * {@link module:core/editor/editorconfig~EditorConfig#plugins plugins to be initialized} and
	 * {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar items}. Read more about using the editor from
	 * source in the {@glink installation/advanced/alternative-setups/integrating-from-source-webpack dedicated guide}.
	 *
	 * @param {HTMLElement|String} sourceElementOrData The DOM element that will be the source for the created editor
	 * or the editor's initial data.
	 *
	 * If a DOM element is passed, its content will be automatically loaded to the editor upon initialization.
	 * The editor data will be set back to the original element once the editor is destroyed only if the
	 * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy updateSourceElementOnDestroy}
	 * option is set to `true`.
	 *
	 * If the initial data is passed, a detached editor will be created. In this case you need to insert it into the DOM manually.
	 * It is available via
	 * {@link module:editor-decoupled/decouplededitorui~DecoupledEditorUI#getEditableElement `editor.ui.getEditableElement()`}.
	 *
	 * @param {module:core/editor/editorconfig~EditorConfig} [config] The editor configuration.
	 * @returns {Promise} A promise resolved once the editor is ready. The promise resolves with the created editor instance.
	 */
	static create( sourceElementOrData, config = {} ) {
		return new Promise( resolve => {
			if ( isElement( sourceElementOrData ) && sourceElementOrData.tagName === 'TEXTAREA' ) {
				// Documented in core/editor/editor.js
				// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
				throw new CKEditorError( 'editor-wrong-element', null );
			}

			const editor = new this( sourceElementOrData, config );

			resolve(
				editor.initPlugins()
					.then( () => editor.ui.init() )
					.then( () => editor.data.init( editor.config.get( 'initialData' ) ) )
					.then( () => editor.fire( 'ready' ) )
					.then( () => editor )
			);
		} );
	}
}

mix( DecoupledEditor, ElementApiMixin );
mix( DecoupledEditor, DataApiMixin );

function getInitialData( sourceElementOrData ) {
	return isElement( sourceElementOrData ) ? getDataFromElement( sourceElementOrData ) : sourceElementOrData;
}
