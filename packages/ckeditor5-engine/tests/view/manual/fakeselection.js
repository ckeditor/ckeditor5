/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, console */

import View from '../../../src/view/view';
import DomEventObserver from '../../../src/view/observer/domeventobserver';
import ViewRange from '../../../src/view/range';
import createViewRoot from '../_utils/createroot';
import { setData } from '../../../src/dev-utils/view';
import { StylesProcessor } from '../../../src/view/stylesmap';

const view = new View( new StylesProcessor() );
const viewDocument = view.document;
const domEditable = document.getElementById( 'editor' );
const viewRoot = createViewRoot( viewDocument );
let viewStrong;

view.attachDomRoot( domEditable );

// Add mouseup oberver.
view.addObserver( class extends DomEventObserver {
	get domEventType() {
		return [ 'mousedown', 'mouseup' ];
	}

	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}
} );

viewDocument.on( 'selectionChange', ( evt, data ) => {
	view.change( writer => {
		writer.setSelection( data.newSelection );
	} );
} );

viewDocument.on( 'mouseup', ( evt, data ) => {
	if ( data.target == viewStrong ) {
		console.log( 'Making selection around the <strong>.' );

		view.change( writer => {
			writer.setSelection( ViewRange._createOn( viewStrong ), { fake: true, label: 'fake selection over bar' } );
		} );

		data.preventDefault();
	}
} );

viewDocument.selection.on( 'change', () => {
	if ( !viewStrong ) {
		return;
	}

	const firstPos = viewDocument.selection.getFirstPosition();
	const lastPos = viewDocument.selection.getLastPosition();

	if ( firstPos && lastPos && firstPos.nodeAfter == viewStrong && lastPos.nodeBefore == viewStrong ) {
		view.change( writer => writer.addClass( 'selected', viewStrong ) );
	} else {
		view.change( writer => writer.removeClass( 'selected', viewStrong ) );
	}
} );

viewDocument.on( 'focus', () => {
	view.change( writer => writer.addClass( 'focused', viewStrong ) );

	console.log( 'The document was focused.' );
} );

viewDocument.on( 'blur', () => {
	view.change( writer => writer.removeClass( 'focused', viewStrong ) );

	console.log( 'The document was blurred.' );
} );

setData( view, '<container:p>{}foo<strong contenteditable="false">bar</strong>baz</container:p>' );
const viewP = viewRoot.getChild( 0 );
viewStrong = viewP.getChild( 1 );

view.focus();
