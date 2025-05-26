/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

const editors = [
	{
		id: 'editor1',
		callback: editor => {
			editor.setData( '<table><tr><td colspan="0"></td></tr></table>' );
		}
	},
	{
		id: 'editor2',
		callback: editor => {
			editor.setData( '<table><tr><td colspan="abc"></td></tr></table>' );
		}
	},
	{
		id: 'editor3',
		callback: editor => {
			editor.setData( '<table><tr><td colspan="-1" rowspan="-1"></td></tr></table>' );
		}
	}
];

for ( const { id, callback } of editors ) {
	ClassicEditor
		.create( document.querySelector( `#${ id }` ), {
			image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
			plugins: [ ArticlePluginSet ],
			toolbar: [
				'heading', '|', 'insertTable', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
			],
			table: {
				contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
				tableToolbar: [ 'bold', 'italic' ]
			}
		} )
		.then( editor => {
			window.editor = editor;

			document.getElementById( `${ id }-button` ).addEventListener( 'click', () => {
				callback( editor );
			} );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
