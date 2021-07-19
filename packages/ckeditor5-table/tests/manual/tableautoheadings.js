/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

const editors = [
	{
		id: 'editor-1',
		autoHeading: { rows: 1 }
	},
	{
		id: 'editor-2',
		autoHeading: { columns: 1 }
	},
	{
		id: 'editor-3',
		autoHeading: { rows: 1, columns: 1 }
	},
	{
		id: 'editor-4',
		autoHeading: { rows: 3, columns: 2 }
	}
];

for ( const { id, autoHeading } of editors ) {
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
				autoHeading
			}
		} )
		.then( editor => {
			window.editor = editor;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
