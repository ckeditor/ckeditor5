/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Mention from '@ckeditor/ckeditor5-mention/src/mention';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const COLOR_PALETTE = [
	{ color: 'hsl(0, 0%, 0%)', label: 'Black' },
	{ color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
	{ color: 'hsl(0, 0%, 60%)', label: 'Grey' },
	{ color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
	{ color: 'hsl(0, 0%, 100%)', label: 'White', hasBorder: true },
	{ color: 'hsl(0, 100%, 89%)', label: 'Pink' },
	{ color: 'hsl(0, 75%, 60%)', label: 'Red' },
	{ color: 'hsl(60, 75%, 60%)', label: 'Yellow' },
	{ color: 'hsl(27, 100%, 85%)', label: 'Light Orange' },
	{ color: 'hsl(30, 75%, 60%)', label: 'Orange' },
	{ color: 'hsl(90, 75%, 60%)', label: 'Light green' },
	{ color: 'hsl(120, 75%, 60%)', label: 'Green' },
	{ color: 'hsl(150, 75%, 60%)', label: 'Aquamarine' },
	{ color: 'hsl(120, 100%, 25%)', label: 'Dark green' },
	{ color: 'hsl(180, 75%, 60%)', label: 'Turquoise' },
	{ color: 'hsl(180, 52%, 58%)', label: 'Light Aqua', },
	{ color: 'hsl(180, 97%, 31%)', label: 'Aqua' },
	{ color: 'hsl(210, 75%, 60%)', label: 'Light blue' },
	{ color: 'hsl(240, 75%, 60%)', label: 'Blue' },
	{ color: 'hsl(270, 75%, 60%)', label: 'Purple' }
];

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet, CodeBlock, Alignment,
			TableProperties, TableCellProperties, SpecialCharacters, SpecialCharactersEssentials,
			Code, Underline, Strikethrough, Superscript, Subscript,
			Highlight, FontColor, FontBackgroundColor, FontFamily, FontSize,
			IndentBlock, WordCount, EasyImage,
			TodoList, PageBreak, HorizontalLine, Mention, RemoveFormat
		],
		toolbar: [
			'heading',
			'|',
			'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'link',
			'|',
			'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
			'|',
			'bulletedList', 'numberedList', 'todoList',
			'|',
			'blockQuote', 'imageUpload', 'insertTable', 'mediaEmbed', 'codeBlock',
			'|',
			'alignment', 'outdent', 'indent',
			'|',
			'pageBreak', 'horizontalLine', 'specialCharacters',
			'|',
			'undo', 'redo'
		],
		cloudServices: CS_CONFIG,
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
			tableProperties: {
				borderColors: COLOR_PALETTE,
				backgroundColors: COLOR_PALETTE
			},
			tableCellProperties: {
				borderColors: COLOR_PALETTE,
				backgroundColors: COLOR_PALETTE
			}
		},
		image: {
			styles: [
				'full',
				'alignLeft',
				'alignRight'
			],
			toolbar: [ 'imageTextAlternative', '|', 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight' ]
		},
		placeholder: 'Type the content here!',
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ],
					minimumCharacters: 1
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

			/* eslint-disable max-len */
			iframeElement.srcdoc = '<html>' +
				'<head>' +
					`<title>${ document.title }</title>` +
					'<link rel="stylesheet" href="https://ckeditor.com/docs/ckeditor5/latest/snippets/features/page-break/snippet.css" type="text/css">' +
				'</head>' +
				'<body class="ck-content">' +
					editor.getData() +
					'<script>' +
						'window.addEventListener( \'DOMContentLoaded\', () => { window.print(); } );' +
					'</script>' +
				'</body>' +
			'</html>';
			/* eslint-enable max-len */
		} );

		const button = document.getElementById( 'read-only' );

		button.addEventListener( 'click', () => {
			editor.isReadOnly = !editor.isReadOnly;
			button.textContent = editor.isReadOnly ? 'Turn off read-only mode' : 'Turn on read-only mode';

			editor.editing.view.focus();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
