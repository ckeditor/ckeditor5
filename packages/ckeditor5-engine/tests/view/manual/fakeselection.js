/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, console */

import ViewDocument from '/ckeditor5/engine/view/document.js';
import ClickObserver from '/ckeditor5/engine/view/observer/clickobserver.js';
import ViewRange from '/ckeditor5/engine/view/range.js';
import { setData } from '/ckeditor5/engine/dev-utils/view.js';

const viewDocument = new ViewDocument();
const domEditable = document.getElementById( 'editor' );
const viewRoot = viewDocument.createRoot( domEditable );
let viewStrong;

viewDocument.addObserver( ClickObserver );

viewDocument.on( 'selectionChange', ( evt, data ) => {
	viewDocument.selection.setTo( data.newSelection );
	viewDocument.render();
} );

viewDocument.selection.on( 'change', () => {
	if ( viewStrong && !viewDocument.selection.isFake ) {
		viewStrong.removeStyle( 'background-color' );
	}
} );

viewDocument.on( 'click', ( evt, data ) => {
	if ( data.target == viewStrong ) {
		const range = ViewRange.createOn( viewStrong );
		viewDocument.selection.setRanges( [ range ] );
		viewDocument.selection.setFake( true, { label: 'fake selection over bar' } );
		viewStrong.setStyle( 'background-color', 'yellow' );

		viewDocument.render();
	}
} );

viewDocument.on( 'focus', () => {
	console.log( 'The document was focused' );
} );

viewDocument.on( 'blur', () => {
	console.log( 'The document was blurred' );
} );

setData( viewDocument, '<container:p>{}foo<strong contenteditable="false">bar</strong>baz</container:p>' );
const viewP = viewRoot.getChild( 0 );
viewStrong = viewP.getChild( 1 );

viewDocument.focus();
