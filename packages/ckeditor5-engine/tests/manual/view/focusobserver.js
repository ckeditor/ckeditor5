/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import View from '../../../src/view/view.js';
import createViewRoot from '../../view/_utils/createroot.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

const view = new View( new StylesProcessor() );
const viewDocument = view.document;

viewDocument.on( 'focus', ( evt, data ) => console.log( `Focus in ${ data.domTarget.id }.` ) );
viewDocument.on( 'blur', ( evt, data ) => console.log( `Blur in ${ data.domTarget.id }.` ) );

const domEditable1 = document.getElementById( 'editable1' );
const domEditable2 = document.getElementById( 'editable2' );

const editable1 = createViewRoot( viewDocument, 'div', 'editable1' );
const editable2 = createViewRoot( viewDocument, 'div', 'editable2' );

view.attachDomRoot( domEditable1, 'editable1' );
view.attachDomRoot( domEditable2, 'editable2' );

viewDocument.on( 'selectionChange', ( evt, data ) => {
	view.change( writer => {
		writer.setSelection( data.newSelection );
	} );
} );

view.change( writer => {
	writer.insert( writer.createPositionAt( editable1, 0 ), writer.createText( 'First editable.' ) );
	writer.insert( writer.createPositionAt( editable2, 0 ), writer.createText( 'Second editable.' ) );

	writer.setSelection( editable1, 'end' );
} );

editable1.on( 'change:isFocused', () => {
	domEditable1.style.backgroundColor = editable1.isFocused ? 'green' : 'red';
} );

editable2.on( 'change:isFocused', () => {
	domEditable2.style.backgroundColor = editable2.isFocused ? 'green' : 'red';
} );

view.focus();
