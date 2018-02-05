/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, document */

import View from '../../../src/view/view';
import Position from '../../../src/view/position';
import createViewRoot from '../_utils/createroot';
import { parse } from '../../../src/dev-utils/view';

const view = new View();
const viewDocument = view.document;
const viewRoot = createViewRoot( viewDocument );
view.attachDomRoot( document.getElementById( 'editor' ) );

viewDocument.on( 'mutations', ( evt, mutations ) => console.log( mutations ) );
viewDocument.on( 'selectionChange', ( evt, data ) => {
	view.change( writer => writer.setSelection( data.newSelection ) );
} );

view.change( writer => {
	const data = parse(
		'<container:p>foo</container:p>' +
		'<container:p>bar</container:p>'
	);

	writer.insert( Position.createAt( viewRoot ), data );
} );
