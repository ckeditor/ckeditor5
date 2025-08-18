/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { TableProperties, TableCellProperties, TableColumnResize } from '@ckeditor/ckeditor5-table';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { Underline, Code, Strikethrough, Superscript, Subscript } from '@ckeditor/ckeditor5-basic-styles';
import { FontColor, FontBackgroundColor, FontFamily, FontSize } from '@ckeditor/ckeditor5-font';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { WordCount } from '@ckeditor/ckeditor5-word-count';
import { TodoList } from '@ckeditor/ckeditor5-list';
import { SpecialCharacters, SpecialCharactersEssentials } from '@ckeditor/ckeditor5-special-characters';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { IndentBlock } from '@ckeditor/ckeditor5-indent';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { ImageUpload } from '@ckeditor/ckeditor5-image';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

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
				ArticlePluginSet, CodeBlock, Alignment, TableColumnResize,
				TableProperties, TableCellProperties, SpecialCharacters, SpecialCharactersEssentials,
				Code, Underline, Strikethrough, Superscript, Subscript,
				Highlight, FontColor, FontBackgroundColor, FontFamily, FontSize,
				IndentBlock, WordCount, ImageUpload, CloudServices, EasyImage,
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
				'blockQuote', 'uploadImage', 'insertTable', 'mediaEmbed', 'codeBlock',
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
				toolbar: [
					'imageTextAlternative',
					'toggleImageCaption', '|',
					'imageStyle:inline',
					'imageStyle:wrapText',
					'imageStyle:breakText'
				]
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
			document.getElementById( 'read-only' ).addEventListener( 'click', toggleReadOnly );
			document.getElementById( 'destroyEditor' ).addEventListener( 'click', destroyEditor );

			function destroyEditor() {
				editor.destroy().then( () => console.log( 'Editor was destroyed' ) );
				editor = null;
				document.getElementById( 'destroyEditor' ).removeEventListener( 'click', destroyEditor );
				document.getElementById( 'clear-content' ).removeEventListener( 'click', clearData );
				document.getElementById( 'print-data-action' ).removeEventListener( 'click', printData );
				document.getElementById( 'read-only' ).removeEventListener( 'click', toggleReadOnly );
			}

			const button = document.getElementById( 'read-only' );
			let isReadOnly = false;

			function toggleReadOnly() {
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
			}

			function printData() {
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
