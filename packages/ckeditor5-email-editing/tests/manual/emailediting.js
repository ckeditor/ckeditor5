/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, navigator, Blob, ClipboardItem, fetch */

import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document/src/ckeditor';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';

import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Font from '@ckeditor/ckeditor5-font/src/font';

// Required by Email editing
import PlainTableOutput from '@ckeditor/ckeditor5-table/src/plaintableoutput';
import ImageInline from '@ckeditor/ckeditor5-image/src/imageinline';

import EmailEditing from '@ckeditor/ckeditor5-email-editing/src/emailediting';
import InlineStyles from '@ckeditor/ckeditor5-email-editing/src/inlinestyles';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

class SendEmail extends Plugin {
	static get pluginName() {
		return 'SendEmail';
	}

	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'sendEmail', () => {
			const actionButton = new ButtonView();

			actionButton.set( {
				label: 'Send e-mail',
				withText: true,
				class: 'ck-button-action'
			} );

			actionButton.on( 'execute', () => {
				const toInput = document.querySelector( '#to-input' ).textContent;
				const subjectInput = document.querySelector( '#subject-input' ).textContent;
				const { dataWithInlineStyles, editorWidth } = editor.plugins.get( 'EmailEditing' ).getDataForEmail();

				const html = '<div style="background-color:#eaf0f6;padding: 25px 0;" bgColor="#eaf0f6">' +
					`<div style="background-color:#ffffff; margin: auto; max-width:${ editorWidth }px" bgColor="#ffffff">` +
						dataWithInlineStyles +
					'</div>' +
				'</div>';

				fetch( 'http://localhost:3000/send', {
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					method: 'POST',
					body: JSON.stringify( { to: toInput, subject: subjectInput, html } )
				} );
			} );

			return actionButton;
		} );
	}
}

DecoupledEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Alignment,
			Autoformat,
			Bold,
			Essentials,
			Heading,
			Indent,
			Italic,
			Link,
			List,
			Paragraph,
			Table,
			TableProperties,
			TableCellProperties,
			TableToolbar,
			TableCaption,
			Font,
			HorizontalLine,
			Underline,
			Strikethrough,
			Superscript,
			Subscript,

			EmailEditing,
			ImageInline,
			ImageStyle,
			ImageToolbar,
			ImageResize,
			PlainTableOutput,
			SendEmail,
			InlineStyles
		],
		toolbar: [
			'sendEmail', '|',
			'heading', '|',
			{
				label: 'Fonts',
				icon: 'text',
				items: [ 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor' ]
			},
			{
				label: 'Basic styles',
				icon: 'bold',
				items: [ 'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript' ]
			},
			'|', 'alignment', '|',
			{
				label: 'Lists',
				withText: true,
				icon: false,
				items: [ 'bulletedList', 'numberedList' ]
			},
			'|', 'insertTable', 'horizontalLine'
		],
		image: {
			resizeUnit: 'px'
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells',
				'tableProperties', 'tableCellProperties', 'toggleTableCaption'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		const toolbarContainer = document.querySelector( '#editor-toolbar-container' );

		toolbarContainer.appendChild( editor.ui.view.toolbar.element );

		overrideDropdownPositionsToNorth( editor, editor.ui.view.toolbar );

		overrideTooltipPositions( editor.ui.view.toolbar );

		const copyHtmlButton = document.querySelector( '#copy-html' );

		copyHtmlButton.addEventListener( 'click', async () => {
			const { dataWithInlineStyles } = editor.plugins.get( 'EmailEditing' ).getDataForEmail();

			const clipboardItem = new ClipboardItem( {
				'text/html': new Blob( [ dataWithInlineStyles ], { type: 'text/html' } ),
				'text/plain': new Blob( [ dataWithInlineStyles ], { type: 'text/plain' } )
			} );

			await navigator.clipboard.write( [ clipboardItem ] );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

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

function overrideTooltipPositions( toolbarView ) {
	for ( const item of toolbarView.items ) {
		if ( item.buttonView ) {
			item.buttonView.tooltipPosition = 'n';
		} else if ( item.tooltipPosition ) {
			item.tooltipPosition = 'n';
		}
	}
}
