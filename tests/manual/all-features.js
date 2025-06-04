/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage.js';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink.js';
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
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import Style from '@ckeditor/ckeditor5-style/src/style.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import Bookmark from '@ckeditor/ckeditor5-bookmark/src/bookmark.js';
import Fullscreen from '@ckeditor/ckeditor5-fullscreen/src/fullscreen.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet, Underline, Strikethrough, Superscript, Subscript, Code, RemoveFormat,
			FindAndReplace, FontColor, FontBackgroundColor, FontFamily, FontSize, Highlight,
			CodeBlock, TodoList, ListProperties, TableProperties, TableCellProperties, TableCaption, TableColumnResize,
			EasyImage, ImageResize, ImageInsert, LinkImage, AutoImage, HtmlEmbed, HtmlComment,
			AutoLink, Mention, TextTransformation,
			Alignment, IndentBlock, Bookmark,
			PasteFromOffice, PageBreak, HorizontalLine, ShowBlocks,
			SpecialCharacters, SpecialCharactersEssentials, WordCount,
			CloudServices, TextPartLanguage, SourceEditing, Style, GeneralHtmlSupport, Fullscreen
		],
		toolbar: [
			'heading', 'style',
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
			'sourceEditing', 'showBlocks',
			'|',
			'undo', 'redo', 'findAndReplace', 'fullscreen'
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
				'linkImage', 'imageTextAlternative', 'toggleImageCaption', '|',
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
		menuBar: {
			isVisible: true
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
		window.editor = editor;

		editor.plugins.get( 'WordCount' ).on( 'update', ( evt, stats ) => {
			console.log( `Characters: ${ stats.characters }, words: ${ stats.words }.` );
		} );

		document.getElementById( 'clear-content' ).addEventListener( 'click', () => {
			editor.setData( '' );
		} );

		// The "Print editor data" button logic.
		document.getElementById( 'print-data-action' ).addEventListener( 'click', () => {
			const iframeElement = document.getElementById( 'print-data-container' );

			/* eslint-disable @stylistic/max-len */
			iframeElement.srcdoc = '<html>' +
				'<head>' +
					`<title>${ document.title }</title>` +
					'<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/nightly/ckeditor5.css">' +
					'<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/nightly/ckeditor5-premium-features.css">' +
				'</head>' +
				'<body class="ck-content">' +
					editor.getData() +
					'<script>' +
						'window.addEventListener( \'DOMContentLoaded\', () => { window.print(); } );' +
					'</script>' +
				'</body>' +
			'</html>';
			/* eslint-enable @stylistic/max-len */
		} );

		const button = document.getElementById( 'read-only' );
		let isReadOnly = false;

		button.addEventListener( 'click', () => {
			isReadOnly = !isReadOnly;

			if ( isReadOnly ) {
				editor.enableReadOnlyMode( 'manual-test' );
			} else {
				editor.disableReadOnlyMode( 'manual-test' );
			}

			button.textContent = isReadOnly ?
				'Turn off read-only mode' :
				'Turn on read-only mode';

			editor.editing.view.focus();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
