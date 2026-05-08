/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { ImageResize } from '@ckeditor/ckeditor5-image';
import { generatePanel } from './token-panel.js';

// ---------------------------------------------------------------------------
// Editor initialization
// ---------------------------------------------------------------------------

ClassicEditor
	.create( document.querySelector( '#editor-to-customize' ), {
		plugins: [ ArticlePluginSet, ImageResize, SourceEditing ],
		toolbar: [
			'sourceEditing', '|',
			'heading', '|',
			'bold', 'italic', 'link',
			'bulletedList', 'numberedList', '|',
			'outdent', 'indent', '|',
			'blockQuote', 'insertTable', 'mediaEmbed',
			'undo', 'redo'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		}
	} )
	.then( editor => {
		window.editor = editor;
		generatePanel();

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
