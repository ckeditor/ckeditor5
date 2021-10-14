/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, CKEditorInspector */
// Dll core.
import 'ckeditor5/build/ckeditor5-dll.js';

// Editor creators.
import '@ckeditor/ckeditor5-editor-classic/build/editor-classic';
import '@ckeditor/ckeditor5-editor-decoupled/build/editor-decoupled';
import '@ckeditor/ckeditor5-editor-inline/build/editor-inline';
import '@ckeditor/ckeditor5-editor-balloon/build/editor-balloon';

// Plugins.
import '@ckeditor/ckeditor5-image/build/image';
import '@ckeditor/ckeditor5-link/build/link';
import '@ckeditor/ckeditor5-basic-styles/build/basic-styles';
import '@ckeditor/ckeditor5-find-and-replace/build/find-and-replace';
import '@ckeditor/ckeditor5-font/build/font';
import '@ckeditor/ckeditor5-indent/build/indent';
import '@ckeditor/ckeditor5-list/build/list';
import '@ckeditor/ckeditor5-special-characters/build/special-characters';
import '@ckeditor/ckeditor5-table/build/table';
import '@ckeditor/ckeditor5-alignment/build/alignment';
import '@ckeditor/ckeditor5-autoformat/build/autoformat';
import '@ckeditor/ckeditor5-block-quote/build/block-quote';
import '@ckeditor/ckeditor5-cloud-services/build/cloud-services';
import '@ckeditor/ckeditor5-code-block/build/code-block';
import '@ckeditor/ckeditor5-easy-image/build/easy-image';
import '@ckeditor/ckeditor5-essentials/build/essentials';
import '@ckeditor/ckeditor5-heading/build/heading';
import '@ckeditor/ckeditor5-highlight/build/highlight';
import '@ckeditor/ckeditor5-horizontal-line/build/horizontal-line';
import '@ckeditor/ckeditor5-html-embed/build/html-embed';
import '@ckeditor/ckeditor5-html-support/build/html-support';
import '@ckeditor/ckeditor5-language/build/language';
import '@ckeditor/ckeditor5-media-embed/build/media-embed';
import '@ckeditor/ckeditor5-mention/build/mention';
import '@ckeditor/ckeditor5-page-break/build/page-break';
import '@ckeditor/ckeditor5-paste-from-office/build/paste-from-office';
import '@ckeditor/ckeditor5-remove-format/build/remove-format';
import '@ckeditor/ckeditor5-word-count/build/word-count';
import '@ckeditor/ckeditor5-source-editing/build/source-editing';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const { ClassicEditor } = window.CKEditor5.editorClassic;
const { DecoupledEditor } = window.CKEditor5.editorDecoupled;
const { InlineEditor } = window.CKEditor5.editorInline;
const { BalloonEditor } = window.CKEditor5.editorBalloon;

const { AutoImage, Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, ImageUpload } = window.CKEditor5.image;
const { AutoLink, Link, LinkImage } = window.CKEditor5.link;
const { Bold, Italic, Strikethrough, Subscript, Superscript, Underline, Code } = window.CKEditor5.basicStyles;
const { FindAndReplace } = window.CKEditor5.findAndReplace;
const { FontColor, FontFamily, FontSize, FontBackgroundColor } = window.CKEditor5.font;
const { Indent, IndentBlock } = window.CKEditor5.indent;
const { List, ListStyle, TodoList } = window.CKEditor5.list;
const { SpecialCharacters, SpecialCharactersEssentials } = window.CKEditor5.specialCharacters;
const { Table, TableToolbar, TableCellProperties, TableProperties, TableCaption } = window.CKEditor5.table;
const { Alignment } = window.CKEditor5.alignment;
const { Autoformat } = window.CKEditor5.autoformat;
const { BlockQuote } = window.CKEditor5.blockQuote;
const { CloudServices } = window.CKEditor5.cloudServices;
const { CodeBlock } = window.CKEditor5.codeBlock;
const { EasyImage } = window.CKEditor5.easyImage;
const { Essentials } = window.CKEditor5.essentials;
const { Heading } = window.CKEditor5.heading;
const { Highlight } = window.CKEditor5.highlight;
const { HorizontalLine } = window.CKEditor5.horizontalLine;
const { HtmlEmbed } = window.CKEditor5.htmlEmbed;
const { HtmlComment } = window.CKEditor5.htmlSupport;
const { MediaEmbed } = window.CKEditor5.mediaEmbed;
const { Mention } = window.CKEditor5.mention;
const { PageBreak } = window.CKEditor5.pageBreak;
const { PasteFromOffice } = window.CKEditor5.pasteFromOffice;
const { RemoveFormat } = window.CKEditor5.removeFormat;
const { TextPartLanguage } = window.CKEditor5.language;
const { WordCount } = window.CKEditor5.wordCount;
const { SourceEditing } = window.CKEditor5.sourceEditing;

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
		FindAndReplace,
		FontColor, FontFamily, FontSize, FontBackgroundColor,
		Heading,
		Highlight,
		HorizontalLine,
		HtmlEmbed,
		HtmlComment,
		Indent, IndentBlock,
		List, ListStyle, TodoList,
		MediaEmbed,
		Mention,
		PageBreak,
		PasteFromOffice,
		RemoveFormat,
		SpecialCharacters, SpecialCharactersEssentials,
		Table, TableToolbar, TableCellProperties, TableProperties, TableCaption,
		TextPartLanguage,
		WordCount,
		SourceEditing
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
		'textPartLanguage',
		'|',
		'sourceEditing',
		'|',
		'undo', 'redo', 'findAndReplace'
	],
	cloudServices: CS_CONFIG,
	table: {
		contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption' ]
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
			'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', 'imageStyle:side', '|',
			'resizeImage'
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
				classes: 'gallery'
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
