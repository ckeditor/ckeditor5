/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClipboardObserver from '../src/clipboardobserver';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import DataTransfer from '../src/datatransfer';

describe( 'ClipboardObserver', () => {
	let viewDocument, observer;

	beforeEach( () => {
		viewDocument = new ViewDocument();
		observer = viewDocument.addObserver( ClipboardObserver );
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.deep.equal( [ 'paste', 'copy', 'cut', 'drop' ] );
	} );

	describe( 'onDomEvent', () => {
		let pasteSpy, preventDefaultSpy;

		function getDataTransfer() {
			return {
				getData( type ) {
					return 'foo:' + type;
				}
			};
		}

		beforeEach( () => {
			pasteSpy = sinon.spy();
			preventDefaultSpy = sinon.spy();
		} );

		it( 'should fire paste with the right event data - clipboardData', () => {
			const dataTransfer = getDataTransfer();

			viewDocument.on( 'paste', pasteSpy );

			observer.onDomEvent( {
				type: 'paste',
				target: document.body,
				clipboardData: dataTransfer,
				preventDefault: preventDefaultSpy
			} );

			expect( pasteSpy.calledOnce ).to.be.true;

			const data = pasteSpy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
			expect( data.dataTransfer ).to.be.instanceOf( DataTransfer );
			expect( data.dataTransfer.getData( 'x/y' ) ).to.equal( 'foo:x/y' );
			expect( preventDefaultSpy.calledOnce ).to.be.true;
		} );

		it( 'should fire paste with the right event data - dataTransfer', () => {
			const dataTransfer = getDataTransfer();

			viewDocument.on( 'drop', pasteSpy );

			observer.onDomEvent( {
				type: 'drop',
				target: document.body,
				dataTransfer,
				preventDefault: preventDefaultSpy
			} );

			expect( pasteSpy.calledOnce ).to.be.true;

			const data = pasteSpy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
			expect( data.dataTransfer ).to.be.instanceOf( DataTransfer );
			expect( data.dataTransfer.getData( 'x/y' ) ).to.equal( 'foo:x/y' );
			expect( preventDefaultSpy.calledOnce ).to.be.true;
		} );
	} );
} );
