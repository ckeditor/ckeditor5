/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document, console:false */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
import BlockToolbar from '../../../src/toolbar/block/blocktoolbar';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, HeadingButtonsUI, ParagraphButtonUI, BlockToolbar ],
		blockToolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'blockQuote' ]
	} )
	.then( editor => {
		window.editor = editor;

		const balloonToolbar = editor.plugins.get( 'BalloonToolbar' );

		balloonToolbar.on( 'show', evt => {
			const selectionRange = editor.model.document.selection.getFirstRange();
			const blockRange = Range.createOn( editor.model.document.getRoot().getChild( 0 ) );

			if ( selectionRange.containsRange( blockRange ) || selectionRange.isIntersecting( blockRange ) ) {
				evt.stop();
			}
		}, { priority: 'high' } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
