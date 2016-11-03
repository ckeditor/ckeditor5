/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClipboardObserver from 'ckeditor5/clipboard/clipboardobserver.js';
import ViewDocument from 'ckeditor5/engine/view/document.js';
import DataTransfer from 'ckeditor5/clipboard/datatransfer.js';

describe( 'ClipboardObserver', () => {
	let viewDocument, observer;

	beforeEach( () => {
		viewDocument = new ViewDocument();
		observer = viewDocument.addObserver( ClipboardObserver );
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.equal( 'paste' );
	} );

	describe( 'onDomEvent', () => {
		it( 'should fire paste with the right event data', () => {
			const spy = sinon.spy();
			const dataTransfer = {
				getData( type ) {
					return 'foo:' + type;
				}
			};

			viewDocument.on( 'paste', spy );

			observer.onDomEvent( { type: 'paste', target: document.body, clipboardData: dataTransfer } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
			expect( data.dataTransfer ).to.be.instanceOf( DataTransfer );
			expect( data.dataTransfer.getData( 'x/y' ) ).to.equal( 'foo:x/y' );
		} );
	} );
} );
