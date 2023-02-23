---
category: examples-framework
order: 110
toc: false
classes: main__content--no-toc
---

# Multi-root editor

The main difference between a multi-root editor and using multiple separate editors (like in the {@link examples/builds/inline-editor inline editor demo}) is the fact that in a multi-root editor all editable areas belong to the same editor instance, share the same toolbar and create one undo stack.

Out of the box, CKEditor 5 does not offer a ready-to-use multi-root editor yet. However, such an editor can be implemented by using the {@link framework/index CKEditor 5 Framework}.

Check out the {@link framework/custom-editor-creator "Implementing a custom editor creator" guide} which contains the source code of the demo below.

{@snippet examples/multi-root-editor}

## Editor example configuration

<details>
<summary>View editor configuration script</summary>

```js
// Multiroot editor dependencies.
import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';
import EditorUI from '@ckeditor/ckeditor5-ui/src/editorui/editorui';
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
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
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
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';

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
class MultirootEditor extends DataApiMixin( Editor ) {
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

		if ( this.config.get( 'initialData' ) === undefined ) {
			// Create initial data object containing data from all roots.
			const initialData = {};

			for ( const rootName of Object.keys( sourceElements ) ) {
				initialData[ rootName ] = getDataFromElement( sourceElements[ rootName ] );
			}

			this.config.set( 'initialData', initialData );
		}

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
					.then( () => editor.data.init( editor.config.get( 'initialData' ) ) )
					.then( () => editor.fire( 'ready' ) )
					.then( () => editor )
			);
		} );
	}
}

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
	}

	/**
	 * Initializes the UI.
	 */
	init() {
		const view = this.view;
		const editor = this.editor;
		const editingView = editor.editing.view;

		let lastFocusedEditableElement;

		view.render();

		// Keep track of the last focused editable element. Knowing which one was focused
		// is useful when the focus moves from editable to other UI components like balloons
		// (especially inputs) but the editable remains the "focus context" (e.g. link balloon
		// attached to a link in an editable). In this case, the editable should preserve visual
		// focus styles.
		this.focusTracker.on( 'change:focusedElement', ( evt, name, focusedElement ) => {
			for ( const editable of this.view.editables ) {
				if ( editable.element === focusedElement ) {
					lastFocusedEditableElement = editable.element;
				}
			}
		} );

		// If the focus tracker loses focus, stop tracking the last focused editable element.
		// Wherever the focus is restored, it will no longer be in the context of that editable
		// because the focus "came from the outside", as opposed to the focus moving from one element
		// to another within the editor UI.
		this.focusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => {
			if ( !isFocused ) {
				lastFocusedEditableElement = null;
			}
		} );

		for ( const editable of this.view.editables ) {
			// The editable UI element in DOM is available for sure only after the editor UI view has been rendered.
			// But it can be available earlier if a DOM element has been passed to DecoupledEditor.create().
			const editableElement = editable.element;

			// Register the editable UI view in the editor. A single editor instance can aggregate multiple
			// editable areas (roots) but the decoupled editor has only one.
			this.setEditableElement( editable.name, editableElement );

			// Let the editable UI element respond to the changes in the global editor focus
			// tracker. It has been added to the same tracker a few lines above but, in reality, there are
			// many focusable areas in the editor, like balloons, toolbars or dropdowns and as long
			// as they have focus, the editable should act like it is focused too (although technically
			// it isn't), e.g. by setting the proper CSS class, visually announcing focus to the user.
			// Doing otherwise will result in editable focus styles disappearing, once e.g. the
			// toolbar gets focused.
			editable.bind( 'isFocused' ).to( this.focusTracker, 'isFocused', this.focusTracker, 'focusedElement',
				( isFocused, focusedElement ) => {
					// When the focus tracker is blurred, it means the focus moved out of the editor UI.
					// No editable will maintain focus then.
					if ( !isFocused ) {
						return false;
					}

					// If the focus tracker says the editor UI is focused and currently focused element
					// is the editable, then the editable should be visually marked as focused too.
					if ( focusedElement === editableElement ) {
						return true;
					}
					// If the focus tracker says the editor UI is focused but the focused element is
					// not an editable, it is possible that the editable is still (context–)focused.
					// For instance, the focused element could be an input inside of a balloon attached
					// to the content in the editable. In such case, the editable should remain _visually_
					// focused even though technically the focus is somewhere else. The focus moved from
					// the editable to the input but the focus context remained the same.
					else {
						return lastFocusedEditableElement === editableElement;
					}
				} );

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
		super.destroy();

		const view = this.view;
		const editingView = this.editor.editing.view;

		for ( const editable of this.view.editables ) {
			editingView.detachDomRoot( editable.name );
		}

		view.destroy();
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

		toolbar.fillFromConfig( editor.config.get( 'toolbar' ), this.componentFactory );

		// Register the toolbar so it becomes available for Alt+F10 and Esc navigation.
		this.addToolbar( view.toolbar );
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

			const placeholderText = editor.config.get( 'placeholder' )[ editable.name ] ||
				sourceElement && sourceElement.tagName.toLowerCase() === 'textarea' && sourceElement.getAttribute( 'placeholder' );

			if ( placeholderText ) {
				enablePlaceholder( {
					view: editingView,
					element: editingRoot,
					text: placeholderText,
					isDirectHost: false,
					keepOnFocus: true
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

		const t = locale.t;

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
			const editable = new InlineEditableUIView( locale, editingView, editableElements[ editableName ], {
				label: editableView => {
					return t( 'Rich Text Editor. Editing area: %0', editableView.name );
				}
			} );

			editable.name = editableName;
			this.editables.push( editable );
		}

		// This toolbar may be placed anywhere in the page so things like font size need to be reset in it.
		// Because of the above, make sure the toolbar supports rounded corners.
		// Also, make sure the toolbar has the proper dir attribute because its ancestor may not have one
		// and some toolbar item styles depend on this attribute.
		Template.extend( this.toolbar.template, {
			attributes: {
				class: [
					'ck-reset_all',
					'ck-rounded-corners'
				],
				dir: locale.uiLanguageDirection
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
		plugins: [
			Essentials, Paragraph, Heading, Bold, Italic, List, Link, BlockQuote, Image, ImageCaption,
			ImageStyle, ImageToolbar, ImageUpload, Table, TableToolbar, MediaEmbed, EasyImage, CloudServices, FindAndReplace
		],
		toolbar: [
			'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'uploadImage', 'blockQuote',
			'insertTable', 'mediaEmbed', 'findAndReplace', 'undo', 'redo' ],
		image: {
			toolbar: [
				'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		placeholder: {
			header: 'Header text goes here',
			content: 'Type content here',
			footerleft: 'Left footer content',
			footerright: 'Right footer content'
		},
		cloudServices: {
			// This editor configuration includes the Easy Image feature.
			// Provide correct configuration values to use it.
			tokenUrl: 'https://example.com/cs-token-endpoint',
			uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/'
			// Read more about Easy Image - https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/easy-image.html.
			// For other image upload methods see the guide - https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html.
		}
	} )
	.then( newEditor => {
		document.querySelector( '#toolbar' ).appendChild( newEditor.ui.view.toolbar.element );

		window.editor = newEditor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

</details>

<details>
<summary>View editor content listing</summary>

```
<div id="snippet-multiroot-editor">
	<div id="toolbar"></div>

	<header id="header">
		Header content is inserted here.
	</header>

	<div id="content">
		Editor content is inserted here.
	</div>

	<div id="footer-left">
		Editor content is inserted here.
	</div>

	<div id="footer-right">
		Editor content is inserted here.
	</div>
</div>

<style>
	/* Give the toolbar some space so it does not look like it belongs to the header root only. */
	#snippet-multiroot-editor #toolbar {
		margin-bottom: 1em;
	}
</style>
```

</details>
