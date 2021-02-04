/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, CKEditorInspector */
import 'ckeditor5/build/ckeditor5-dll.js';

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic/build/editor-classic';
import { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled/build/editor-decoupled';
import { InlineEditor } from '@ckeditor/ckeditor5-editor-inline/build/editor-inline';
import { BalloonEditor } from '@ckeditor/ckeditor5-editor-balloon/build/editor-balloon';

import { Alignment } from '@ckeditor/ckeditor5-alignment/build/alignment';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat/build/autoformat';
import { AutoImage, Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, ImageUpload } from '@ckeditor/ckeditor5-image/build/image';
import { AutoLink, Link, LinkImage } from '@ckeditor/ckeditor5-link/build/link';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote/build/block-quote';
import { Bold, Italic, Strikethrough, Subscript, Superscript, Underline, Code } from '@ckeditor/ckeditor5-basic-styles/build/basic-styles';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services/build/cloud-services';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block/build/code-block';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image/build/easy-image';
import { Essentials } from '@ckeditor/ckeditor5-essentials/build/essentials';
import { FontColor, FontFamily, FontSize, FontBackgroundColor } from '@ckeditor/ckeditor5-font/build/font';
import { Heading } from '@ckeditor/ckeditor5-heading/build/heading';
import { Highlight } from '@ckeditor/ckeditor5-highlight/build/highlight';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line/build/horizontal-line';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed/build/html-embed';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent/build/indent';
import { List, ListStyle, TodoList } from '@ckeditor/ckeditor5-list/build/list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed/build/media-embed';
import { Mention } from '@ckeditor/ckeditor5-mention/build/mention';
import { PageBreak } from '@ckeditor/ckeditor5-page-break/build/page-break';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office/build/paste-from-office';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format/build/remove-format';
import { SpecialCharacters, SpecialCharactersEssentials } from '@ckeditor/ckeditor5-special-characters/build/special-characters';
import { Table, TableToolbar, TableCellProperties, TableProperties } from '@ckeditor/ckeditor5-table/build/table';
import { WordCount } from '@ckeditor/ckeditor5-word-count/build/word-count';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const { Plugin } = window.CKEditor5.core;
const { ButtonView } = window.CKEditor5.ui;
const { Paragraph } = window.CKEditor5.paragraph;
const { TextTransformation } = window.CKEditor5.typing;

// Create ad-hoc plugin.
class AdHocPlugin extends Plugin {
	constructor( editor ) {
		super( editor );

		editor.ui.componentFactory.add( 'ad-hoc-button', locale => {
			const button = new ButtonView( locale );

			button.set( {
				icon: false,
				withText: true,
				label: 'Ad-hoc'
			} );

			button.on( 'execute', () => console.log( 'It works!' ) );

			return button;
		} );
	}
}

const config = {
	plugins: [
		AdHocPlugin, Paragraph, TextTransformation,
		Alignment,
		Autoformat,
		AutoImage, Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, ImageUpload,
		AutoLink, Link, LinkImage,
		BlockQuote,
		Bold, Italic, Strikethrough, Subscript, Superscript, Underline, Code,
		CloudServices,
		CodeBlock,
		EasyImage,
		Essentials,
		FontColor, FontFamily, FontSize, FontBackgroundColor,
		Heading,
		Highlight,
		HorizontalLine,
		HtmlEmbed,
		Indent, IndentBlock,
		List, ListStyle, TodoList,
		MediaEmbed,
		Mention,
		PageBreak,
		PasteFromOffice,
		RemoveFormat,
		SpecialCharacters, SpecialCharactersEssentials,
		Table, TableToolbar, TableCellProperties, TableProperties,
		WordCount
	],
	toolbar: [
		'heading',
		'|',
		'ad-hoc-button',
		'|',
		'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'link',
		'|',
		'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
		'|',
		'bulletedList', 'numberedList', 'todoList',
		'|',
		'blockQuote', 'imageUpload', 'insertTable', 'mediaEmbed', 'codeBlock',
		'|',
		'htmlEmbed',
		'|',
		'alignment', 'outdent', 'indent',
		'|',
		'pageBreak', 'horizontalLine', 'specialCharacters',
		'|',
		'undo', 'redo'
	],
	cloudServices: CS_CONFIG,
	table: {
		contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ]
	},
	image: {
		styles: [
			'alignCenter',
			'alignLeft',
			'alignRight'
		],
		resizeOptions: [
			{
				name: 'imageResize:original',
				label: 'Original size',
				value: null
			},
			{
				name: 'imageResize:50',
				label: '50%',
				value: '50'
			},
			{
				name: 'imageResize:75',
				label: '75%',
				value: '75'
			}
		],
		toolbar: [
			'imageTextAlternative', '|',
			'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight', '|',
			'imageResize'
		],
		insert: {
			integrations: [
				'insertImageViaUrl'
			]
		}
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
				attributes: {
					class: 'gallery'
				}
			}
		}
	},
	htmlEmbed: {
		showPreviews: true
	}
};

const classicEditorPromise = ClassicEditor.create( document.querySelector( '#editor-classic' ), config )
	.then( editor => {
		window.classicEditor = editor;

		return {
			name: 'Classic Editor',
			instance: editor
		};
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const inlineEditorPromise = InlineEditor.create( document.querySelector( '#editor-inline' ), config )
	.then( editor => {
		window.inlineEditor = editor;

		return {
			name: 'Inline Editor',
			instance: editor
		};
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const balloonEditorPromise = BalloonEditor.create( document.querySelector( '#editor-balloon' ), config )
	.then( editor => {
		window.balloonEditor = editor;

		return {
			name: 'Balloon Editor',
			instance: editor
		};
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const decoupledEditorData = '<h2>Sample</h2>' +
	'<p>This is an instance of the ' +
		'<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#document-editor">document editor build</a>.' +
	'</p>' +
	'<figure class="image">' +
		'<img src="./sample.jpg" alt="Autumn fields" />' +
	'</figure>' +
	'<p>You can use this sample to validate whether your ' +
		'<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/custom-builds.html">custom build</a> works fine.' +
	'</p>';

const decoupledEditorPromise = DecoupledEditor.create( decoupledEditorData, config )
	.then( editor => {
		window.decoupledEditor = editor;

		document.querySelector( '.toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
		document.querySelector( '.editable-container' ).appendChild( editor.ui.view.editable.element );

		return {
			name: 'Decoupled Editor',
			instance: editor
		};
	} )
	.catch( err => {
		console.error( err.stack );
	} );

Promise.all( [
	classicEditorPromise,
	inlineEditorPromise,
	balloonEditorPromise,
	decoupledEditorPromise
] ).then( editors => {
	editors
		.filter( editor => !!editor )
		.forEach( editor => {
			CKEditorInspector.attach( { [ editor.name ]: editor.instance } );

			logWordCountStats( editor.name, editor.instance );
		} );
} );

function logWordCountStats( editorName, editorInstance ) {
	editorInstance.plugins.get( 'WordCount' ).on( 'update', ( evt, stats ) => {
		console.log( `${ editorName } = characters: ${ stats.characters }, words: ${ stats.words }.` );
	} );
}
