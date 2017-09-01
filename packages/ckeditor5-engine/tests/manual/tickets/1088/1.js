/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePresets from '@ckeditor/ckeditor5-presets/src/article';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePresets ],
		toolbar: [ 'headings', 'undo', 'redo' ],
		image: {
			toolbar: [ 'imageTextAlternative' ]
		}
	} )
	.then( editor => {
		window.editor = editor;

		const schema = editor.document.schema;

		schema.disallow( { name: '$text', attributes: [ 'linkHref', 'italic' ], inside: 'heading1' } );
		schema.disallow( { name: '$text', attributes: [ 'italic' ], inside: 'heading2' } );
		schema.disallow( { name: '$text', attributes: [ 'linkHref' ], inside: 'blockQuote listItem' } );
		schema.disallow( { name: '$text', attributes: [ 'bold' ], inside: 'paragraph' } );
		schema.disallow( { name: 'heading3', inside: '$root' } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
