/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document, console:false */

import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
import BalloonToolbar from '../../../src/toolbar/balloon/balloontoolbar';
import BlockToolbar from '../../../src/toolbar/block/blocktoolbar';

class CustomBlockToolbar extends BlockToolbar {
	init() {
		super.init();

		this.on( 'checkAllowed', ( evt, args ) => {
			const viewElement = args[ 0 ];

			if ( viewElement.name === 'h2' ) {
				evt.return = false;
			}
		} );
	}
}

BalloonEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, HeadingButtonsUI, ParagraphButtonUI, BalloonToolbar, CustomBlockToolbar ],
		balloonToolbar: [ 'bold', 'italic', 'link' ],
		blockToolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'blockQuote' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
