/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, document */

import View from '../../../src/view/view';
import createViewRoot from '../_utils/createroot';
import { setData } from '../../../src/dev-utils/view';

const view = new View();
const viewDocument = view.document;
createViewRoot( viewDocument );
view.attachDomRoot( document.getElementById( 'editor' ) );

viewDocument.on( 'mutations', ( evt, mutations ) => console.log( mutations ) );
viewDocument.on( 'selectionChange', ( evt, data ) => {
	view.change( writer => writer.setSelection( data.newSelection ) );
} );

setData( view,
	'<container:p>foo</container:p>' +
	'<container:p>bar</container:p>'
);
