---
category: examples-framework
order: 70
classes: main__content--no-toc
toc: false
meta-title: Bottom toolbar with button grouping example | CKEditor 5 Documentation
menu-title: Bottom toolbar with button grouping
modified_at: 2021-12-09
---

# Editor with a bottom toolbar and button grouping

The following custom editor example showcases an editor instance with the main toolbar displayed at the bottom of the editing window. To make it possible, this example uses the {@link module:editor-decoupled/decouplededitor~DecoupledEditor `DecoupledEditor`} with the {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#toolbar main toolbar} injected after the editing root into the DOM. Learn more about the {@link framework/document-editor decoupled UI in CKEditor&nbsp;5} to find out the details of this process.

Additionally, thanks to the flexibility offered by the {@link framework/architecture/ui-library CKEditor&nbsp;5 UI framework}, the main toolbar has been uncluttered by moving buttons related to text formatting into the custom "Formatting options" dropdown. All remaining dropdown and (button) tooltips have been tuned to open upward for the best user experience. Similar effect can also be achieved by using the {@link getting-started/setup/toolbar#grouping-toolbar-items-in-dropdowns-nested-toolbars built-in toolbar grouping option}.

The presented combination of the UI and editor's features works best for integrations where text creation comes first and formatting is applied occasionally. Some examples are email applications, (forum) post editors, chats, or instant messaging. You can probably recognize this UI setup from popular applications such as Gmail, Slack, or Zendesk.

{@snippet examples/bottom-toolbar-editor}

## Editor example configuration

<details>
<summary>View editor configuration script</summary>

```js

import {
	DecoupledEditor,
	Plugin,
	Alignment,
	Autoformat,
	Bold,
	Italic,
	Strikethrough,
	Subscript,
	Superscript,
	Underline,
	BlockQuote,
	clickOutsideHandler,
	Essentials,
	Font,
	Heading,
	HorizontalLine,
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	RemoveFormat,
	Table,
	TableToolbar,
	DropdownButtonView,
	DropdownPanelView,
	DropdownView,
	ToolbarView
} from 'ckeditor5';
import { EasyImage } from 'ckeditor5-premium-features';
import fontColorIcon from '@ckeditor/ckeditor5-font/theme/icons/font-color.svg';

class FormattingOptions extends Plugin {
	/**
	* @inheritDoc
	*/
	static get pluginName() {
		return 'FormattingOptions';
	}

	/**
	* @inheritDoc
	*/
	constructor( editor ) {
		super( editor );

		editor.ui.componentFactory.add( 'formattingOptions', locale => {
			const t = locale.t;
			const buttonView = new DropdownButtonView( locale );
			const panelView = new DropdownPanelView( locale );
			const dropdownView = new DropdownView( locale, buttonView, panelView );
			const toolbarView = this.toolbarView = dropdownView.toolbarView = new ToolbarView( locale );

			// Accessibility: Give the toolbar a human-readable ARIA label.
			toolbarView.set( {
				ariaLabel: t( 'Formatting options toolbar' )
			} );

			// Accessibility: Give the dropdown a human-readable ARIA label.
			dropdownView.set( {
				label: t( 'Formatting options' )
			} );

			// Toolbars in dropdowns need specific styling, hence the class.
			dropdownView.extendTemplate( {
				attributes: {
					class: [ 'ck-toolbar-dropdown' ]
				}
			} );

			// Accessibility: If the dropdown panel is already open, the arrow down key should focus the first child of the #panelView.
			dropdownView.keystrokes.set( 'arrowdown', ( data, cancel ) => {
				if ( dropdownView.isOpen ) {
					toolbarView.focus();
					cancel();
				}
			} );

			// Accessibility: If the dropdown panel is already open, the arrow up key should focus the last child of the #panelView.
			dropdownView.keystrokes.set( 'arrowup', ( data, cancel ) => {
				if ( dropdownView.isOpen ) {
					toolbarView.focusLast();
					cancel();
				}
			} );

			// The formatting options should not close when the user clicked:
			// * the dropdown or it contents,
			// * any editing root,
			// * any floating UI in the "body" collection
			// It should close, for instance, when another (main) toolbar button was pressed, though.
			dropdownView.on( 'render', () => {
				clickOutsideHandler( {
					emitter: dropdownView,
					activator: () => dropdownView.isOpen,
					callback: () => { dropdownView.isOpen = false; },
					contextElements: [
						dropdownView.element,
						...[ ...editor.ui.getEditableElementsNames() ].map( name => editor.ui.getEditableElement( name ) ),
						document.querySelector( '.ck-body-wrapper' )
					]
				} );
			} );

			// The main button of the dropdown should be bound to the state of the dropdown.
			buttonView.bind( 'isOn' ).to( dropdownView, 'isOpen' );
			buttonView.bind( 'isEnabled' ).to( dropdownView );

			// Using the font color icon to visually represent the formatting.
			buttonView.set( {
				tooltip: t( 'Formatting options' ),
				icon: fontColorIcon
			} );

			dropdownView.panelView.children.add( toolbarView );

			toolbarView.fillFromConfig(
				editor.config.get( 'formattingOptions' ),
				editor.ui.componentFactory
			);

			return dropdownView;
		} );
	}
}

DecoupledEditor
	.create( document.querySelector( '#editor-content' ), {
		plugins: [
			Alignment,
			Autoformat,
			BlockQuote,
			Bold,
			EasyImage,
			Essentials,
			Font,
			Heading,
			HorizontalLine,
			Image,
			ImageCaption,
			ImageResize,
			ImageStyle,
			ImageToolbar,
			ImageUpload,
			Indent,
			Italic,
			Link,
			List,
			MediaEmbed,
			Paragraph,
			RemoveFormat,
			Strikethrough,
			Subscript,
			Superscript,
			Table,
			TableToolbar,
			Underline,

			FormattingOptions
		],
		toolbar: [
			'undo',
			'redo',
			'|',
			'formattingOptions',
			'|',
			'link',
			'blockQuote',
			'uploadImage',
			'insertTable',
			'mediaEmbed',
			'horizontalLine',
			'|',
			{
				label: 'Lists',
				icon: false,
				items: [ 'bulletedList', 'numberedList', '|', 'outdent', 'indent' ]
			}
		],
		// Configuration of the formatting dropdown.
		formattingOptions: [
			'undo',
			'redo',
			'|',
			'fontFamily',
			'fontSize',
			'fontColor',
			'fontBackgroundColor',
			'|',
			'bold',
			'italic',
			'underline',
			'strikethrough',
			'|',
			'alignment',
			'|',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'removeFormat'
		],

		image: {
			resizeUnit: 'px',
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},

		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		cloudServices: {
			// This editor configuration includes the Easy Image feature.
			// Provide correct configuration values to use it.
			tokenUrl: 'https://example.com/cs-token-endpoint',
			uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/'
			// Read more about Easy Image - https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/easy-image.html.
			// For other image upload methods see the guide - https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html.
		},
	} )
	.then( editor => {
		window.editor = editor;

		const toolbarContainer = document.querySelector( '#editor-toolbar-container' );

		toolbarContainer.appendChild( editor.ui.view.toolbar.element );

		overrideDropdownPositionsToNorth( editor, editor.ui.view.toolbar );
		overrideDropdownPositionsToNorth( editor, editor.plugins.get( 'FormattingOptions' ).toolbarView );

		overrideTooltipPositions( editor.ui.view.toolbar );
		overrideTooltipPositions( editor.plugins.get( 'FormattingOptions' ).toolbarView );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

/**
 * Force all toolbar dropdown panels to use northern positions rather than southern (editor default).
 * This will position them correctly relative to the toolbar at the bottom of the editing root.
 *
 * @private
 * @param {module:core/editor/editor~Editor} editor
 * @param {module:ui/toolbar/toolbarview~ToolbarView} toolbarView
 */
function overrideDropdownPositionsToNorth( editor, toolbarView ) {
	const {
		south, north, southEast, southWest, northEast, northWest,
		southMiddleEast, southMiddleWest, northMiddleEast, northMiddleWest
	} = DropdownView.defaultPanelPositions;

	let panelPositions;

	if ( editor.locale.uiLanguageDirection !== 'rtl' ) {
		panelPositions = [
			northEast, northWest, northMiddleEast, northMiddleWest, north,
			southEast, southWest, southMiddleEast, southMiddleWest, south
		];
	} else {
		panelPositions = [
			northWest, northEast, northMiddleWest, northMiddleEast, north,
			southWest, southEast, southMiddleWest, southMiddleEast, south
		];
	}

	for ( const item of toolbarView.items ) {
		if ( !( item instanceof DropdownView ) ) {
			continue;
		}

		item.on( 'change:isOpen', () => {
			if ( !item.isOpen ) {
				return;
			}

			item.panelView.position = DropdownView._getOptimalPosition( {
				element: item.panelView.element,
				target: item.buttonView.element,
				fitInViewport: true,
				positions: panelPositions
			} ).name;
		} );
	}
}

/**
 * Forces all toolbar items to display tooltips to the north.
 * This will position them correctly relative to the toolbar at the bottom of the editing root.
 *
 * @param {module:ui/toolbar/toolbarview~ToolbarView} toolbarView
 */
function overrideTooltipPositions( toolbarView ) {
	for ( const item of toolbarView.items ) {
		if ( item.buttonView ) {
			item.buttonView.tooltipPosition = 'n';
		} else if ( item.tooltipPosition ) {
			item.tooltipPosition = 'n';
		}
	}
}

```

</details>

<details>
<summary>View editor content listing</summary>

```html
<style>
	#editor {
		display: flex;
		flex-direction: column;
	}

	#editor-content {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}

	#editor-content:not(.ck-focused) {
		border-color: var(--ck-color-base-border);
	}

	#editor-toolbar-container > .ck.ck-toolbar {
		border-top-width: 0;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	.ck.ck-content {
		font-family: Helvetica, Arial, sans-serif;
		padding: 3em 2em 2em;
	}

	.ck.ck-content h2 {
		border: 0;
		font-size: 1.3em;
		padding-top: 0.2em;
		padding-bottom: 0.2em;
		margin-bottom: 0.4em;
	}

	.ck.ck-content .ck-horizontal-line.ck-widget {
		text-align: center;
	}

	.ck.ck-content .ck-horizontal-line.ck-widget hr {
		margin: 5px auto;
		width: 50px;
		height: 1px;
		display: inline-block;
	}
</style>

<div id="editor">
	<div id="editor-content">
			Editor content is inserted here.
	</div>
	<div id="editor-toolbar-container"></div>
</div>

```

</details>
