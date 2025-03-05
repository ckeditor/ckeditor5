/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor.js';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage.js';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace.js';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed.js';
import HtmlComment from '@ckeditor/ckeditor5-html-support/src/htmlcomment.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties.js';
import Mention from '@ckeditor/ckeditor5-mention/src/mention.js';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import ShowBlocks from '@ckeditor/ckeditor5-show-blocks/src/showblocks.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters.js';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials.js';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript.js';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties.js';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties.js';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption.js';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize.js';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';
import TextPartLanguage from '@ckeditor/ckeditor5-language/src/textpartlanguage.js';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import Style from '@ckeditor/ckeditor5-style/src/style.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import Bookmark from '@ckeditor/ckeditor5-bookmark/src/bookmark.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

import Fullscreen from '../../src/fullscreen.js';

declare global {
	interface Window { editor: any }
}

const EDITOR_ELEMENT = document.getElementById( 'editor' )!;
const DECOUPLED_EDITOR_BUTTON = document.getElementById( 'restart-decoupled' )!;
const CLASSIC_EDITOR_BUTTON = document.getElementById( 'restart-classic' )!;
const MENU_BAR_INPUT = document.getElementById( 'menu-bar' ) as HTMLInputElement;
const MENU_BAR_FULLSCREEN_INPUT = document.getElementById( 'menu-bar-fullscreen' ) as HTMLInputElement;

let editorInstance;
let currentData;

const commonConfig = {
	plugins: [
		ArticlePluginSet, Underline, Strikethrough, Superscript, Subscript, Code, RemoveFormat,
		FindAndReplace, FontColor, FontBackgroundColor, FontFamily, FontSize, Highlight,
		CodeBlock, TodoList, ListProperties, TableProperties, TableCellProperties, TableCaption, TableColumnResize,
		EasyImage, ImageResize, ImageInsert, LinkImage, AutoImage, HtmlEmbed, HtmlComment,
		AutoLink, Mention, TextTransformation,
		Alignment, IndentBlock, Bookmark, BlockQuote,
		PasteFromOffice, PageBreak, HorizontalLine, ShowBlocks,
		SpecialCharacters, SpecialCharactersEssentials,
		CloudServices, TextPartLanguage, SourceEditing, Style, GeneralHtmlSupport, Fullscreen
	],
	toolbar: [
		'fullscreen',
		'|',
		'heading', 'style',
		'|',
		'sourceEditing', 'showBlocks',
		'|',
		'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'link', 'bookmark',
		'|',
		'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
		'|',
		'bulletedList', 'numberedList', 'todoList',
		'|',
		'blockQuote', 'insertImage', 'insertTable', 'mediaEmbed', 'codeBlock',
		'|',
		'htmlEmbed',
		'|',
		'alignment', 'outdent', 'indent',
		'|',
		'pageBreak', 'horizontalLine', 'specialCharacters',
		'|',
		'textPartLanguage',
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
				mode: 'manual' as const,
				label: 'Open in a new tab',
				attributes: {
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			},
			isDownloadable: {
				mode: 'manual' as const,
				label: 'Downloadable',
				attributes: {
					download: 'download'
				}
			},
			isGallery: {
				mode: 'manual' as const,
				label: 'Gallery link',
				classes: 'gallery'
			}
		}
	},
	htmlEmbed: {
		showPreviews: true,
		sanitizeHtml: html => ( { html, hasChanged: false } )
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
};

DECOUPLED_EDITOR_BUTTON.addEventListener( 'click', () => {
	currentData = editorInstance.getData();

	editorInstance.destroy().then( () => {
		editorInstance.ui.view.toolbar.element.remove();

		if ( editorInstance.ui.view.menuBarView ) {
			editorInstance.ui.view.menuBarView.element.remove();
		}

		DecoupledEditor
			.create( EDITOR_ELEMENT, Object.assign( commonConfig,
				{
					fullscreen: { menuBar: { isVisible: MENU_BAR_FULLSCREEN_INPUT.checked } }
				}
			) )
			.then( editor => {
				( document.querySelector( '.document-editor__toolbar' ) as HTMLElement )
					.appendChild( editor.ui.view.toolbar.element! );

				if ( MENU_BAR_INPUT.checked ) {
					( document.querySelector( '.document-editor__menu-bar' ) as HTMLElement )
						.appendChild( editor.ui.view.menuBarView.element! );
				}

				window.editor = editorInstance = editor;
				editor.setData( currentData );
			} )
			.catch( err => {
				console.error( err.stack );
			} );
	} );
} );

CLASSIC_EDITOR_BUTTON.addEventListener( 'click', () => {
	currentData = editorInstance.getData();

	editorInstance.destroy().then( () => {
		editorInstance.ui.view.toolbar.element.remove();

		if ( editorInstance.ui.view.menuBarView ) {
			editorInstance.ui.view.menuBarView.element.remove();
		}

		ClassicEditor
			.create( EDITOR_ELEMENT, Object.assign( commonConfig,
				{
					menuBar: { isVisible: MENU_BAR_INPUT.checked },
					fullscreen: { menuBar: { isVisible: MENU_BAR_FULLSCREEN_INPUT.checked } }
				}
			) )
			.then( editor => {
				window.editor = editorInstance = editor;
				editor.setData( currentData );
			} )
			.catch( err => {
				console.error( err.stack );
			} );
	} );
} );

ClassicEditor
	.create( EDITOR_ELEMENT, Object.assign( commonConfig,
		{
			menuBar: { isVisible: MENU_BAR_INPUT.checked },
			fullscreen: { menuBar: { isVisible: MENU_BAR_FULLSCREEN_INPUT.checked } }
		}
	) )
	.then( editor => {
		window.editor = editorInstance = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
