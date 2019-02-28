/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document, window */

// Multiroot editor dependencies.
import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';
import normalizeToolbarConfig from '@ckeditor/ckeditor5-ui/src/toolbar/normalizetoolbarconfig';
import { enablePlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';
import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/editoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import Template from '@ckeditor/ckeditor5-ui/src/template';

// Editor sample dependencies.
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import List from '@ckeditor/ckeditor5-list/src/list';
import Link from '@ckeditor/ckeditor5-link/src/link';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

/**
 * The multiroot editor implementation. It provides an inline editables and a toolbar.
 *
 * Unlike other editors, the toolbar is not rendered automatically and needs to be attached to the DOM manually.
 *
 * This type of an editor is dedicated to integrations which require a customized UI with an open
 * structure, allowing developers to specify the exact location of the interface.
 *
 * @mixes module:core/editor/utils/dataapimixin~DataApiMixin
 * @implements module:core/editor/editorwithui~EditorWithUI
 * @extends module:core/editor/editor~Editor
 */
class MultirootEditor extends Editor {
	/**
	 * Creates an instance of the multiroot editor.
	 *
	 * **Note:** Do not use the constructor to create editor instances. Use the static `MultirootEditor.create()` method instead.
	 *
	 * @protected
	 * @param {Object.<String,HTMLElement>} sourceElements The list of DOM elements that will be the source
	 * for the created editor (on which the editor will be initialized).
	 * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
	 */
	constructor( sourceElements, config ) {
		super( config );

		this.data.processor = new HtmlDataProcessor();

		// Create root and UIView element for each editable container.
		for ( const rootName of Object.keys( sourceElements ) ) {
			this.model.document.createRoot( '$root', rootName );
		}

		this.ui = new MultirootEditorUI( this, new MultirootEditorUIView( this.locale, this.editing.view, sourceElements ) );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		// Cache the data and editable DOM elements, then destroy.
		// It's safe to assume that the model->view conversion will not work after super.destroy(),
		// same as `ui.getEditableElement()` method will not return editables.
		const data = {};
		const editables = {};
		const editablesNames = Array.from( this.ui.getEditableElementsNames() );

		for ( const rootName of editablesNames ) {
			data[ rootName ] = this.getData( { rootName } );
			editables[ rootName ] = this.ui.getEditableElement( rootName );
		}

		this.ui.destroy();

		return super.destroy()
			.then( () => {
				for ( const rootName of editablesNames ) {
					setDataInElement( editables[ rootName ], data[ rootName ] );
				}
			} );
	}

	/**
	 * Creates a multiroot editor instance.
	 *
	 * @param {Object.<String,HTMLElement>} sourceElements The list of DOM elements that will be the source
	 * for the created editor (on which the editor will be initialized).
	 * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
	 * @returns {Promise} A promise resolved once the editor is ready. The promise returns the created multiroot editor instance.
	 */
	static create( sourceElements, config ) {
		return new Promise( resolve => {
			const editor = new this( sourceElements, config );

			resolve(
				editor.initPlugins()
					.then( () => editor.ui.init() )
					.then( () => {
						const initialData = {};

						// Create initial data object containing data from all roots.
						for ( const rootName of Object.keys( sourceElements ) ) {
							initialData[ rootName ] = getDataFromElement( sourceElements[ rootName ] );
						}

						return editor.data.init( initialData );
					} )
					.then( () => editor.fire( 'ready' ) )
					.then( () => editor )
			);
		} );
	}
}

mix( MultirootEditor, DataApiMixin );

/**
 * The multiroot editor UI class.
 *
 * @extends module:core/editor/editorui~EditorUI
 */
class MultirootEditorUI extends EditorUI {
	/**
	 * Creates an instance of the multiroot editor UI class.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {module:ui/editorui/editoruiview~EditorUIView} view The view of the UI.
	 */
	constructor( editor, view ) {
		super( editor );

		/**
		 * The main (top–most) view of the editor UI.
		 *
		 * @readonly
		 * @member {module:ui/editorui/editoruiview~EditorUIView} #view
		 */
		this.view = view;

		/**
		 * A normalized `config.toolbar` object.
		 *
		 * @type {Object}
		 * @private
		 */
		this._toolbarConfig = normalizeToolbarConfig( editor.config.get( 'toolbar' ) );
	}

	/**
	 * Initializes the UI.
	 */
	init() {
		const view = this.view;
		const editor = this.editor;
		const editingView = editor.editing.view;

		view.render();

		for ( const editable of this.view.editables ) {
			// The editable UI element in DOM is available for sure only after the editor UI view has been rendered.
			// But it can be available earlier if a DOM element has been passed to DecoupledEditor.create().
			const editableElement = editable.element;

			// Register the editable UI view in the editor. A single editor instance can aggregate multiple
			// editable areas (roots) but the decoupled editor has only one.
			this._editableElements.set( editable.name, editableElement );

			// Let the global focus tracker know that the editable UI element is focusable and
			// belongs to the editor. From now on, the focus tracker will sustain the editor focus
			// as long as the editable is focused (e.g. the user is typing).
			this.focusTracker.add( editableElement );

			// Let the editable UI element respond to the changes in the global editor focus
			// tracker. It has been added to the same tracker a few lines above but, in reality, there are
			// many focusable areas in the editor, like balloons, toolbars or dropdowns and as long
			// as they have focus, the editable should act like it is focused too (although technically
			// it isn't), e.g. by setting the proper CSS class, visually announcing focus to the user.
			// Doing otherwise will result in editable focus styles disappearing, once e.g. the
			// toolbar gets focused.
			editable.bind( 'isFocused' ).to( this.focusTracker );

			// Bind the editable UI element to the editing view, making it an end– and entry–point
			// of the editor's engine. This is where the engine meets the UI.
			editingView.attachDomRoot( editableElement, editable.name );
		}

		this._initPlaceholder();
		this._initToolbar();
		this.fire( 'ready' );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		const view = this.view;
		const editingView = this.editor.editing.view;

		for ( const editable of this.view.editables ) {
			editingView.detachDomRoot( editable.name );
		}

		view.destroy();

		super.destroy();
	}

	/**
	 * Initializes the inline editor toolbar and its panel.
	 *
	 * @private
	 */
	_initToolbar() {
		const editor = this.editor;
		const view = this.view;
		const toolbar = view.toolbar;

		toolbar.fillFromConfig( this._toolbarConfig.items, this.componentFactory );

		enableToolbarKeyboardFocus( {
			origin: editor.editing.view,
			originFocusTracker: this.focusTracker,
			originKeystrokeHandler: editor.keystrokes,
			toolbar
		} );
	}

	/**
	 * Enable the placeholder text on the editing root, if any was configured.
	 *
	 * @private
	 */
	_initPlaceholder() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		for ( const editable of this.view.editables ) {
			const editingRoot = editingView.document.getRoot( editable.name );
			const sourceElement = this.getEditableElement( editable.name );

			const placeholderText = editor.config.get( 'placeholder' ) ||
				sourceElement && sourceElement.tagName.toLowerCase() === 'textarea' && sourceElement.getAttribute( 'placeholder' );

			if ( placeholderText ) {
				enablePlaceholder( {
					view: editingView,
					element: editingRoot,
					text: placeholderText,
					isDirectHost: false
				} );
			}
		}
	}
}

/**
 * The multiroot editor UI view. It is a virtual view providing an inline editable, but without
 * any specific arrangement of the components in the DOM.
 *
 * @extends module:ui/editorui/editoruiview~EditorUIView
 */
class MultirootEditorUIView extends EditorUIView {
	/**
	 * Creates an instance of the multiroot editor UI view.
	 *
	 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param {module:engine/view/view~View} editingView The editing view instance this view is related to.
	 * @param {Object.<String,HTMLElement>} editableElements The list of editable elements, containing name and html element
	 * for each editable.
	 */
	constructor( locale, editingView, editableElements ) {
		super( locale );

		/**
		 * The main toolbar of the decoupled editor UI.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this.toolbar = new ToolbarView( locale );

		/**
		 * The editables of the multiroot editor UI.
		 *
		 * @readonly
		 * @member {Array.<module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView>}
		 */
		this.editables = [];

		// Create InlineEditableUIView instance for each editable.
		for ( const editableName of Object.keys( editableElements ) ) {
			const editable = new InlineEditableUIView( locale, editingView, editableElements[ editableName ] );

			editable.name = editableName;
			this.editables.push( editable );
		}

		// This toolbar may be placed anywhere in the page so things like font size need to be reset in it.
		// Also because of the above, make sure the toolbar supports rounded corners.
		Template.extend( this.toolbar.template, {
			attributes: {
				class: [
					'ck-reset_all',
					'ck-rounded-corners'
				]
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.registerChild( this.editables );
		this.registerChild( [ this.toolbar ] );
	}
}

// Initialize editor
MultirootEditor
	.create( {
		header: document.querySelector( '#header' ),
		content: document.querySelector( '#content' ),
		footerleft: document.querySelector( '#footer-left' ),
		footerright: document.querySelector( '#footer-right' )
	}, {
		plugins: [ Essentials, Paragraph, Heading, Bold, Italic, List, Link, BlockQuote, Image, ImageCaption,
			ImageStyle, ImageToolbar, ImageUpload, Table, TableToolbar, MediaEmbed, EasyImage ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'imageUpload', 'blockQuote',
			'insertTable', 'mediaEmbed', 'undo', 'redo' ],
		image: {
			toolbar: [ 'imageTextAlternative', '|', 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight' ],
			styles: [ 'full', 'alignLeft', 'alignRight' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		placeholder: 'Type your text here...',
		cloudServices: CS_CONFIG
	} )
	.then( newEditor => {
		document.querySelector( '#toolbar' ).appendChild( newEditor.ui.view.toolbar.element );

		window.editor = newEditor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

