/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic, Underline, Strikethrough, Superscript, Subscript, Code } from '@ckeditor/ckeditor5-basic-styles';
import { Heading, HeadingButtonsUI } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageStyle, ImageToolbar, ImageResize, ImageInsert, AutoImage, ImageUpload } from '@ckeditor/ckeditor5-image';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { Link, LinkImage, AutoLink } from '@ckeditor/ckeditor5-link';
import { List, ListProperties } from '@ckeditor/ckeditor5-list';
import { Paragraph, ParagraphButtonUI } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar, TableProperties, TableCellProperties, TableCaption, TableColumnResize } from '@ckeditor/ckeditor5-table';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { FontColor, FontBackgroundColor, FontFamily, FontSize } from '@ckeditor/ckeditor5-font';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { TextTransformation, Typing } from '@ckeditor/ckeditor5-typing';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { TextPartLanguage } from '@ckeditor/ckeditor5-language';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Style } from '@ckeditor/ckeditor5-style';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { BalloonEditor } from '@ckeditor/ckeditor5-editor-balloon';
import { BlockToolbar } from '@ckeditor/ckeditor5-ui';

import { Clipboard, DragDrop } from '../../src/index.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#editor-classic' ), {
		plugins: [
			Essentials, Autoformat, BlockQuote, Bold, Heading, Image, ImageCaption, ImageStyle, ImageToolbar, Indent, Italic, Link,
			List, Paragraph, Table, TableToolbar, Underline, Strikethrough, Superscript, Subscript, Code, RemoveFormat,
			FindAndReplace, FontColor, FontBackgroundColor, FontFamily, FontSize, Highlight,
			CodeBlock, ListProperties, TableProperties, TableCellProperties, TableCaption, TableColumnResize,
			EasyImage, ImageResize, ImageInsert, LinkImage, AutoImage, HtmlEmbed,
			AutoLink, Mention, TextTransformation, Alignment, IndentBlock, PageBreak, HorizontalLine,
			CloudServices, TextPartLanguage, SourceEditing, Style, GeneralHtmlSupport, DragDrop
		],
		toolbar: [
			'heading', 'style',
			'|',
			'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'link',
			'|',
			'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
			'|',
			'bulletedList', 'numberedList',
			'|',
			'blockQuote', 'insertImage', 'insertTable', 'codeBlock',
			'|',
			'htmlEmbed',
			'|',
			'alignment', 'outdent', 'indent',
			'|',
			'pageBreak', 'horizontalLine',
			'|',
			'textPartLanguage',
			'|',
			'sourceEditing',
			'|',
			'undo', 'redo', 'findAndReplace'
		],
		cloudServices: CS_CONFIG,
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
			]
		},
		image: {
			styles: [
				'alignCenter',
				'alignLeft',
				'alignRight'
			],
			resizeOptions: [
				{
					name: 'resizeImage:original',
					label: 'Original size',
					value: null
				},
				{
					name: 'resizeImage:50',
					label: '50%',
					value: '50'
				},
				{
					name: 'resizeImage:75',
					label: '75%',
					value: '75'
				}
			],
			toolbar: [
				'imageTextAlternative', 'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:breakText', 'imageStyle:wrapText', '|',
				'resizeImage'
			]
		},
		placeholder: 'Type the content here!',
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [
						'@apple', '@bears', '@brownie', '@cake', '@cake', '@candy', '@canes', '@chocolate', '@cookie', '@cotton', '@cream',
						'@cupcake', '@danish', '@donut', '@dragée', '@fruitcake', '@gingerbread', '@gummi', '@ice', '@jelly-o',
						'@liquorice', '@macaroon', '@marzipan', '@oat', '@pie', '@plum', '@pudding', '@sesame', '@snaps', '@soufflé',
						'@sugar', '@sweet', '@topping', '@wafer'
					],
					minimumCharacters: 1
				}
			]
		},
		link: {
			decorators: {
				isExternal: {
					mode: 'manual',
					label: 'Open in a new tab',
					attributes: {
						target: '_blank',
						rel: 'noopener noreferrer'
					}
				},
				isDownloadable: {
					mode: 'manual',
					label: 'Downloadable',
					attributes: {
						download: 'download'
					}
				},
				isGallery: {
					mode: 'manual',
					label: 'Gallery link',
					classes: 'gallery'
				}
			}
		},
		htmlEmbed: {
			showPreviews: true,
			sanitizeHtml: html => ( { html, hasChange: false } )
		},
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		},
		style: {
			definitions: [
				{
					name: 'Article category',
					element: 'h3',
					classes: [ 'category' ]
				},
				{
					name: 'Title',
					element: 'h2',
					classes: [ 'document-title' ]
				},
				{
					name: 'Subtitle',
					element: 'h3',
					classes: [ 'document-subtitle' ]
				},
				{
					name: 'Info box',
					element: 'p',
					classes: [ 'info-box' ]
				},
				{
					name: 'Side quote',
					element: 'blockquote',
					classes: [ 'side-quote' ]
				},
				{
					name: 'Marker',
					element: 'span',
					classes: [ 'marker' ]
				},
				{
					name: 'Spoiler',
					element: 'span',
					classes: [ 'spoiler' ]
				},
				{
					name: 'Code (dark)',
					element: 'pre',
					classes: [ 'fancy-code', 'fancy-code-dark' ]
				},
				{
					name: 'Code (bright)',
					element: 'pre',
					classes: [ 'fancy-code', 'fancy-code-bright' ]
				}
			]
		}
	} )
	.then( editor => {
		window.editorClassic = editor;

		CKEditorInspector.attach( { classic: editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const editorData = document.querySelector( '#editor-classic' ).innerHTML;

DecoupledEditor
	.create( editorData, {
		plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic, Clipboard, Table, DragDrop ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'insertTable', 'undo', 'redo' ]
	} )
	.then( editor => {
		document.querySelector( '.toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
		document.querySelector( '.editable-container' ).appendChild( editor.ui.view.editable.element );

		window.editorDecoupled = editor;

		CKEditorInspector.attach( { decoupled: editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

BalloonEditor
	.create( document.querySelector( '#editor-balloon' ), {
		plugins: [
			Essentials, List, Paragraph, Heading,
			Image, ImageResize, ImageStyle, ImageToolbar, ImageCaption,
			HeadingButtonsUI, ParagraphButtonUI, BlockToolbar, Table, TableToolbar,
			CloudServices, ImageUpload, EasyImage, DragDrop
		],
		cloudServices: CS_CONFIG,
		blockToolbar: [
			'paragraph', 'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'paragraph',
			'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'paragraph', 'heading1', 'heading2', 'heading3',
			'bulletedList', 'numberedList', 'insertTable', 'uploadImage'
		],
		image: {
			toolbar: [
				'imageTextAlternative', 'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:breakText', 'imageStyle:wrapText', '|',
				'resizeImage'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', 'toggleTableCaption'
			]
		}
	} )
	.then( editor => {
		window.editorBalloon = editor;

		CKEditorInspector.attach( { balloon: editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

BalloonEditor
	.create( document.querySelector( '#editor-balloon-custom-icon' ), {
		plugins: [
			Essentials, List, Paragraph, Heading,
			Image, ImageResize, ImageStyle, ImageToolbar, ImageCaption,
			HeadingButtonsUI, ParagraphButtonUI, BlockToolbar, Table, TableToolbar,
			CloudServices, ImageUpload, EasyImage, DragDrop
		],
		cloudServices: CS_CONFIG,
		blockToolbar: {
			items: [ 'paragraph', 'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList',
				'paragraph', 'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'paragraph', 'heading1', 'heading2',
				'heading3', 'bulletedList', 'numberedList', 'insertTable', 'uploadImage' ],
			icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">' +
				'<path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>'
		},
		image: {
			toolbar: [
				'imageTextAlternative', 'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:breakText', 'imageStyle:wrapText', '|',
				'resizeImage'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', 'toggleTableCaption'
			]
		}
	} )
	.then( editor => {
		window.editorBalloonCustomIcon = editor;

		CKEditorInspector.attach( { balloonCustomIcon: editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

BalloonEditor
	.create( document.querySelector( '#editor-block-rtl' ), {
		plugins: [
			Essentials, List, Paragraph, Heading,
			Image, ImageResize, ImageStyle, ImageToolbar, ImageCaption,
			HeadingButtonsUI, ParagraphButtonUI, BlockToolbar, Table, TableToolbar,
			CloudServices, ImageUpload, EasyImage, DragDrop
		],
		language: 'ar',
		cloudServices: CS_CONFIG,
		blockToolbar: {
			items: [ 'paragraph', 'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList',
				'paragraph', 'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'paragraph', 'heading1', 'heading2',
				'heading3', 'bulletedList', 'numberedList', 'insertTable', 'uploadImage' ]
		},
		image: {
			toolbar: [
				'imageTextAlternative', 'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:breakText', 'imageStyle:wrapText', '|',
				'resizeImage'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', 'toggleTableCaption'
			]
		}
	} )
	.then( editor => {
		window.editorBalloonRtl = editor;

		CKEditorInspector.attach( { balloonRtl: editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
