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

const buttons = document.querySelectorAll( '#test-controls button' );
const fileNames = Array.from( buttons ).map( button => button.getAttribute( 'data-file-name' ) );

preloadData( fileNames.map( name => `_utils/${ name }.txt` ) )
	.then( fixtures => {
		for ( const button of buttons ) {
			button.addEventListener( 'click', function() {
				const content = fixtures[ this.getAttribute( 'data-file-name' ) ];

				window.editor.setData( content );
			} );
			button.disabled = false;
		}
	} );

function preloadData( urls ) {
	// @todo: simplify it - inline literals instead of looping over arrays.
	return Promise.all( urls.map( url => window.fetch( url ).then( resp => resp.text() ) ) )
		.then( responses => {
			return Object.fromEntries(
				Array.from( responses.keys() ).map( index => [ fileNames[ index ], responses[ index ] ] )
			);
		} );
}
