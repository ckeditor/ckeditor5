/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import Document from '/ckeditor5/engine/view/document.js';
import FocusObserver from '/ckeditor5/engine/view/observer/focusobserver.js';

const viewDocument = new Document();

viewDocument.on( 'focus', ( evt, data ) => console.log( 'focus', data.domTarget ) );
viewDocument.on( 'blur', ( evt, data ) => console.log( 'blur', data.domTarget ) );

viewDocument.addObserver( FocusObserver );

viewDocument.createRoot( document.getElementById( 'editable1' ), 'editable1' );
viewDocument.createRoot( document.getElementById( 'editable2' ), 'editable2' );
