/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import View from '../../../src/view/view.js';
import ViewPosition from '../../../src/view/position.js';
import ViewRange from '../../../src/view/range.js';
import createViewRoot from '../../view/_utils/createroot.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

const view = new View( new StylesProcessor() );
const viewDocument = view.document;

const domEditable1 = document.getElementById( 'editable1' );
const domEditable2 = document.getElementById( 'editable2' );

const editable1 = createViewRoot( viewDocument, 'div', 'editable1' );
view.attachDomRoot( domEditable1, 'editable1' );

const editable2 = createViewRoot( viewDocument, 'div', 'editable2' );
view.attachDomRoot( domEditable2, 'editable2' );

let text1, text2;

view.change( writer => {
	text1 = writer.createText( 'Foo bar baz' );
	text2 = writer.createText( 'Foo bar baz' );

	writer.insert( ViewPosition._createAt( editable1, 0 ), text1 );
	writer.insert( ViewPosition._createAt( editable2, 0 ), text2 );
} );

document.getElementById( 'button1' ).addEventListener( 'click', () => {
	view.change( writer => {
		writer.setSelection( ViewRange._createFromParentsAndOffsets( text1, 4, text1, 7 ) );
	} );

	view.focus();
} );

document.getElementById( 'button2' ).addEventListener( 'click', () => {
	view.change( writer => {
		writer.setSelection( ViewRange._createFromParentsAndOffsets( text2, 0, text2, 3 ) );
	} );

	view.focus();
} );

