/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';

ClassicEditor.builtinPlugins.push( SourceEditing );

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'underline',
				'link',
				'|',
				'bulletedList',
				'numberedList',
				'|',
				'insertTable',
				'|',
				'undo',
				'redo',
				'|',
				'sourceEditing'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Edit source' ),
			text: 'Click to edit the document source.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
