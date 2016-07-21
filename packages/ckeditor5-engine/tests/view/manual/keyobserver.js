/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

import Document from '/ckeditor5/engine/view/document.js';

const viewDocument = new Document();

viewDocument.on( 'keydown', ( evt, data ) => console.log( 'keydown', data ) );

viewDocument.createRoot( document.getElementById( 'editable' ), 'editable' );
