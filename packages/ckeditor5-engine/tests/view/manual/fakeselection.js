/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, console */

import ViewDocument from '/ckeditor5/engine/view/document.js';
import ViewRange from '/ckeditor5/engine/view/range.js';
import { setData } from '/ckeditor5/engine/dev-utils/view.js';

const viewDocument = new ViewDocument();
const domEditable = document.getElementById( 'editor' );
const viewRoot = viewDocument.createRoot( domEditable );
let viewStrong;

// Prevent focus stealing. Simulates how editor buttons work.
document.getElementById( 'create-fake' ).addEventListener( 'mousedown', ( evt ) => {
	evt.preventDefault();
} );

document.getElementById( 'create-fake' ).addEventListener( 'click', () => {
	const viewP = viewRoot.getChild( 0 );
	viewStrong = viewP.getChild( 1 );

	const range = ViewRange.createOn( viewStrong );
	viewDocument.selection.setRanges( [ range ] );
	viewDocument.selection.setFake( true, { label: 'fake selection over bar' } );
	viewStrong.setStyle( 'background-color', 'yellow' );
} );

viewDocument.on( 'selectionChange', ( evt, data ) => {
	viewDocument.selection.setTo( data.newSelection );
	viewDocument.render();
} );

viewDocument.selection.on( 'change', () => {
	if ( viewStrong && !viewDocument.selection.isFake ) {
		viewStrong.removeStyle( 'background-color' );
	}
} );

viewDocument.on( 'focus', () => {
	console.log( 'The document was focused' );
} );

viewDocument.on( 'blur', () => {
	console.log( 'The document was blurred' );
} );

setData( viewDocument, '<container:p>{}foo<strong>bar</strong>baz</container:p>' );
viewDocument.focus();
