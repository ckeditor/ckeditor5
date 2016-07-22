/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '/ckeditor5/engine/view/document.js';
import { setData } from '/tests/engine/_utils/view.js';

const viewDocument = new Document();
const iframe = document.getElementById( 'iframe' );
viewDocument.createRoot( iframe.contentWindow.document.getElementById( 'editor' ) );

setData( viewDocument,
	'<container:p>foo</container:p>' +
	'<container:p>bar</container:p>' );

viewDocument.render();
