/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor
	.create( document.querySelector( '#snippet-show-blocks' ), {
	} )
	.then( editor => {
		window.editor = editor;

		/* window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item && item.buttonView && item.buttonView.label === 'Show blocks' ),
			text: 'Click here to show content blocks.',
			editor,
			tippyOptions: {
				placement: 'bottom-start'
			}
		} ); */
	} )
	.catch( err => {
		console.error( err.stack );
	} );
