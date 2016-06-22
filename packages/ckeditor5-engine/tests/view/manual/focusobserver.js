/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import Document from '/ckeditor5/engine/view/document.js';
import MutationObserver from '/ckeditor5/engine/view/observer/mutationobserver.js';
import SelectionObserver from '/ckeditor5/engine/view/observer/selectionobserver.js';
import FocusObserver from '/ckeditor5/engine/view/observer/focusobserver.js';
import { setData } from '/tests/engine/_utils/view.js';

const viewDocument = new Document();

viewDocument.on( 'focus', ( evt, data ) => console.log( 'event:focus', data.domTarget ) );
viewDocument.on( 'blur', ( evt, data ) => console.log( 'event:blur', data.domTarget ) );

const domEditable1 = document.getElementById( 'editable1' );
const domEditable2 = document.getElementById( 'editable2' );

const editable1 = viewDocument.createRoot( domEditable1, 'editable1' );
const editable2 = viewDocument.createRoot( domEditable2, 'editable2' );

viewDocument.on( 'selectionChange', ( evt, data ) => {
	viewDocument.selection.setTo( data.newSelection );
} );

viewDocument.addObserver( MutationObserver );
viewDocument.addObserver( SelectionObserver );
viewDocument.addObserver( FocusObserver );

setData( viewDocument, '<p>First editable.</p>', { rootName: 'editable1' } );
setData( viewDocument, '<p>Second editable.</p>', { rootName: 'editable2' } );

editable1.on( 'change:isFocused', () => domEditable1.style.backgroundColor = editable1.isFocused ? 'green' : 'red' );
editable2.on( 'change:isFocused', () => domEditable2.style.backgroundColor = editable2.isFocused ? 'green' : 'red' );

viewDocument.render();
