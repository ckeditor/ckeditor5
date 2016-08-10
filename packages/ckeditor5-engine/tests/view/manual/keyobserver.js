/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document */

import Document from '/ckeditor5/engine/view/document.js';
import { setData } from '/tests/engine/_utils/view.js';

const viewDocument = new Document();

viewDocument.on( 'keydown', ( evt, data ) => console.log( 'keydown', data ) );

viewDocument.createRoot( document.getElementById( 'editable' ), 'editable' );
setData( viewDocument, 'foo{}bar', { rootName: 'editable' } );
viewDocument.focus();

