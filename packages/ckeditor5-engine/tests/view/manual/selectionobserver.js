/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document */

import Document from '../../../src/view/document';
import { setData } from '../../../src/dev-utils/view';

const viewDocument = new Document();
viewDocument.createRoot( document.getElementById( 'editor' ) );

setData( viewDocument,
	'<container:p><attribute:b>foo</attribute:b>bar</container:p>' +
	'<container:p>bom</container:p>' );

viewDocument.on( 'selectionChange', ( evt, data ) => {
	console.log( 'selectionChange', data ); // eslint-disable-line no-console
	viewDocument.selection.setTo( data.newSelection );
} );

viewDocument.on( 'selectionChangeDone', ( evt, data ) => {
	console.log( '%c selectionChangeDone ', 'background: #222; color: #bada55', data ); // eslint-disable-line no-console
	viewDocument.selection.setTo( data.newSelection );
} );

viewDocument.render();
