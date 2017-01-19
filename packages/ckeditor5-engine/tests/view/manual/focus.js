/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import Document from '../../../src/view/document';
import { parse } from '../../../src/dev-utils/view';

const viewDocument = new Document();

const domEditable1 = document.getElementById( 'editable1' );
const domEditable2 = document.getElementById( 'editable2' );

const editable1 = viewDocument.createRoot( domEditable1, 'editable1' );
const editable2 = viewDocument.createRoot( domEditable2, 'editable2' );

viewDocument.on( 'selectionChange', ( evt, data ) => {
	viewDocument.selection.setTo( data.newSelection );
} );

const { selection: selection1 } = parse( '<p>Foo {bar} baz.</p>', { rootElement: editable1 } );
const { selection: selection2 } = parse( '<p>{Foo} bar baz.</p>', { rootElement: editable2 } );

document.getElementById( 'button1' ).addEventListener( 'click', () => {
	viewDocument.selection.setTo( selection1 );
	viewDocument.focus();
} );

document.getElementById( 'button2' ).addEventListener( 'click', () => {
	viewDocument.selection.setTo( selection2 );
	viewDocument.focus();
} );

viewDocument.render();
