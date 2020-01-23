/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
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
		]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

preloadData()
	.then( fixtures => {
		const buttons = document.querySelectorAll( '#test-controls button' );

		for ( const button of buttons ) {
			button.addEventListener( 'click', function() {
				const content = fixtures[ this.getAttribute( 'data-file-name' ) ];

				window.editor.setData( content );
			} );
			button.disabled = false;
		}
	} );

function preloadData() {
	return Promise.all( [ getFileContents( 'small' ), getFileContents( 'medium' ), getFileContents( 'large' ) ] )
		.then( responses => {
			return {
				small: responses[ 0 ],
				medium: responses[ 1 ],
				large: responses[ 2 ]
			};
		} );

	function getFileContents( fileName ) {
		return window.fetch( `_utils/${ fileName }.txt` )
			.then( resp => resp.text() );
	}
}
