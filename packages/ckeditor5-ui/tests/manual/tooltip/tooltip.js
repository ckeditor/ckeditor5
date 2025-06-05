/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace.js';

initEditor( '#editor' );
initEditor( '#editor-scrollable-parent' );

function initEditor( elementId ) {
	ClassicEditor
		.create( document.querySelector( elementId ), {
			plugins: [ ArticlePluginSet, ListProperties, FontColor, FindAndReplace ],
			toolbar: [
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'|',
				'fontColor',
				'|',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'indent',
				'|',
				'blockQuote',
				'insertTable',
				'mediaEmbed',
				'|',
				'findAndReplace',
				'|',
				'undo',
				'redo'
			],
			image: {
				toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
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
			if ( !window.editors ) {
				window.editors = {};
			}

			window.editors[ elementId ] = editor;

			CKEditorInspector.attach( { [ elementId ]: editor } );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
