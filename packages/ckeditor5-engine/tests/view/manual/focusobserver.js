/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, document */

import Document from '../../../src/view/document';
import { setData } from '../../../src/dev-utils/view';

const viewDocument = new Document();

viewDocument.on( 'focus', ( evt, data ) => console.log( `Focus in ${ data.domTarget.id }.` ) );
viewDocument.on( 'blur', ( evt, data ) => console.log( `Blur in ${ data.domTarget.id }.` ) );

const domEditable1 = document.getElementById( 'editable1' );
const domEditable2 = document.getElementById( 'editable2' );

const editable1 = viewDocument.createRoot( domEditable1, 'editable1' );
const editable2 = viewDocument.createRoot( domEditable2, 'editable2' );

viewDocument.on( 'selectionChange', ( evt, data ) => {
	viewDocument.selection.setTo( data.newSelection );
	viewDocument.render();
} );

setData( viewDocument, '<container:p>{}First editable.</container:p>', { rootName: 'editable1' } );
setData( viewDocument, '<container:p>Second editable.</container:p>', { rootName: 'editable2' } );

editable1.on( 'change:isFocused', () => {
	domEditable1.style.backgroundColor = editable1.isFocused ? 'green' : 'red';
} );
editable2.on( 'change:isFocused', () => {
	domEditable2.style.backgroundColor = editable2.isFocused ? 'green' : 'red';
} );

viewDocument.focus();
