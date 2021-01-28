/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

ClassicEditor
	.create( document.querySelector( '#snippet-block-quote' ), {
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'|',
				'bulletedList',
				'numberedList',
				'|',
				'blockQuote',
				'outdent',
				'indent',
				'|',
				'undo',
				'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Block quote' ),
			text: 'Click to insert a block quote.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
