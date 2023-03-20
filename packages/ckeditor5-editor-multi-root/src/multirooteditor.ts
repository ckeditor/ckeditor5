/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-multi-root/multirooteditor
 */

import {
	Editor,
	Context,
	DataApiMixin,
	secureSourceElement,
	type EditorConfig,
	type EditorReadyEvent
} from 'ckeditor5/src/core';
import {
	CKEditorError,
	getDataFromElement,
	setDataInElement
} from 'ckeditor5/src/utils';

import { ContextWatchdog, EditorWatchdog } from 'ckeditor5/src/watchdog';

import MultiRootEditorUI from './multirooteditorui';
import MultiRootEditorUIView from './multirooteditoruiview';

import { isElement as _isElement } from 'lodash-es';

/**
 * The {@glink installation/getting-started/predefined-builds#multi-root-editor multi-root editor} implementation.
 *
 * The multi-root editor provides multiple inline editable elements and a toolbar. All editable areas are controlled by one editor
 * instance, which means that they share common configuration, document ID, or undo stack.
 *
 * This type of editor is dedicated to integrations which require a customized UI with an open structure, featuring multiple editable areas,
 * allowing developers to have a control over the exact location of these editable areas.
 *
 * In order to create a multi-root editor instance, use the static
 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`} method.
 *
 * Note that you will need to attach the editor toolbar to your web page manually, in a desired place, after the editor is initialized.
 *
 * # Multi-root editor and multi-root editor build
 *
 * The multi-root editor can be used directly from source (if you installed the
 * [`@ckeditor/ckeditor5-editor-multi-root`](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root) package)
 * but it is also available in the
 * {@glink installation/getting-started/predefined-builds#multi-root-editor multi-root editor build}.
 *
 * {@glink installation/getting-started/predefined-builds Builds} are ready-to-use editors with plugins bundled in.
 *
 * When using the editor from source you need to take care of loading all plugins by yourself
 * (through the {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`} option).
 * Using the editor from source gives much better flexibility and allows for easier customization.
 *
 * Read more about initializing the editor from source or as a build in
 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`}.
 */
export default class MultiRootEditor extends DataApiMixin( Editor ) {
	/**
	 * @inheritDoc
	 */
	public readonly ui: MultiRootEditorUI;

	/**
	 * The elements on which the editor has been initialized.
	 */
	public readonly sourceElements: Record<string, HTMLElement> | undefined;

	/**
	 * Creates an instance of the multi-root editor.
	 *
	 * **Note:** Do not use the constructor to create editor instances. Use the static
	 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`} method instead.
	 *
	 * @param sourceElementsOrData The DOM elements that will be the source for the created editor
	 * or the editor's initial data. The editor will initialize multiple roots with names according to the keys in the passed object.
	 * For more information see {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`}.
	 * @param config The editor configuration.
	 */
	protected constructor( sourceElementsOrData: Record<string, HTMLElement> | Record<string, string>, config: EditorConfig = {} ) {
		const rootNames = Object.keys( sourceElementsOrData );
		const sourceIsData = rootNames.length === 0 || typeof sourceElementsOrData[ rootNames[ 0 ] ] === 'string';

		if ( sourceIsData && config.initialData !== undefined ) {
			// Documented in core/editor/editorconfig.jsdoc.
			// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
			throw new CKEditorError( 'editor-create-initial-data', null );
		}

		super( config );

		if ( !sourceIsData ) {
			this.sourceElements = sourceElementsOrData as Record<string, HTMLElement>;
		}

		if ( this.config.get( 'initialData' ) === undefined ) {
			// Create initial data object containing data from all roots.
			const initialData: Record<string, string> = {};

			for ( const rootName of rootNames ) {
				initialData[ rootName ] = getInitialData( sourceElementsOrData[ rootName ] );
			}

			this.config.set( 'initialData', initialData );
		}

		if ( !sourceIsData ) {
			for ( const rootName of rootNames ) {
				secureSourceElement( this, sourceElementsOrData[ rootName ] as HTMLElement );
			}
		}

		for ( const rootName of rootNames ) {
			// Create root and `UIView` element for each editable container.
			this.model.document.createRoot( '$root', rootName );
		}

		const options = {
			shouldToolbarGroupWhenFull: !this.config.get( 'toolbar.shouldNotGroupWhenFull' ),
			editableElements: sourceIsData ? undefined : sourceElementsOrData as Record<string, HTMLElement>
		};

		const view = new MultiRootEditorUIView( this.locale, this.editing.view, rootNames, options );

		this.ui = new MultiRootEditorUI( this, view );
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * Updates the original editor element with the data if the
	 * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy `updateSourceElementOnDestroy`}
	 * configuration option is set to `true`.
	 *
	 * **Note**: The multi-root editor does not remove the toolbar and editable when destroyed. You can
	 * do that yourself in the destruction chain, if you need to:
	 *
	 * ```ts
	 * editor.destroy().then( () => {
	 * 	// Remove the toolbar from DOM.
	 * 	editor.ui.view.toolbar.element.remove();
	 *
	 * 	// Remove editable elements from DOM.
	 * 	for ( const editable of Object.values( editor.ui.view.editables ) ) {
	 * 	    editable.element.remove();
	 * 	}
	 *
	 * 	console.log( 'Editor was destroyed' );
	 * } );
	 * ```
	 */
	public override destroy(): Promise<unknown> {
		const shouldUpdateSourceElement = this.config.get( 'updateSourceElementOnDestroy' );
		// Cache the data and editable DOM elements, then destroy.
		// It's safe to assume that the model->view conversion will not work after `super.destroy()`,
		// same as `ui.getEditableElement()` method will not return editables.
		const data: Record<string, string> = {};

		if ( this.sourceElements ) {
			for ( const rootName of Object.keys( this.sourceElements ) ) {
				data[ rootName ] = shouldUpdateSourceElement ? this.getData( { rootName } ) : '';
			}
		}

		this.ui.destroy();

		return super.destroy()
			.then( () => {
				if ( this.sourceElements ) {
					for ( const rootName of Object.keys( this.sourceElements ) ) {
						setDataInElement( this.sourceElements[ rootName ], data[ rootName ] );
					}
				}
			} );
	}

	/**
	 * Creates a new multi-root editor instance.
	 *
	 * **Note:** remember that `MultiRootEditor` does not append the toolbar element to your web page, so you have to do it manually
	 * after the editor has been initialized.
	 *
	 * There are a few different ways to initialize the multi-root editor.
	 *
	 * # Using existing DOM elements:
	 *
	 * ```ts
	 * MultiRootEditor.create( {
	 * 	intro: document.querySelector( '#editor-intro' ),
	 * 	content: document.querySelector( '#editor-content' ),
	 * 	sidePanelLeft: document.querySelector( '#editor-side-left' ),
	 * 	sidePanelRight: document.querySelector( '#editor-side-right' ),
	 * 	outro: document.querySelector( '#editor-outro' )
	 * } )
	 * .then( editor => {
	 * 	console.log( 'Editor was initialized', editor );
	 *
	 * 	// Append the toolbar inside a provided DOM element.
	 * 	document.querySelector( '#toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
	 * } )
	 * .catch( err => {
	 * 	console.error( err.stack );
	 * } );
	 * ```
	 *
	 * The elements' content will be used as the editor data and elements will become editable elements.
	 *
	 * # Creating a detached editor
	 *
	 * Alternatively, you can initialize the editor by passing the initial data directly as strings.
	 * In this case, you will have to manually append both the toolbar element and the editable elements to your web page.
	 *
	 * ```ts
	 * MultiRootEditor.create( {
	 * 	intro: '<p><strong>Exciting</strong> intro text to an article.</p>',
	 * 	content: '<p>Lorem ipsum dolor sit amet.</p>',
	 * 	sidePanelLeft: '<blockquote>Strong quotation from article.</blockquote>',
	 * 	sidePanelRight: '<p>List of similar articles...</p>',
	 * 	outro: '<p>Closing text.</p>'
	 * } )
	 * .then( editor => {
	 * 	console.log( 'Editor was initialized', editor );
	 *
	 * 	// Append the toolbar inside a provided DOM element.
	 * 	document.querySelector( '#toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
	 *
	 * 	// Append DOM editable elements created by the editor.
	 * 	const editables = editor.ui.view.editables;
	 * 	const container = document.querySelector( '#editable-container' );
	 *
	 * 	container.appendChild( editables.intro.element );
	 * 	container.appendChild( editables.content.element );
	 * 	container.appendChild( editables.outro.element );
	 * } )
	 * .catch( err => {
	 * 	console.error( err.stack );
	 * } );
	 * ```
	 *
	 * This lets you dynamically append the editor to your web page whenever it is convenient for you. You may use this method if your
	 * web page content is generated on the client side and the DOM structure is not ready at the moment when you initialize the editor.
	 *
	 * # Using an existing DOM element (and data provided in `config.initialData`)
	 *
	 * You can also mix these two ways by providing a DOM element to be used and passing the initial data through the configuration:
	 *
	 * ```ts
	 * MultiRootEditor.create( {
	 * 	intro: document.querySelector( '#editor-intro' ),
	 * 	content: document.querySelector( '#editor-content' ),
	 * 	sidePanelLeft: document.querySelector( '#editor-side-left' ),
	 * 	sidePanelRight: document.querySelector( '#editor-side-right' ),
	 * 	outro: document.querySelector( '#editor-outro' )
	 * }, {
	 * 	initialData: {
	 * 		intro: '<p><strong>Exciting</strong> intro text to an article.</p>',
	 * 		content: '<p>Lorem ipsum dolor sit amet.</p>',
	 * 		sidePanelLeft '<blockquote>Strong quotation from article.</blockquote>':
	 * 		sidePanelRight '<p>List of similar articles...</p>':
	 * 		outro: '<p>Closing text.</p>'
	 * 	}
	 * } )
	 * .then( editor => {
	 * 	console.log( 'Editor was initialized', editor );
	 *
	 * 	// Append the toolbar inside a provided DOM element.
	 * 	document.querySelector( '#toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
	 * } )
	 * .catch( err => {
	 * 	console.error( err.stack );
	 * } );
	 * ```
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
	 * (for example – `@ckeditor/ckeditor5-build-multi-root`).
	 *
	 * If you want to use the multi-root editor from source (`@ckeditor/ckeditor5-editor-multi-root-editor/src/multirooteditor`),
	 * you need to define the list of
	 * {@link module:core/editor/editorconfig~EditorConfig#plugins plugins to be initialized} and
	 * {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar items}. Read more about using the editor from
	 * source in the {@glink installation/advanced/alternative-setups/integrating-from-source-webpack dedicated guide}.
	 *
	 * @param sourceElementsOrData The DOM elements that will be the source for the created editor
	 * or the editor's initial data. The editor will initialize multiple roots with names according to the keys in the passed object.
	 *
	 * If DOM elements are passed, their content will be automatically loaded to the editor upon initialization and the elements will be
	 * used as the editor's editable areas. The editor data will be set back to the original element once the editor is destroyed if the
	 * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy updateSourceElementOnDestroy} option
	 * is set to `true`.
	 *
	 * If the initial data is passed, a detached editor will be created. For each entry in the passed object, one editor root and one
	 * editable DOM element will be created. You will need to attach the editable elements into the DOM manually. The elements are available
	 * through the {@link module:editor-multi-root/multirooteditorui~MultiRootEditorUI#getEditableElement `editor.ui.getEditableElement()`}
	 * method.
	 * @param config The editor configuration.
	 * @returns A promise resolved once the editor is ready. The promise resolves with the created editor instance.
	 */
	public static override create(
		sourceElementsOrData: Record<string, HTMLElement> | Record<string, string>,
		config: EditorConfig = {}
	): Promise<MultiRootEditor> {
		return new Promise( resolve => {
			for ( const sourceItem of Object.values( sourceElementsOrData ) ) {
				if ( isElement( sourceItem ) && sourceItem.tagName === 'TEXTAREA' ) {
					// Documented in core/editor/editor.js
					// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
					throw new CKEditorError( 'editor-wrong-element', null );
				}
			}

			const editor = new this( sourceElementsOrData, config );

			resolve(
				editor.initPlugins()
					.then( () => editor.ui.init() )
					.then( () => editor.data.init( editor.config.get( 'initialData' )! ) )
					.then( () => editor.fire<EditorReadyEvent>( 'ready' ) )
					.then( () => editor )
			);
		} );
	}

	/**
	 * The {@link module:core/context~Context} class.
	 *
	 * Exposed as static editor field for easier access in editor builds.
	 */
	public static Context = Context;

	/**
	 * The {@link module:watchdog/editorwatchdog~EditorWatchdog} class.
	 *
	 * Exposed as static editor field for easier access in editor builds.
	 */
	public static EditorWatchdog = EditorWatchdog;

	/**
	 * The {@link module:watchdog/contextwatchdog~ContextWatchdog} class.
	 *
	 * Exposed as static editor field for easier access in editor builds.
	 */
	public static ContextWatchdog = ContextWatchdog;
}

function getInitialData( sourceElementOrData: HTMLElement | string ): string {
	return isElement( sourceElementOrData ) ? getDataFromElement( sourceElementOrData ) : sourceElementOrData;
}

function isElement( value: any ): value is Element {
	return _isElement( value );
}
