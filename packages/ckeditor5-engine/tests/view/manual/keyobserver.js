/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, document */

import Document from '../../../src/view/document';
import { setData } from '../../../src/dev-utils/view';

const viewDocument = new Document();

viewDocument.on( 'keydown', ( evt, data ) => console.log( 'keydown', data ) );
viewDocument.on( 'keyup', ( evt, data ) => console.log( 'keyup', data ) );

viewDocument.createRoot( document.getElementById( 'editable' ), 'editable' );
setData( viewDocument, 'foo{}bar', { rootName: 'editable' } );
viewDocument.focus();

