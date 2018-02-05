/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import View from '../../../src/view/view';
import Position from '../../../src/view/position';
import createViewRoot from '../_utils/createroot';
import { parse } from '../../../src/dev-utils/view';

const view = new View();
const viewDocument = view.document;
const viewRoot = createViewRoot( viewDocument );
view.attachDomRoot( document.getElementById( 'editor' ) );

view.change( writer => {
	const { selection, view: data } = parse(
		'<container:p><attribute:strong>foo</attribute:strong>[]<attribute:strong>bar</attribute:strong></container:p>'
	);

	writer.insert( Position.createAt( viewRoot ), data );
	writer.setSelection( selection );
} );

view.focus();

viewDocument.on( 'selectionChange', ( evt, data ) => {
	view.change( writer => {
		writer.setSelection( data.newSelection );
	} );
} );

