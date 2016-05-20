/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import Document from '/ckeditor5/engine/view/document.js';
import MutationObserver from '/ckeditor5/engine/view/observer/mutationobserver.js';
import { setData } from '/tests/engine/_utils/view.js';

const viewDocument = new Document();
viewDocument.createRoot( document.getElementById( 'editor' ) );

viewDocument.on( 'mutations', ( evt, mutations ) => console.log( mutations ) );

viewDocument.addObserver( MutationObserver );

setData( viewDocument,
	'<container:p>foo</container:p>' +
	'<container:p>bar</container:p>' );

viewDocument.render();
