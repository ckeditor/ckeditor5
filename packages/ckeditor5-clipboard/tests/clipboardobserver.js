/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClipboardObserver from '../src/clipboardobserver';
import View from '@ckeditor/ckeditor5-engine/src/view/view';
import DowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter';
import DataTransfer from '../src/datatransfer';
import createViewRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot';

describe( 'ClipboardObserver', () => {
	let view, doc, writer, observer, root, el, range, eventSpy, preventDefaultSpy, stopPropagationSpy;

	beforeEach( () => {
		view = new View();
		doc = view.document;
		writer = new DowncastWriter( doc );
		root = createViewRoot( doc );

		// Create view and DOM structures.
		el = writer.createContainerElement( 'p' );
		writer.insert( writer.createPositionAt( root, 0 ), el );
		view.domConverter.viewToDom( root, document, { withChildren: true, bind: true } );

		doc.selection._setTo( el, 0 );
		range = writer.createRange( writer.createPositionAt( root, 1 ) );
		// Just making sure that the following tests will check anything.
		expect( range.isEqual( doc.selection.getFirstRange() ) ).to.be.false;

		observer = view.addObserver( ClipboardObserver );

		eventSpy = sinon.spy();
		preventDefaultSpy = sinon.spy();
		stopPropagationSpy = sinon.spy();
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.deep.equal( [ 'paste', 'copy', 'cut', 'drop', 'dragover' ] );
	} );

	describe( 'paste event', () => {
		it( 'should be fired with the right event data', () => {
			const dataTransfer = mockDomDataTransfer();
			const targetElement = mockDomTargetElement( {} );

			doc.on( 'paste', eventSpy );

			observer.onDomEvent( {
				type: 'paste',
				target: targetElement,
				clipboardData: dataTransfer,
				preventDefault: preventDefaultSpy
			} );

			expect( eventSpy.calledOnce ).to.be.true;

			const data = eventSpy.args[ 0 ][ 1 ];

			expect( data.domTarget ).to.equal( targetElement );

			expect( data.dataTransfer ).to.be.instanceOf( DataTransfer );
			expect( data.dataTransfer.getData( 'x/y' ) ).to.equal( 'foo:x/y' );

			expect( preventDefaultSpy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'drop event', () => {
		it( 'should be fired with the right event data - basics', () => {
			const dataTransfer = mockDomDataTransfer();
			const targetElement = mockDomTargetElement( {} );

			doc.on( 'drop', eventSpy );

			observer.onDomEvent( {
				type: 'drop',
				target: targetElement,
				dataTransfer,
				preventDefault: preventDefaultSpy
			} );

			expect( eventSpy.calledOnce ).to.be.true;

			const data = eventSpy.args[ 0 ][ 1 ];

			expect( data.domTarget ).to.equal( targetElement );

			expect( data.dataTransfer ).to.be.instanceOf( DataTransfer );
			expect( data.dataTransfer.getData( 'x/y' ) ).to.equal( 'foo:x/y' );

			expect( data.dropRange.isEqual( doc.selection.getFirstRange() ) ).to.be.true;

			expect( preventDefaultSpy.calledOnce ).to.be.true;
		} );

		it( 'should be fired with the right event data – dropRange (when no info about it in the drop event)', () => {
			const dataTransfer = mockDomDataTransfer();
			const targetElement = mockDomTargetElement( {} );

			doc.on( 'drop', eventSpy );

			observer.onDomEvent( {
				type: 'drop',
				target: targetElement,
				dataTransfer,
				preventDefault() {}
			} );

			expect( eventSpy.calledOnce ).to.be.true;

			const data = eventSpy.args[ 0 ][ 1 ];

			expect( data.dropRange.isEqual( doc.selection.getFirstRange() ) ).to.be.true;
		} );

		it( 'should be fired with the right event data – dropRange (when document.caretRangeFromPoint present)', () => {
			let caretRangeFromPointCalledWith;

			const domRange = view.domConverter.viewRangeToDom( range );
			const dataTransfer = mockDomDataTransfer();
			const targetElement = mockDomTargetElement( {
				caretRangeFromPoint( x, y ) {
					caretRangeFromPointCalledWith = [ x, y ];

					return domRange;
				}
			} );

			doc.on( 'drop', eventSpy );

			observer.onDomEvent( {
				type: 'drop',
				target: targetElement,
				dataTransfer,
				clientX: 10,
				clientY: 20,
				preventDefault() {}
			} );

			expect( eventSpy.calledOnce ).to.be.true;

			const data = eventSpy.args[ 0 ][ 1 ];

			expect( data.dropRange.isEqual( range ) ).to.be.true;
			expect( caretRangeFromPointCalledWith ).to.deep.equal( [ 10, 20 ] );
		} );

		it( 'should be fired with the right event data – dropRange (when evt.rangeParent|Offset present)', () => {
			const domRange = view.domConverter.viewRangeToDom( range );
			const dataTransfer = mockDomDataTransfer();
			const targetElement = mockDomTargetElement( {
				createRange() {
					return document.createRange();
				}
			} );

			doc.on( 'drop', eventSpy );

			observer.onDomEvent( {
				type: 'drop',
				target: targetElement,
				dataTransfer,
				rangeParent: domRange.startContainer,
				rangeOffset: domRange.startOffset,
				preventDefault() {}
			} );

			expect( eventSpy.calledOnce ).to.be.true;

			const data = eventSpy.args[ 0 ][ 1 ];

			expect( data.dropRange.isEqual( range ) ).to.be.true;
		} );
	} );

	describe( 'clipboardInput event', () => {
		it( 'should be fired on paste', () => {
			const dataTransfer = new DataTransfer( mockDomDataTransfer() );
			const normalPrioritySpy = sinon.spy();

			doc.on( 'clipboardInput', eventSpy );
			doc.on( 'paste', normalPrioritySpy );

			doc.fire( 'paste', {
				dataTransfer,
				preventDefault: preventDefaultSpy
			} );

			expect( eventSpy.calledOnce ).to.be.true;
			expect( preventDefaultSpy.calledOnce ).to.be.true;

			const data = eventSpy.args[ 0 ][ 1 ];
			expect( data.dataTransfer ).to.equal( dataTransfer );

			expect( data.targetRanges ).to.have.length( 1 );
			expect( data.targetRanges[ 0 ].isEqual( doc.selection.getFirstRange() ) ).to.be.true;

			expect( sinon.assert.callOrder( normalPrioritySpy, eventSpy ) );
		} );

		it( 'should be fired on drop', () => {
			const dataTransfer = new DataTransfer( mockDomDataTransfer() );
			const normalPrioritySpy = sinon.spy();

			doc.on( 'clipboardInput', eventSpy );
			doc.on( 'drop', normalPrioritySpy );

			doc.fire( 'drop', {
				dataTransfer,
				preventDefault: preventDefaultSpy,
				dropRange: range
			} );

			expect( eventSpy.calledOnce ).to.be.true;
			expect( preventDefaultSpy.calledOnce ).to.be.true;

			const data = eventSpy.args[ 0 ][ 1 ];
			expect( data.dataTransfer ).to.equal( dataTransfer );

			expect( data.targetRanges ).to.have.length( 1 );
			expect( data.targetRanges[ 0 ].isEqual( range ) ).to.be.true;

			expect( sinon.assert.callOrder( normalPrioritySpy, eventSpy ) );
		} );

		// https://github.com/ckeditor/ckeditor5-upload/issues/92
		it( 'should stop propagation of the original event if handled by the editor', () => {
			const dataTransfer = new DataTransfer( mockDomDataTransfer() );

			doc.fire( 'drop', {
				dataTransfer,
				preventDefault: preventDefaultSpy,
				stopPropagation: stopPropagationSpy,
				dropRange: range
			} );

			sinon.assert.notCalled( stopPropagationSpy );

			doc.on( 'clipboardInput', evt => {
				// E.g. some feature handled the input.
				evt.stop();
			} );

			doc.fire( 'drop', {
				dataTransfer,
				preventDefault: preventDefaultSpy,
				stopPropagation: stopPropagationSpy,
				dropRange: range
			} );

			sinon.assert.calledOnce( stopPropagationSpy );
		} );
	} );

	describe( 'dragover event', () => {
		it( 'should fire when a file is dragging over the document', () => {
			const targetElement = mockDomTargetElement( {} );
			const dataTransfer = mockDomDataTransfer();

			doc.on( 'dragover', eventSpy );

			observer.onDomEvent( {
				type: 'dragover',
				target: targetElement,
				dataTransfer
			} );

			expect( eventSpy.calledOnce ).to.equal( true );

			const data = eventSpy.args[ 0 ][ 1 ];

			expect( data.document ).to.equal( doc );
			expect( data.domTarget ).to.equal( targetElement );
			expect( data.domEvent.type ).to.equal( 'dragover' );
			expect( data.dataTransfer.files ).to.deep.equal( dataTransfer.files );
		} );
	} );
} );

// Returns a super simple mock of HTMLElement (we use only ownerDocument from it).
function mockDomTargetElement( documentMock ) {
	return {
		ownerDocument: documentMock
	};
}

function mockDomDataTransfer() {
	return {
		files: [],
		getData( type ) {
			return 'foo:' + type;
		}
	};
}
