/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document */

import View from '../../../src/view/view';
import createViewRoot from '../_utils/createroot';
import { StylesProcessor } from '../../../src/view/stylesmap';

const view = new View( new StylesProcessor() );
const viewDocument = view.document;

viewDocument.on( 'keydown', ( evt, data ) => console.log( 'keydown', data ) );
viewDocument.on( 'keyup', ( evt, data ) => console.log( 'keyup', data ) );

const viewRoot = createViewRoot( viewDocument, 'div', 'editable' );
view.attachDomRoot( document.getElementById( 'editable' ), 'editable' );

view.change( writer => {
	const text = writer.createText( 'foobar' );
	writer.insert( writer.createPositionAt( viewRoot, 0 ), text );
	writer.setSelection( text, 3 );
} );

view.focus();

