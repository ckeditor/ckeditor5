/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import Document from '/ckeditor5/engine/view/document.js';
import SelectionObserver from '/ckeditor5/engine/view/observer/selectionobserver.js';
import MutationObserver from '/ckeditor5/engine/view/observer/mutationobserver.js';
import { setData } from '/tests/engine/_utils/view.js';

const viewDocument = new Document();
const viewRoot = viewDocument.createRoot( document.getElementById( 'editor' ) );

viewDocument.addObserver( MutationObserver );
viewDocument.addObserver( SelectionObserver );

viewDocument.focusedEditable = viewRoot;

setData( viewDocument,
	'<container:p>fo{}o</container:p>' +
	'<container:p></container:p>' +
	'<container:p><attribute:strong></attribute:strong></container:p>' +
	'<container:p>bar</container:p>' );

viewDocument.on( 'selectionChange', ( evt, data ) => {
	const node = data.newSelection.getFirstPosition().parent;
	console.log( node.name ? node.name : node._data );
	viewDocument.selection.setTo( data.newSelection );
} );

viewDocument.render();
