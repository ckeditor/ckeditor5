/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, document */

import View from '../../../src/view/view';
import Position from '../../../src/view/position';
import createViewRoot from '../_utils/createroot';

const view = new View();
const viewDocument = view.document;

viewDocument.on( 'keydown', ( evt, data ) => console.log( 'keydown', data ) );
viewDocument.on( 'keyup', ( evt, data ) => console.log( 'keyup', data ) );

const viewRoot = createViewRoot( viewDocument, 'div', 'editable' );
view.attachDomRoot( document.getElementById( 'editable' ), 'editable' );

view.change( writer => {
	const text = writer.createText( 'foobar' );
	writer.insert( Position._createAt( viewRoot ), text );
	writer.setSelection( text, 3 );
} );

view.focus();

