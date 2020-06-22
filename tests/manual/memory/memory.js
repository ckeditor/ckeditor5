/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document */

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
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

/*
 * Memory-leak safe version of balloon editor manual test does not:
 * - define global variables (such as let editor; in main file scope)
 * - console.log() objects
 * - add event listeners with () => {} methods which reference other
 */
function initEditor() {
	ClassicEditor
		.create( document.querySelector( '#editor' ), {
			plugins: [
				ArticlePluginSet, CodeBlock, Alignment,
				TableProperties, TableCellProperties, SpecialCharacters, SpecialCharactersEssentials,
				Code, Underline, Strikethrough, Superscript, Subscript,
				Highlight, FontColor, FontBackgroundColor, FontFamily, FontSize,
				IndentBlock, WordCount, EasyImage,
				TodoList, PageBreak, HorizontalLine, Mention, RemoveFormat, TextTransformation
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
				contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ]
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
						feed: [
							'@apple', '@bears', '@brownie', '@cake', '@cake', '@candy', '@canes', '@chocolate', '@cookie', '@cotton',
							'@cream', '@cupcake', '@danish', '@donut', '@dragée', '@fruitcake', '@gingerbread', '@gummi', '@ice',
							'@jelly-o', '@liquorice', '@macaroon', '@marzipan', '@oat', '@pie', '@plum', '@pudding', '@sesame',
							'@snaps', '@soufflé', '@sugar', '@sweet', '@topping', '@wafer'
						],
						minimumCharacters: 1
					}
				]
			}
		} )
		.then( editor => {
			editor.plugins.get( 'WordCount' ).on( 'update', ( evt, stats ) => {
				console.log( `Characters: ${ stats.characters }, words: ${ stats.words }.` );
			} );

			document.getElementById( 'clear-content' ).addEventListener( 'click', clearData );
			document.getElementById( 'print-data-action' ).addEventListener( 'click', printData );
			document.getElementById( 'read-only' ).addEventListener( 'click', readOnly );
			document.getElementById( 'destroyEditor' ).addEventListener( 'click', destroyEditor );

			function destroyEditor() {
				editor.destroy().then( () => console.log( 'Editor was destroyed' ) );
				editor = null;
				document.getElementById( 'destroyEditor' ).removeEventListener( 'click', destroyEditor );
				document.getElementById( 'clear-content' ).removeEventListener( 'click', clearData );
				document.getElementById( 'print-data-action' ).removeEventListener( 'click', printData );
				document.getElementById( 'read-only' ).removeEventListener( 'click', readOnly );
			}

			function readOnly() {
				editor.isReadOnly = !editor.isReadOnly;
				document.getElementById( 'read-only' ).textContent =
					editor.isReadOnly ? 'Turn off read-only mode' : 'Turn on read-only mode';

				editor.editing.view.focus();
			}

			function printData() {
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
			}

			function clearData() {
				editor.setData( '' );
			}
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

document.getElementById( 'initEditor' ).addEventListener( 'click', initEditor );
