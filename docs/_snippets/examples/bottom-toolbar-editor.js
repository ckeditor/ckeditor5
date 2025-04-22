/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	Plugin, IconFontColor, Font, Indent, List, Alignment, Autoformat, BlockQuote, DropdownView,
	ToolbarView, createDropdown, EasyImage, Essentials, Heading, HorizontalLine, Image,
	ImageInsert, ImageCaption, ImageStyle, ImageToolbar, ImageUpload, ImageResize, Link,
	MediaEmbed, Paragraph, RemoveFormat, Bold, Italic, Strikethrough, Superscript, Subscript,
	Underline, Table, TableToolbar
} from 'ckeditor5';
import {
	CS_CONFIG,
	DecoupledEditor,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';

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
			const dropdownView = createDropdown( locale );
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
			const focusableElements = [
				...[ ...editor.ui.getEditableElementsNames() ].map( name => editor.ui.getEditableElement( name ) ),
				document.querySelector( '.ck-body-wrapper' )
			];

			focusableElements.forEach( el => dropdownView.focusTracker.add( el ) );

			// Using the font color icon to visually represent the formatting.
			dropdownView.buttonView.set( {
				tooltip: t( 'Formatting options' ),
				icon: IconFontColor
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
			ImageInsert,
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
			'insertImage',
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
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;

		document
			.querySelector( '#editor-toolbar-container' )
			?.appendChild( editor.ui.view.toolbar.element );

		overrideDropdownPositionsToNorth( editor, editor.ui.view.toolbar );
		overrideDropdownPositionsToNorth( editor, editor.plugins.get( 'FormattingOptions' ).toolbarView );

		overrideTooltipPositions( editor.ui.view.toolbar );
		overrideTooltipPositions( editor.plugins.get( 'FormattingOptions' ).toolbarView );

		attachTourBalloon( {
			target: findToolbarItem(
				editor.ui.view.toolbar,
				item => item.label && item.label === 'Formatting options'
			),
			text: 'Click to open formatting options.',
			editor,
			tippyOptions: {
				placement: 'top-start'
			}
		} );
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
