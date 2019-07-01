/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, document, console, ClassicEditor */

ClassicEditor
	.create( document.querySelector( '#demo-editor-update' ), {
		toolbar: {
			items: [
				'heading',
				'bold',
				'italic',
				'bulletedList',
				'numberedList',
				'blockQuote',
				'link',
				'|',
				'mediaEmbed',
				'insertTable',
				'|',
				'undo',
				'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		}
	} )
	.then( editor => {
		const wordCountPlugin = editor.plugins.get( 'WordCount' );

		const progressBar = document.querySelector( '.customized-count progress' );
		const colorBox = document.querySelector( '.customized-count__color-box' );

		wordCountPlugin.on( 'update', updateHandler );

		function updateHandler( evt, payload ) {
			progressBar.value = payload.words;
			colorBox.style.setProperty( '--hue', payload.characters * 3 );
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );

