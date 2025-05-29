/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import BalloonToolbar from '../../../src/toolbar/balloon/balloontoolbar.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, BalloonToolbar ],
		toolbar: [ 'bold', 'italic', 'link', 'undo', 'redo' ],
		balloonToolbar: [ 'bold', 'italic', 'link' ]
	} )
	.then( editor => {
		window.editor = editor;

		const balloonToolbar = editor.plugins.get( 'BalloonToolbar' );

		balloonToolbar.on( 'show', evt => {
			const selectionRange = editor.model.document.selection.getFirstRange();
			const blockRange = editor.model.createRangeOn( editor.model.document.getRoot().getChild( 0 ) );

			if ( selectionRange.containsRange( blockRange ) || selectionRange.isIntersecting( blockRange ) ) {
				evt.stop();
			}
		}, { priority: 'high' } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
