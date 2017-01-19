/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import Document from '../../../src/view/document';
import { setData } from '../../../src/dev-utils/view';

const viewDocument = new Document();
const iframe = document.getElementById( 'iframe' );
viewDocument.createRoot( iframe.contentWindow.document.getElementById( 'editor' ) );

setData( viewDocument,
	'<container:p>foo</container:p>' +
	'<container:p>bar</container:p>' );

viewDocument.render();
