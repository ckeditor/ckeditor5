/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, document */

import Document from '../../../src/view/document';
import { setData } from '../../../src/dev-utils/view';

const viewDocument = new Document();
viewDocument.createRoot( document.getElementById( 'editor' ) );

viewDocument.isFocused = true;

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
