---
menu-title: Creating custom editor
category: framework-deep-dive-ui
order: 40
---

# Implementing a custom editor creator

The flexible architecture of CKEditor 5 allows creating completely custom editors. Not only the {@link examples/theme-customization theme styling can be changed} or the {@link examples/custom-ui UI redesigned} but also the entire editor initialization process can be modified allowing to create new editor types. Thanks to that, apart from the standard editors (like {@link examples/builds/classic-editor classic}, {@link examples/builds/inline-editor inline}, {@link examples/builds/balloon-editor balloon} or {@link examples/builds/document-editor document}), custom types like a {@link examples/framework/multi-root-editor **multi-root editor**} can be created.

This guide goes through the process of implementing a custom, multi-root editor. You can check out the {@link examples/framework/multi-root-editor demo of the multi-root editor} too.

## Editor class

The `*Editor` class is the main class of each editor type. It initializes the whole editor and its UI parts. The custom creator class should extend the {@link module:core/editor/editor~Editor base `Editor` class}. In case of a multi-root editor it may look like below:

```js
import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * The multi-root editor implementation. It provides inline editables and a single toolbar.
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
	 * Creates an instance of the multi-root editor.
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

		this.data.processor = new HtmlDataProcessor( this.data.viewDocument );

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
	 * Creates a multi-root editor instance.
	 *
	 * @param {Object.<String,HTMLElement>} sourceElements The list of DOM elements that will be the source
	 * for the created editor (on which the editor will be initialized).
	 * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
	 * @returns {Promise} A promise resolved once the editor is ready. The promise returns the created multi-root editor instance.
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
```

## EditorUI class

The `*EditorUI` class is the main UI class which initializes UI components (the main view and the toolbar) and sets up mechanisms like focus tracker or placeholder management. The custom `*EditorUI` class should extend the {@link module:core/editor/editorui~EditorUI base `EditorUI` class} like below:

```js
import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';
import normalizeToolbarConfig from '@ckeditor/ckeditor5-ui/src/toolbar/normalizetoolbarconfig';
import { enablePlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';

/**
 * The multi-root editor UI class.
 *
 * @extends module:core/editor/editorui~EditorUI
 */
class MultirootEditorUI extends EditorUI {
	/**
	 * Creates an instance of the multi-root editor UI class.
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
		// to another withing the editor UI.
		this.focusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => {
			if ( !isFocused ) {
				lastFocusedEditableElement = null;
			}
		} );

		for ( const editable of this.view.editables ) {
			// The editable UI element in DOM is available for sure only after the editor UI view has been rendered.
			// But it can be available earlier if a DOM element has been passed to MultirootEditor.create().
			const editableElement = editable.element;

			// Register each editable UI view in the editor.
			this.setEditableElement( editable.name, editableElement );

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
		const view = this.view;
		const editingView = this.editor.editing.view;

		for ( const editable of this.view.editables ) {
			editingView.detachDomRoot( editable.name );
		}

		view.destroy();

		super.destroy();
	}

	/**
	 * Initializes the editor main toolbar and its panel.
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

			const placeholderText = editor.config.get( 'placeholder' )[ editable.name ] ||
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
```

## EditorUIView class

Finally, the `*EditorUIView` class is responsible for registering and handling all editables and creating the editor toolbar. The custom `*EditorUIView` class should extend the {@link module:ui/editorui/editoruiview~EditorUIView base `EditorUIView` class}:

```js
import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/editoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import Template from '@ckeditor/ckeditor5-ui/src/template';

/**
 * The multi-root editor UI view. It is a virtual view providing an inline editable, but without
 * any specific arrangement of the components in the DOM.
 *
 * @extends module:ui/editorui/editoruiview~EditorUIView
 */
class MultirootEditorUIView extends EditorUIView {
	/**
	 * Creates an instance of the multi-root editor UI view.
	 *
	 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param {module:engine/view/view~View} editingView The editing view instance this view is related to.
	 * @param {Object.<String,HTMLElement>} editableElements The list of editable elements, containing name and html element
	 * for each editable.
	 */
	constructor( locale, editingView, editableElements ) {
		super( locale );

		/**
		 * The main toolbar of the multi-root editor UI.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this.toolbar = new ToolbarView( locale );

		/**
		 * The editables of the multi-root editor UI.
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
```

## Initializing custom editor instance

Now with the multi-root editor creator ready, the fully usable editor instance can be created.

With HTML like:

```html
<div id="toolbar"></div>

<header id="header">
	<h2>Gone traveling</h2>
	<h3>Monthly travel news and inspiration</h3>
</header>

<div id="content">
	<h3>Destination of the Month</h3>

	<h4>Valletta</h4>

	<figure class="image image-style-align-right">
		<img alt="Picture of a sunlit facade of a Maltan building." src="%BASE_PATH%/assets/img/malta.jpg">
		<figcaption>It's siesta time in Valletta.</figcaption>
	</figure>

	<p>The capital city of <a href="https://en.wikipedia.org/wiki/Malta" target="_blank" rel="external">Malta</a> is the top destination this summer. It’s home to a cutting-edge contemporary architecture, baroque masterpieces, delicious local cuisine and at least 8 months of sun. It’s also a top destination for filmmakers, so you can take a tour through locations familiar to you from Game of Thrones, Gladiator, Troy and many more.</p>
</div>

<div class="demo-row">
	<div class="demo-row__half">
		<div id="footer-left">
			<h3>The three greatest things you learn from traveling</h3>
			<p><a href="#">Find out more</a></p>
		</div>
	</div>

	<div class="demo-row__half">
		<div id="footer-right">
			<h3>Walking the capitals of Europe: Warsaw</h3>
			<p><a href="#">Find out more</a></p>
		</div>
	</div>
</div>
```

The editor can be initialized with the code below:

```js
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
		placeholder: {
			header: 'Header text goes here',
			content: 'Type content here',
			footerleft: 'Left footer content',
			footerright: 'Right footer content'
		},
	} )
	.then( newEditor => {
		document.querySelector( '#toolbar' ).appendChild( newEditor.ui.view.toolbar.element );

		window.editor = newEditor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

This will create the exact same editor as the one used on the {@link examples/framework/multi-root-editor multi-root editor editor example page}.
