/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import View from '../../../src/view/view.js';
import createViewRoot from '../../view/_utils/createroot.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

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

