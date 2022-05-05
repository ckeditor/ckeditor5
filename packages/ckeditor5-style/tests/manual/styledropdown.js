/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties';
import Mention from '@ckeditor/ckeditor5-mention/src/mention';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import TextPartLanguage from '@ckeditor/ckeditor5-language/src/textpartlanguage';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

import Style from '../../src/style';

const config = {
	plugins: [
		Alignment,
		ArticlePluginSet,
		CloudServices,
		Code,
		CodeBlock,
		EasyImage,
		FontBackgroundColor,
		FontColor,
		FontFamily,
		FontSize,
		GeneralHtmlSupport,
		Highlight,
		HorizontalLine,
		HtmlEmbed,
		ImageResize,
		ImageUpload,
		IndentBlock,
		LinkImage,
		ListProperties,
		Mention,
		PageBreak,
		PasteFromOffice,
		RemoveFormat,
		SourceEditing,
		Strikethrough,
		Subscript,
		Superscript,
		TableCaption,
		TableCellProperties,
		TableProperties,
		TextPartLanguage,
		TextTransformation,
		TodoList,
		Underline,
		WordCount,

		Style
	],
	cloudServices: CS_CONFIG,
	toolbar: {
		items: [
			'sourceEditing',
			'|',
			'style',
			'|',
			'heading',
			'|',
			'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'link',
			'|',
			'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
			'-',
			'bulletedList', 'numberedList', 'todoList',
			'|',
			'blockQuote', 'uploadImage', 'insertTable', 'mediaEmbed', 'codeBlock',
			'|',
			'htmlEmbed',
			'|',
			'alignment', 'outdent', 'indent',
			'|',
			'pageBreak', 'horizontalLine',
			'|',
			'textPartLanguage'
		],
		shouldNotGroupWhenFull: true
	},
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
		showPreviews: true,
		sanitizeHtml: html => ( { html, hasChange: false } )
	},
	list: {
		properties: {
			styles: true,
			startIndex: true,
			reversed: true
		}
	}
};

ClassicEditor
	.create( document.querySelector( '#editor-full' ), {
		...config,
		style: {
			definitions: [
				{
					name: 'Red heading',
					element: 'h2',
					classes: [ 'red-heading' ]
				},
				{
					name: 'Large heading',
					element: 'h2',
					classes: [ 'large-heading' ]
				},
				{
					name: 'Large paragraph',
					element: 'p',
					classes: [ 'large-heading' ]
				},
				{
					name: 'Rounded container',
					element: 'p',
					classes: [ 'rounded-container' ]
				},
				{
					name: 'Large preview',
					element: 'p',
					classes: [ 'large-preview' ]
				},
				{
					name: 'Bold table',
					element: 'table',
					classes: [ 'bold-table' ]
				},
				{
					name: 'Facncy table',
					element: 'table',
					classes: [ 'fancy-table' ]
				},
				{
					name: 'Colorfull cell',
					element: 'td',
					classes: [ 'colorful-cell' ]
				},
				{
					name: 'Vibrant code',
					element: 'pre',
					classes: [ 'vibrant-code' ]
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
					name: 'Typewriter',
					element: 'span',
					classes: [ 'typewriter' ]
				},
				{
					name: 'Deleted text',
					element: 'span',
					classes: [ 'deleted' ]
				},
				{
					name: 'Cited work',
					element: 'span',
					classes: [ 'cited', 'another-class' ]
				},
				{
					name: 'Small text',
					element: 'span',
					classes: [ 'small' ]
				},
				{
					name: 'Very long name of the style',
					element: 'span',
					classes: [ 'foo' ]
				},

				{
					name: 'span.Foo',
					element: 'span',
					classes: [ 'Foo' ]
				},
				{
					name: 'span.Bar',
					element: 'span',
					classes: [ 'Bar' ]
				},
				{
					name: 'strong.Baz',
					element: 'strong',
					classes: [ 'Baz' ]
				},
				{
					name: 'code.Qux',
					element: 'code',
					classes: [ 'Qux' ]
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-just-inline' ), {
		...config,
		style: {
			definitions: [
				{
					name: 'Marker',
					element: 'span',
					classes: [ 'marker' ]
				},
				{
					name: 'Typewriter',
					element: 'span',
					classes: [ 'typewriter' ]
				},
				{
					name: 'Deleted text',
					element: 'span',
					classes: [ 'deleted' ]
				}
			]
		}
	} )
	.then( editor => {
		window.editorInline = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
