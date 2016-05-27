/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import Document from '/ckeditor5/engine/view/document.js';
import FocusObserver from '/ckeditor5/engine/view/observer/focusobserver.js';

const viewDocument = new Document();

viewDocument.on( 'focus', ( evt, data ) => console.log( 'event:focus', data.domTarget ) );
viewDocument.on( 'blur', ( evt, data ) => console.log( 'event:blur', data.domTarget ) );

viewDocument.addObserver( FocusObserver );

const domEditable1 = document.getElementById( 'editable1' );
const domEditable2 = document.getElementById( 'editable2' );

const editable1 = viewDocument.createRoot( domEditable1, 'editable1' );
const editable2 = viewDocument.createRoot( domEditable2, 'editable2' );

editable1.on( 'change:isFocused', () => domEditable1.style.backgroundColor = editable1.isFocused ? 'green' : 'red' );
editable2.on( 'change:isFocused', () => domEditable2.style.backgroundColor = editable2.isFocused ? 'green' : 'red' );
