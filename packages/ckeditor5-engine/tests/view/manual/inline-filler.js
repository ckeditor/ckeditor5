/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '/ckeditor5/engine/view/document.js';
import { setData } from '/tests/engine/_utils/view.js';

const viewDocument = new Document();
viewDocument.createRoot( document.getElementById( 'editor' ) );

viewDocument.isFocused = true;

setData( viewDocument,
	'<container:p><attribute:strong>foo</attribute:strong>[]<attribute:strong>bar</attribute:strong></container:p>' );

viewDocument.on( 'selectionChange', ( evt, data ) => {
	viewDocument.selection.setTo( data.newSelection );
} );

viewDocument.render();
