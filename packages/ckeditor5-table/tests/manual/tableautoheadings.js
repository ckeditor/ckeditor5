/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

const editors = [
	{
		id: 'editor-1',
		defaultHeadings: { rows: 1 }
	},
	{
		id: 'editor-2',
		defaultHeadings: { columns: 1 }
	},
	{
		id: 'editor-3',
		defaultHeadings: { rows: 1, columns: 1 }
	},
	{
		id: 'editor-4',
		defaultHeadings: { rows: 3, columns: 2 }
	}
];

for ( const { id, defaultHeadings } of editors ) {
	ClassicEditor
		.create( document.getElementById( id ), {
			image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
			plugins: [ ArticlePluginSet ],
			toolbar: [
				'heading', '|', 'insertTable', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
			],
			table: {
				contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
				tableToolbar: [ 'bold', 'italic' ],
				defaultHeadings
			}
		} )
		.then( editor => {
			window.editor = editor;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
