/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { getPerformanceData, renderPerformanceDataButtons } from '../../_utils/utils';

renderPerformanceDataButtons( document.querySelector( '#fixture-buttons' ) );

const fixtures = getPerformanceData();
const buttons = document.querySelectorAll( '#test-controls button' );

for ( const button of buttons ) {
	const fixtureName = button.getAttribute( 'data-file-name' );
	const content = fixtures[ fixtureName ];
	const editorElement = document.querySelector( `#editor_${ fixtureName }` );

	// Put the source content in editor-related elements ahead of time, so that potentially
	// big `innerHTML` change does not affect the benchmark when pressing the button.
	editorElement.innerHTML = content;

	button.addEventListener( 'click', function() {
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
	} );

	button.disabled = false;
}

