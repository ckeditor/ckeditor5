/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import Document from '../../../src/view/document';
import { setData } from '../../../src/dev-utils/view';

const viewDocument = new Document();
viewDocument.createRoot( document.getElementById( 'editor' ) );

viewDocument.isFocused = true;

setData( viewDocument,
	'<container:p><attribute:strong>foo</attribute:strong>[]<attribute:strong>bar</attribute:strong></container:p>' );

viewDocument.on( 'selectionChange', ( evt, data ) => {
	viewDocument.selection.setTo( data.newSelection );

	// Needed due to https://github.com/ckeditor/ckeditor5-engine/issues/796.
	viewDocument.render();
} );

viewDocument.render();
