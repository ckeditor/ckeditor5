/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ClipboardObserver } from '../src/clipboardobserver.js';

import { EditingView, ViewDataTransfer, ViewDowncastWriter } from '@ckeditor/ckeditor5-engine';
import { createViewRoot } from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';

describe( 'ClipboardObserver', () => {
	let view, doc, writer, observer, root, el, range, eventSpy, preventDefaultSpy, stopPropagationSpy, mockedDomDataTransferFilesSpy;

	beforeEach( () => {
		view = new EditingView();
		doc = view.document;
		writer = new ViewDowncastWriter( doc );
		root = createViewRoot( doc );

		// Create view and DOM structures.
		el = writer.createContainerElement( 'p' );
		writer.insert( writer.createPositionAt( root, 0 ), el );
		view.domConverter.viewToDom( root, { withChildren: true, bind: true } );

		doc.selection._setTo( el, 0 );
		range = writer.createRange( writer.createPositionAt( root, 1 ) );
		// Just making sure that the following tests will check anything.
		expect( range.isEqual( doc.selection.getFirstRange() ) ).toBe( false );

		observer = view.addObserver( ClipboardObserver );

		eventSpy = vi.fn();
		preventDefaultSpy = vi.fn();
		stopPropagationSpy = vi.fn();
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).toEqual(
			[ 'paste', 'copy', 'cut', 'drop', 'dragover', 'dragstart', 'dragend', 'dragenter', 'dragleave' ]
		);
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

			expect( eventSpy ).toHaveBeenCalledOnce();

			const data = eventSpy.mock.calls[ 0 ][ 1 ];

			expect( data.domTarget ).toBe( targetElement );

			expect( data.dataTransfer ).toBeInstanceOf( ViewDataTransfer );
			expect( data.dataTransfer.getData( 'x/y' ) ).toBe( 'foo:x/y' );

			expect( preventDefaultSpy ).toHaveBeenCalledOnce();
			expect( mockedDomDataTransferFilesSpy ).toHaveBeenCalledOnce();
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

			expect( eventSpy ).toHaveBeenCalledOnce();

			const data = eventSpy.mock.calls[ 0 ][ 1 ];

			expect( data.domTarget ).toBe( targetElement );

			expect( data.dataTransfer ).toBeInstanceOf( ViewDataTransfer );
			expect( data.dataTransfer.getData( 'x/y' ) ).toBe( 'foo:x/y' );

			expect( data.dropRange ).toBeNull();

			expect( preventDefaultSpy ).toHaveBeenCalledOnce();
			expect( mockedDomDataTransferFilesSpy ).toHaveBeenCalledOnce();
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

			expect( eventSpy ).toHaveBeenCalledOnce();

			const data = eventSpy.mock.calls[ 0 ][ 1 ];

			expect( data.dropRange ).toBeNull();
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

			expect( eventSpy ).toHaveBeenCalledOnce();

			const data = eventSpy.mock.calls[ 0 ][ 1 ];

			expect( data.dropRange.isEqual( range ) ).toBe( true );
			expect( caretRangeFromPointCalledWith ).toEqual( [ 10, 20 ] );
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

			expect( eventSpy ).toHaveBeenCalledOnce();

			const data = eventSpy.mock.calls[ 0 ][ 1 ];

			expect( data.dropRange.isEqual( range ) ).toBe( true );
		} );
	} );

	describe( 'clipboardInput event', () => {
		it( 'should be fired on paste', () => {
			const dataTransfer = new ViewDataTransfer( mockDomDataTransfer() );
			const normalPrioritySpy = vi.fn();

			doc.on( 'clipboardInput', eventSpy );
			doc.on( 'paste', normalPrioritySpy );

			doc.fire( 'paste', {
				dataTransfer,
				preventDefault: preventDefaultSpy
			} );

			expect( eventSpy ).toHaveBeenCalledOnce();
			expect( preventDefaultSpy ).toHaveBeenCalledOnce();

			const data = eventSpy.mock.calls[ 0 ][ 1 ];
			expect( data.dataTransfer ).toBe( dataTransfer );

			expect( data.targetRanges ).toBeNull();

			expect( normalPrioritySpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( eventSpy.mock.invocationCallOrder[ 0 ] );
		} );

		it( 'should be fired on drop', () => {
			const dataTransfer = new ViewDataTransfer( mockDomDataTransfer() );
			const normalPrioritySpy = vi.fn();

			doc.on( 'clipboardInput', eventSpy );
			doc.on( 'drop', normalPrioritySpy );

			doc.fire( 'drop', {
				dataTransfer,
				preventDefault: preventDefaultSpy,
				dropRange: range
			} );

			expect( eventSpy ).toHaveBeenCalledOnce();
			expect( preventDefaultSpy ).toHaveBeenCalledOnce();

			const data = eventSpy.mock.calls[ 0 ][ 1 ];
			expect( data.dataTransfer ).toBe( dataTransfer );

			expect( data.targetRanges ).toHaveLength( 1 );
			expect( data.targetRanges[ 0 ].isEqual( range ) ).toBe( true );

			expect( normalPrioritySpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( eventSpy.mock.invocationCallOrder[ 0 ] );
		} );

		// https://github.com/ckeditor/ckeditor5-upload/issues/92
		it( 'should stop propagation of the original event if handled by the editor', () => {
			const dataTransfer = new ViewDataTransfer( mockDomDataTransfer() );

			doc.fire( 'drop', {
				dataTransfer,
				preventDefault: preventDefaultSpy,
				stopPropagation: stopPropagationSpy,
				dropRange: range
			} );

			expect( stopPropagationSpy ).not.toHaveBeenCalled();

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

			expect( stopPropagationSpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'dragging event', () => {
		it( 'should be fired on dragover', () => {
			const dataTransfer = new ViewDataTransfer( mockDomDataTransfer() );
			const normalPrioritySpy = vi.fn();

			doc.on( 'dragging', eventSpy );
			doc.on( 'dragover', normalPrioritySpy );

			doc.fire( 'dragover', {
				dataTransfer,
				preventDefault: preventDefaultSpy,
				dropRange: range
			} );

			expect( eventSpy ).toHaveBeenCalledOnce();
			expect( preventDefaultSpy ).toHaveBeenCalledOnce();

			const data = eventSpy.mock.calls[ 0 ][ 1 ];
			expect( data.dataTransfer ).toBe( dataTransfer );

			expect( data.targetRanges ).toHaveLength( 1 );
			expect( data.targetRanges[ 0 ].isEqual( range ) ).toBe( true );

			expect( normalPrioritySpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( eventSpy.mock.invocationCallOrder[ 0 ] );
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
				dataTransfer,
				preventDefault: preventDefaultSpy,
				stopPropagation: stopPropagationSpy
			} );

			expect( eventSpy ).toHaveBeenCalledOnce();
			expect( preventDefaultSpy ).toHaveBeenCalledOnce();

			const data = eventSpy.mock.calls[ 0 ][ 1 ];

			expect( data.document ).toBe( doc );
			expect( data.domTarget ).toBe( targetElement );
			expect( data.domEvent.type ).toBe( 'dragover' );
			expect( data.dataTransfer.files ).toEqual( dataTransfer.files );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/13366
		it( 'should not access native DataTransfer files if not needed', () => {
			const dataTransfer = mockDomDataTransfer();
			const targetElement = mockDomTargetElement( {} );

			doc.on( 'dragover', eventSpy );

			observer.onDomEvent( {
				type: 'dragover',
				target: targetElement,
				dataTransfer,
				preventDefault: preventDefaultSpy
			} );

			expect( eventSpy ).toHaveBeenCalledOnce();

			const data = eventSpy.mock.calls[ 0 ][ 1 ];

			expect( data.domTarget ).toBe( targetElement );

			expect( data.dataTransfer ).toBeInstanceOf( ViewDataTransfer );
			expect( data.dataTransfer.getData( 'x/y' ) ).toBe( 'foo:x/y' );

			expect( data.dropRange ).toBeNull();

			expect( preventDefaultSpy ).toHaveBeenCalledOnce();
			expect( mockedDomDataTransferFilesSpy ).not.toHaveBeenCalled();
		} );
	} );

	// Returns a super simple mock of HTMLElement (we use only ownerDocument from it).
	function mockDomTargetElement( documentMock ) {
		return {
			ownerDocument: documentMock
		};
	}

	function mockDomDataTransfer() {
		mockedDomDataTransferFilesSpy = vi.fn();

		return {
			get files() {
				mockedDomDataTransferFilesSpy();
				return [];
			},
			getData( type ) {
				return 'foo:' + type;
			}
		};
	}
} );
