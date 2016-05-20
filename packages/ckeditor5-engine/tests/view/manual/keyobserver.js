/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import Document from '/ckeditor5/engine/view/document.js';
import KeyObserver from '/ckeditor5/engine/view/observer/keyobserver.js';

const viewDocument = new Document();

viewDocument.on( 'keydown', ( evt, data ) => console.log( 'keydown', data ) );

viewDocument.addObserver( KeyObserver );

viewDocument.createRoot( document.getElementById( 'editable' ), 'editable' );
