/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-classic/classiceditor
 */

import { Editor, DataApiMixin, ElementApiMixin, attachToForm } from 'ckeditor5/src/core';
import { mix, getDataFromElement, CKEditorError } from 'ckeditor5/src/utils';

import { isElement } from 'lodash-es';

import ClassicEditorUI from './classiceditorui';
import ClassicEditorUIView from './classiceditoruiview';

/**
 * The {@glink installation/advanced/alternative-setups/predefined-builds#classic-editor classic editor} implementation.
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
 * but it is also available in the {@glink installation/advanced/alternative-setups/predefined-builds#classic-editor classic build}.
 *
 * {@glink installation/advanced/alternative-setups/predefined-builds Builds}
 * are ready-to-use editors with plugins bundled in. When using the editor from
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
		}

		this.model.document.createRoot();

		const shouldToolbarGroupWhenFull = !this.config.get( 'toolbar.shouldNotGroupWhenFull' );
		const view = new ClassicEditorUIView( this.locale, this.editing.view, {
			shouldToolbarGroupWhenFull
		} );

		this.ui = new ClassicEditorUI( this, view );

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
	 * Creates a new classic editor instance.
	 *
	 * There are three ways how the editor can be initialized.
	 *
	 * # Replacing a DOM element (and loading data from it)
	 *
	 * You can initialize the editor using an existing DOM element:
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
	 * The element's content will be used as the editor data and the element will be replaced by the editor UI.
	 *
	 * # Creating a detached editor
	 *
	 * Alternatively, you can initialize the editor by passing the initial data directly as a string.
	 * In this case, the editor will render an element that must be inserted into the DOM:
	 *
	 *		ClassicEditor
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
	 * # Replacing a DOM element (and data provided in `config.initialData`)
	 *
	 * You can also mix these two ways by providing a DOM element to be used and passing the initial data through the configuration:
	 *
	 *		ClassicEditor
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
	 * {@glink installation/advanced/alternative-setups/predefined-builds editor build} (for example – `@ckeditor/ckeditor5-build-classic`).
	 *
	 * If you want to use the classic editor from source (`@ckeditor/ckeditor5-editor-classic/src/classiceditor`),
	 * you need to define the list of
	 * {@link module:core/editor/editorconfig~EditorConfig#plugins plugins to be initialized} and
	 * {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar items}. Read more about using the editor from
	 * source in the {@glink installation/advanced/alternative-setups/integrating-from-source dedicated guide}.
	 *
	 * @param {HTMLElement|String} sourceElementOrData The DOM element that will be the source for the created editor
	 * or the editor's initial data.
	 *
	 * If a DOM element is passed, its content will be automatically loaded to the editor upon initialization
	 * and the {@link module:editor-classic/classiceditorui~ClassicEditorUI#element editor element} will replace the passed element
	 * in the DOM (the original one will be hidden and the editor will be injected next to it).
	 *
	 * Moreover, the editor data will be set back to the original element once the editor is destroyed and when a form, in which
	 * this element is contained, is submitted (if the original element is a `<textarea>`). This ensures seamless integration with native
	 * web forms.
	 *
	 * If the initial data is passed, a detached editor will be created. In this case you need to insert it into the DOM manually.
	 * It is available under the {@link module:editor-classic/classiceditorui~ClassicEditorUI#element `editor.ui.element`} property.
	 *
	 * @param {module:core/editor/editorconfig~EditorConfig} [config] The editor configuration.
	 * @returns {Promise} A promise resolved once the editor is ready. The promise resolves with the created editor instance.
	 */
	static create( sourceElementOrData, config = {} ) {
		return new Promise( resolve => {
			const editor = new this( sourceElementOrData, config );

			resolve(
				editor.initPlugins()
					.then( () => editor.ui.init( isElement( sourceElementOrData ) ? sourceElementOrData : null ) )
					.then( () => editor.data.init( editor.config.get( 'initialData' ) ) )
					.then( () => editor.fire( 'ready' ) )
					.then( () => editor )
			);
		} );
	}
}

mix( ClassicEditor, DataApiMixin );
mix( ClassicEditor, ElementApiMixin );

function getInitialData( sourceElementOrData ) {
	return isElement( sourceElementOrData ) ? getDataFromElement( sourceElementOrData ) : sourceElementOrData;
}
