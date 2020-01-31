/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { loadPerformanceData, renderPerformanceDataButtons } from '../../_utils/utils';

const editorCount = 5;

renderPerformanceDataButtons( document.querySelector( '#fixture-buttons' ) );

loadPerformanceData()
	.then( fixtures => {
		const editorsWrapper = document.getElementById( 'editors-wrapper' );
		const buttons = document.querySelectorAll( '#test-controls button' );

		for ( let i = 0; i < editorCount; i++ ) {
			const editorElement = document.createElement( 'div' );
			editorElement.setAttribute( 'id', `editor_${ i }` );
			editorsWrapper.appendChild( editorElement );
		}

		for ( const button of buttons ) {
			const fixtureName = button.getAttribute( 'data-file-name' );
			const content = fixtures[ fixtureName ];

			button.addEventListener( 'click', function() {
				for ( let i = 0; i < editorCount; i++ ) {
					const editorElement = document.querySelector( `#editor_${ i }` );
					editorElement.innerHTML = content;

					ClassicEditor
						.create( editorElement, {
							plugins: [ ArticlePluginSet ],
							toolbar: [
								'heading',
								'|',
								'bold',
								'italic',
								'link',
								'bulletedList',
								'numberedList',
								'|',
								'outdent',
								'indent',
								'|',
								'blockQuote',
								'insertTable',
								'mediaEmbed',
								'undo',
								'redo'
							],
							image: {
								toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
							},
							table: {
								contentToolbar: [
									'tableColumn',
									'tableRow',
									'mergeTableCells'
								]
							}
						} )
						.then( editor => {
							window.editor = editor;
						} )
						.catch( err => {
							console.error( err.stack );
						} );
				}
			} );

			button.disabled = false;
		}
	} );
