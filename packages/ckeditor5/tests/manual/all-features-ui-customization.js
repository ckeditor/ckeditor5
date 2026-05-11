/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { AutoImage, ImageResize, ImageInsert } from '@ckeditor/ckeditor5-image';
import { AutoLink, LinkImage } from '@ckeditor/ckeditor5-link';
import { Code, Strikethrough, Subscript, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { FontBackgroundColor, FontColor, FontFamily, FontSize } from '@ckeditor/ckeditor5-font';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { HtmlComment, GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { IndentBlock } from '@ckeditor/ckeditor5-indent';
import { ListProperties, TodoList } from '@ckeditor/ckeditor5-list';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { ShowBlocks } from '@ckeditor/ckeditor5-show-blocks';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { SpecialCharacters, SpecialCharactersEssentials } from '@ckeditor/ckeditor5-special-characters';
import { TableCellProperties, TableProperties, TableCaption, TableColumnResize } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { TextPartLanguage } from '@ckeditor/ckeditor5-language';
import { WordCount } from '@ckeditor/ckeditor5-word-count';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { Style } from '@ckeditor/ckeditor5-style';
import { Bookmark } from '@ckeditor/ckeditor5-bookmark';
import { Fullscreen } from '@ckeditor/ckeditor5-fullscreen';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
// eslint-disable-next-line ckeditor5-rules/allow-imports-only-from-main-package-entry-point
import { generatePanel } from '@ckeditor/ckeditor5-ui/tests/manual/ui-customization/token-panel.js';

import { presetFiles } from './presets/index.js';

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
				'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|',
				'resizeImage'
			]
		},
		placeholder: 'Type the content here!',
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [
						'@apple', '@bears', '@brownie', '@cake', '@candy', '@chocolate', '@cookie', '@cream',
						'@cupcake', '@danish', '@donut', '@fruitcake', '@gingerbread', '@ice', '@jelly-o',
						'@liquorice', '@macaroon', '@marzipan', '@oat', '@pie', '@plum', '@pudding',
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

		// Load preset CSS files, then generate the token panel.
		const sortedFiles = [ ...presetFiles ].sort();

		Promise.all(
			sortedFiles.map( file =>
				fetch( `presets/${ file }` )
					.then( res => res.ok ? res.text() : '' )
					.then( css => ( {
						name: file.replace( /\.css$/, '' ),
						css
					} ) )
			)
		).then( presets => {
			generatePanel( presets.filter( p => p.css ) );
		} );

		// Word count logging.
		editor.plugins.get( 'WordCount' ).on( 'update', ( evt, stats ) => {
			console.log( `Characters: ${ stats.characters }, words: ${ stats.words }.` );
		} );

		// Clear editor button.
		document.getElementById( 'clear-content' ).addEventListener( 'click', () => {
			editor.setData( '' );
		} );

		// Print preview button.
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

		// Read-only toggle button.
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

		// Toggle token panel button.
		const toggleBtn = document.getElementById( 'toggle-panel' );
		const layout = document.querySelector( '.ck-test-layout' );

		toggleBtn.addEventListener( 'click', () => {
			layout.classList.toggle( 'ck-test-layout--panel-hidden' );
			toggleBtn.textContent = layout.classList.contains( 'ck-test-layout--panel-hidden' ) ?
				'Show tokens panel' :
				'Hide tokens panel';
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
