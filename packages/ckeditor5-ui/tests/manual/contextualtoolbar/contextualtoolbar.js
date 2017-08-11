/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document, console:false */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePresets from '@ckeditor/ckeditor5-presets/src/article';
import ContextualToolbar from '../../../src/toolbar/contextual/contextualtoolbar';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePresets, ContextualToolbar ],
		toolbar: [ 'bold', 'italic', 'link', 'undo', 'redo' ],
		contextualToolbar: [ 'bold', 'italic', 'link' ]
	} )
	.then( editor => {
		window.editor = editor;

		const contextualToolbar = editor.plugins.get( 'ContextualToolbar' );

		contextualToolbar.on( 'show', evt => {
			const selectionRange = editor.document.selection.getFirstRange();
			const blockRange = Range.createOn( editor.document.getRoot().getChild( 0 ) );

			if ( selectionRange.containsRange( blockRange ) || selectionRange.isIntersecting( blockRange ) ) {
				evt.stop();
			}
		}, { priority: 'high' } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
