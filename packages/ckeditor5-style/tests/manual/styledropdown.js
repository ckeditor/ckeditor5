/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';
import Mention from '@ckeditor/ckeditor5-mention/src/mention.js';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript.js';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties.js';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties.js';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption.js';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';
import TextPartLanguage from '@ckeditor/ckeditor5-language/src/textpartlanguage.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties.js';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import Style from '../../src/style.js';

const config = {
	plugins: [
		Alignment,
		Essentials,
		Autoformat,
		BlockQuote,
		Bold,
		Heading,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		Indent,
		Italic,
		Link,
		MediaEmbed,
		Paragraph,
		Table,
		TableToolbar,
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
		List,
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
			'bulletedList', 'numberedList',
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
	}
};

ClassicEditor
	.create( document.querySelector( '#editor-full' ), {
		...config,
		style: {
			definitions: [
				{
					name: 'Callout',
					element: 'div',
					classes: [ 'callout' ]
				},
				{
					name: 'Link',
					element: 'a',
					classes: [ 'styled-link' ]
				},
				{
					name: 'Fancy list',
					element: 'ol',
					classes: [ 'fancy-list' ]
				},
				{
					name: 'Italic list',
					element: 'ul',
					classes: [ 'italic-list' ]
				},
				{
					name: 'Background list item',
					element: 'li',
					classes: [ 'background-list-item' ]
				},
				{
					name: 'Figure outline',
					element: 'figure',
					classes: [ 'figure-style' ]
				},
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
					name: 'Fancy table',
					element: 'table',
					classes: [ 'fancy-table' ]
				},
				{
					name: 'Table row',
					element: 'tr',
					classes: [ 'colorful-row' ]
				},
				{
					name: 'Color-full cell',
					element: 'td',
					classes: [ 'colorful-cell' ]
				},
				{
					name: 'Color-full heading cell',
					element: 'th',
					classes: [ 'colorful-cell' ]
				},
				{
					name: 'Table head',
					element: 'thead',
					classes: [ 'table-head' ]
				},
				{
					name: 'Table body',
					element: 'tbody',
					classes: [ 'table-body' ]
				},
				{
					name: 'Caption',
					element: 'caption',
					classes: [ 'fancy-caption' ]
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
					name: 'Code (dark)',
					element: 'pre',
					classes: [ 'fancy-code', 'fancy-code-dark' ]
				},
				{
					name: 'Code (bright)',
					element: 'pre',
					classes: [ 'fancy-code', 'fancy-code-bright' ]
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
