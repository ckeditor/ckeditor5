/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Model } from '../../src/model/model.js';
import { ModelElement } from '../../src/model/element.js';
import { ModelDocumentFragment } from '../../src/model/documentfragment.js';
import { ModelPosition } from '../../src/model/position.js';
import { ModelLiveRange } from '../../src/model/liverange.js';
import { ModelRange } from '../../src/model/range.js';
import { ModelText } from '../../src/model/text.js';
import { MoveOperation } from '../../src/model/operation/moveoperation.js';
import { MergeOperation } from '../../src/model/operation/mergeoperation.js';
import { DetachOperation } from '../../src/model/operation/detachoperation.js';
import { _stringifyModel, _setModelData } from '../../src/dev-utils/model.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'LiveRange', () => {
	let model, doc, root, ul, p;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();

		const lis = [
			new ModelElement( 'li', [], new ModelText( 'aaaaaaaaaa' ) ),
			new ModelElement( 'li', [], new ModelText( 'bbbbbbbbbb' ) ),
			new ModelElement( 'li', [], new ModelText( 'cccccccccc' ) ),
			new ModelElement( 'li', [], new ModelText( 'dddddddddd' ) ),
			new ModelElement( 'li', [], new ModelText( 'eeeeeeeeee' ) ),
			new ModelElement( 'li', [], new ModelText( 'ffffffffff' ) ),
			new ModelElement( 'li', [], new ModelText( 'gggggggggg' ) ),
			new ModelElement( 'li', [], new ModelText( 'hhhhhhhhhh' ) )
		];

		ul = new ModelElement( 'ul', [], lis );
		p = new ModelElement( 'p', [], new ModelText( 'qwertyuiop' ) );

		root._insertChild( 0, [ ul, p, new ModelText( 'xyzxyz' ) ] );
	} );

	it( 'should be an instance of Range', () => {
		const live = new ModelLiveRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1 ] ) );
		live.detach();

		expect( live ).toBeInstanceOf( ModelRange );
	} );

	it( 'should listen to the model applyOperation event', () => {
		const spy = vi.spyOn( ModelLiveRange.prototype, 'listenTo' );

		const live = new ModelLiveRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1 ] ) );
		live.detach();

		expect( spy ).toHaveBeenCalledWith( model, 'applyOperation', expect.anything(), expect.anything() );

		spy.mockRestore();
	} );

	it( 'should stop listening when detached', () => {
		const spy = vi.spyOn( ModelLiveRange.prototype, 'stopListening' );

		const live = new ModelLiveRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1 ] ) );
		live.detach();

		expect( spy ).toHaveBeenCalled();

		spy.mockRestore();
	} );

	it( 'should throw if given root is not a ModelRootElement and no model is provided', () => {
		const docFrag = new ModelDocumentFragment( [ new ModelElement( 'paragraph', [], new ModelText( 'abc' ) ) ] );

		expectToThrowCKEditorError( () => {
			new ModelLiveRange( new ModelPosition( docFrag, [ 0 ] ), new ModelPosition( docFrag, [ 1 ] ) ); // eslint-disable-line no-new
		}, /model-liverange-no-model-reference/, docFrag );
	} );

	it( 'should not throw if given root is not a ModelRootElement but a model is provided', () => {
		const docFrag = new ModelDocumentFragment( [ new ModelElement( 'paragraph', [], new ModelText( 'abc' ) ) ] );

		expect( () => {
			const live = new ModelLiveRange( new ModelPosition( docFrag, [ 0 ] ), new ModelPosition( docFrag, [ 1 ] ), model );
			live.detach();
		} ).not.toThrow();
	} );

	it( '_createIn should return ModelLiveRange', () => {
		const range = ModelLiveRange._createIn( p );
		expect( range ).toBeInstanceOf( ModelLiveRange );
		range.detach();
	} );

	it( '_createFromPositionAndShift should return ModelLiveRange', () => {
		const range = ModelLiveRange._createFromPositionAndShift( new ModelPosition( root, [ 0, 1 ] ), 4 );
		expect( range ).toBeInstanceOf( ModelLiveRange );
		range.detach();
	} );

	it( 'should fire change:range event with when its boundaries are changed', () => {
		const live = new ModelLiveRange( new ModelPosition( root, [ 0, 1, 4 ] ), new ModelPosition( root, [ 0, 2, 2 ] ) );
		const copy = live.toRange();

		const spy = vi.fn();
		live.on( 'change:range', spy );

		const sourcePosition = new ModelPosition( root, [ 2 ] );
		const targetPosition = new ModelPosition( root, [ 0 ] );

		model.change( writer => {
			const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );

			writer.move( sourceRange, targetPosition );
		} );

		expect( spy ).toHaveBeenCalledOnce();

		// First parameter available in event should be a range that is equal to the live range before the live range changed.
		expect( spy.mock.calls[ 0 ][ 1 ].isEqual( copy ) ).toBe( true );

		// Second parameter is null for operations that did not move the range into graveyard.
		expect( spy.mock.calls[ 0 ][ 2 ].deletionPosition ).toBeNull();
	} );

	it( 'should fire change:content event when content inside the range has changed', () => {
		const live = new ModelLiveRange( new ModelPosition( root, [ 0, 1 ] ), new ModelPosition( root, [ 0, 3 ] ) );

		const spy = vi.fn();
		live.on( 'change:content', spy );

		const sourcePosition = new ModelPosition( root, [ 0, 2, 0 ] );
		const targetPosition = new ModelPosition( root, [ 0, 4, 0 ] );

		model.change( writer => {
			const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 2 );

			writer.move( sourceRange, targetPosition );
		} );

		expect( spy ).toHaveBeenCalledOnce();

		// First parameter available in event should be a range that is equal to the live range before the live range changed.
		expect( spy.mock.calls[ 0 ][ 1 ].isEqual( live ) ).toBe( true );

		// Second parameter is null for operations that did not move the range into graveyard.
		expect( spy.mock.calls[ 0 ][ 2 ].deletionPosition ).toBeNull();
	} );

	it( 'should pass deletion position if range was removed (remove)', () => {
		const live = new ModelLiveRange( new ModelPosition( root, [ 0, 2 ] ), new ModelPosition( root, [ 0, 4 ] ) );

		const spy = vi.fn();
		live.on( 'change:range', spy );

		const sourcePosition = new ModelPosition( root, [ 0, 0 ] );

		model.change( writer => {
			writer.remove( ModelRange._createFromPositionAndShift( sourcePosition, 6 ) );
		} );

		// Second parameter is deletion position.
		expect( spy.mock.calls[ 0 ][ 2 ].deletionPosition.isEqual( sourcePosition ) ).toBe( true );
	} );

	// This scenario is hypothetically possible during OT if the element to merge-into was removed.
	// In that case a live range inside the merged element will be merged into an element which is in graveyard.
	// Because it may happen only in OT, in the test below we will generate operations by hand.
	it( 'should pass deletion position if range was removed (merge)', () => {
		const live = new ModelLiveRange( new ModelPosition( root, [ 1, 0 ] ), new ModelPosition( root, [ 1, 1 ] ) );

		const spy = vi.fn();
		live.on( 'change:range', spy );

		model.change( writer => {
			const batch = writer.batch;
			const gy = model.document.graveyard;

			const remove = new MoveOperation(
				new ModelPosition( root, [ 0 ] ),
				1,
				new ModelPosition( gy, [ 0 ] ),
				model.document.version
			);

			const merge = new MergeOperation(
				new ModelPosition( root, [ 0, 0 ] ),
				10,
				new ModelPosition( gy, [ 0, 0 ] ),
				new ModelPosition( gy, [ 0 ] ),
				model.document.version + 1
			);

			batch.addOperation( remove );
			model.applyOperation( remove );

			batch.addOperation( merge );
			model.applyOperation( merge );
		} );

		// Second parameter is deletion position.
		expect( spy.mock.calls[ 1 ][ 2 ].deletionPosition.isEqual( new ModelPosition( root, [ 0 ] ) ) ).toBe( true );
	} );

	describe( 'is()', () => {
		let live;

		beforeEach( () => {
			live = new ModelLiveRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1 ] ) );
			live.detach();
		} );

		it( 'should return true for "liveRange" and "range"', () => {
			expect( live.is( 'liveRange' ) ).toBe( true );
			expect( live.is( 'model:liveRange' ) ).toBe( true );
			expect( live.is( 'range' ) ).toBe( true );
			expect( live.is( 'model:range' ) ).toBe( true );
		} );

		it( 'should return false for incorrect values', () => {
			expect( live.is( 'model' ) ).toBe( false );
			expect( live.is( 'model:node' ) ).toBe( false );
			expect( live.is( '$text' ) ).toBe( false );
			expect( live.is( 'element', 'paragraph' ) ).toBe( false );
		} );
	} );

	describe( '_fromRangeInDocumentFragment()', () => {
		let docFrag, el1, el2;

		beforeEach( () => {
			el1 = new ModelElement( 'paragraph', [], new ModelText( 'abc' ) );
			el2 = new ModelElement( 'paragraph', [], new ModelText( 'xyz' ) );
			docFrag = new ModelDocumentFragment( [ el1, el2 ] );
		} );

		it( 'should return a ModelLiveRange', () => {
			const live = ModelLiveRange._fromRangeInDocumentFragment(
				new ModelRange( new ModelPosition( docFrag, [ 0 ] ), new ModelPosition( docFrag, [ 2 ] ) ),
				model
			);

			expect( live ).toBeInstanceOf( ModelLiveRange );
			expect( live.root ).toBe( docFrag );
			expect( live.start.path ).toEqual( [ 0 ] );
			expect( live.end.path ).toEqual( [ 2 ] );

			live.detach();
		} );

		it( 'should listen to the provided model applyOperation event', () => {
			const spy = vi.spyOn( ModelLiveRange.prototype, 'listenTo' );

			const live = ModelLiveRange._fromRangeInDocumentFragment(
				new ModelRange( new ModelPosition( docFrag, [ 0 ] ), new ModelPosition( docFrag, [ 2 ] ) ),
				model
			);

			expect( spy ).toHaveBeenCalledWith( model, 'applyOperation', expect.any( Function ), expect.any( Object ) );

			live.detach();
			spy.mockRestore();
		} );

		it( 'should get transformed when content is detached from before the range', () => {
			const live = ModelLiveRange._fromRangeInDocumentFragment(
				new ModelRange( new ModelPosition( docFrag, [ 1 ] ), new ModelPosition( docFrag, [ 2 ] ) ),
				model
			);
			const spy = vi.fn();
			live.on( 'change:range', spy );

			model.applyOperation( new DetachOperation( ModelPosition._createBefore( el1 ), 1 ) );

			expect( live.start.path ).toEqual( [ 0 ] );
			expect( live.end.path ).toEqual( [ 1 ] );
			expect( spy ).toHaveBeenCalledOnce();

			live.detach();
		} );

		it( 'should get transformed even though the operation is not a document operation', () => {
			const live = ModelLiveRange._fromRangeInDocumentFragment(
				new ModelRange( new ModelPosition( docFrag, [ 1, 1 ] ), new ModelPosition( docFrag, [ 1, 2 ] ) ),
				model
			);

			const op = new DetachOperation( new ModelPosition( docFrag, [ 1, 0 ] ), 1 );

			expect( op.isDocumentOperation ).toBe( false );

			model.applyOperation( op );

			expect( live.start.path ).toEqual( [ 1, 0 ] );
			expect( live.end.path ).toEqual( [ 1, 1 ] );

			live.detach();
		} );

		it( 'should fire change:drop and collapse at deletionPosition when the whole range is removed', () => {
			const live = ModelLiveRange._fromRangeInDocumentFragment(
				new ModelRange( new ModelPosition( docFrag, [ 0, 1 ] ), new ModelPosition( docFrag, [ 0, 2 ] ) ),
				model
			);
			const dropSpy = vi.fn();
			const rangeSpy = vi.fn();
			live.on( 'change:drop', dropSpy );
			live.on( 'change:range', rangeSpy );

			const sourcePosition = ModelPosition._createBefore( el1 );

			model.applyOperation( new DetachOperation( sourcePosition, 1 ) );

			expect( dropSpy ).toHaveBeenCalledOnce();
			expect( rangeSpy ).not.toHaveBeenCalled();
			expect( dropSpy.mock.calls[ 0 ][ 2 ].deletionPosition.isEqual( sourcePosition ) ).toBe( true );

			// The event range and the live range itself are collapsed at the deletion position.
			expect( dropSpy.mock.calls[ 0 ][ 1 ].isCollapsed ).toBe( true );
			expect( dropSpy.mock.calls[ 0 ][ 1 ].start.isEqual( sourcePosition ) ).toBe( true );
			expect( live.isCollapsed ).toBe( true );
			expect( live.start.isEqual( sourcePosition ) ).toBe( true );

			live.detach();
		} );

		it( 'should fire change:range when the range collapses but stays in the fragment', () => {
			const live = ModelLiveRange._fromRangeInDocumentFragment(
				new ModelRange( new ModelPosition( docFrag, [ 0, 0 ] ), new ModelPosition( docFrag, [ 0, 3 ] ) ),
				model
			);
			const dropSpy = vi.fn();
			const rangeSpy = vi.fn();
			live.on( 'change:drop', dropSpy );
			live.on( 'change:range', rangeSpy );

			// Detach the whole content of the first paragraph. The range shrinks to a collapsed range at [ 0, 0 ]
			// but is not removed from the fragment.
			model.applyOperation( new DetachOperation( new ModelPosition( docFrag, [ 0, 0 ] ), 3 ) );

			expect( dropSpy ).not.toHaveBeenCalled();
			expect( rangeSpy ).toHaveBeenCalledOnce();
			expect( rangeSpy.mock.calls[ 0 ][ 2 ].deletionPosition ).toBeNull();
			expect( live.isCollapsed ).toBe( true );
			expect( live.start.path ).toEqual( [ 0, 0 ] );

			live.detach();
		} );

		it( 'should not get transformed by an operation applied in a different root', () => {
			const live = ModelLiveRange._fromRangeInDocumentFragment(
				new ModelRange( new ModelPosition( docFrag, [ 0 ] ), new ModelPosition( docFrag, [ 2 ] ) ),
				model
			);
			const spy = vi.fn();
			live.on( 'change', spy );

			model.change( writer => {
				writer.insertText( 'foo', new ModelPosition( root, [ 1 ] ) );
			} );

			expect( live.start.path ).toEqual( [ 0 ] );
			expect( live.end.path ).toEqual( [ 2 ] );
			expect( spy ).not.toHaveBeenCalled();

			live.detach();
		} );

		it( 'should stop listening when detached', () => {
			const spy = vi.spyOn( ModelLiveRange.prototype, 'stopListening' );

			const live = ModelLiveRange._fromRangeInDocumentFragment(
				new ModelRange( new ModelPosition( docFrag, [ 0 ] ), new ModelPosition( docFrag, [ 2 ] ) ),
				model
			);
			live.detach();

			expect( spy ).toHaveBeenCalled();

			spy.mockRestore();
		} );
	} );

	describe( 'should get transformed and fire change:range if', () => {
		let live, spy;

		beforeEach( () => {
			live = new ModelLiveRange( new ModelPosition( root, [ 0, 1, 4 ] ), new ModelPosition( root, [ 0, 2, 2 ] ) );

			spy = vi.fn();
			live.on( 'change:range', spy );
		} );

		afterEach( () => {
			live.detach();
		} );

		describe( 'insertion', () => {
			it( 'is in the same parent as range start and before it', () => {
				model.change( writer => {
					writer.insertText( 'xxx', new ModelPosition( root, [ 0, 1, 0 ] ) );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 7 ] );
				expect( live.end.path ).toEqual( [ 0, 2, 2 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is in the same parent as range end and before it', () => {
				model.change( writer => {
					writer.insertText( 'xxx', new ModelPosition( root, [ 0, 2, 0 ] ) );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 4 ] );
				expect( live.end.path ).toEqual( [ 0, 2, 5 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is at a position before a node from range start path', () => {
				model.change( writer => {
					writer.insert( new ModelElement( 'li' ), new ModelPosition( root, [ 0, 0 ] ) );
				} );

				expect( live.start.path ).toEqual( [ 0, 2, 4 ] );
				expect( live.end.path ).toEqual( [ 0, 3, 2 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is at a position before a node from range end path', () => {
				model.change( writer => {
					writer.insert( new ModelElement( 'li' ), new ModelPosition( root, [ 0, 2 ] ) );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 4 ] );
				expect( live.end.path ).toEqual( [ 0, 3, 2 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is at the live range start position and live range is collapsed', () => {
				live.end.path = [ 0, 1, 4 ];

				model.change( writer => {
					writer.insertText( 'xxx', new ModelPosition( root, [ 0, 1, 4 ] ) );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 7 ] );
				expect( live.end.path ).toEqual( [ 0, 1, 7 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'range move', () => {
			it( 'is to the same parent as range start and before it', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 4, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 4 );
					const targetPosition = new ModelPosition( root, [ 0, 1, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 8 ] );
				expect( live.end.path ).toEqual( [ 0, 2, 2 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is to the same parent as range end and before it', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 4, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 4 );
					const targetPosition = new ModelPosition( root, [ 0, 2, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 4 ] );
				expect( live.end.path ).toEqual( [ 0, 2, 6 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is to a position before a node from range start path', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 4 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 2 );
					const targetPosition = new ModelPosition( root, [ 0, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 3, 4 ] );
				expect( live.end.path ).toEqual( [ 0, 4, 2 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is to a position before a node from range end path', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 4 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( root, [ 0, 2 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 4 ] );
				expect( live.end.path ).toEqual( [ 0, 3, 2 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is from the same parent as range start and before it', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 1, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 3 );
					const targetPosition = new ModelPosition( root, [ 0, 4, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 1 ] );
				expect( live.end.path ).toEqual( [ 0, 2, 2 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is from the same parent as range end and before it - #1', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 2, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( root, [ 0, 4, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 4 ] );
				expect( live.end.path ).toEqual( [ 0, 2, 1 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is from the same parent as range end and before it - #2', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 2, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 2 );
					const targetPosition = new ModelPosition( root, [ 0, 4, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 4 ] );
				expect( live.end.path ).toEqual( [ 0, 2, 0 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is from a position before a node from range start path', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( root, [ 0, 4 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 0, 4 ] );
				expect( live.end.path ).toEqual( [ 0, 1, 2 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'intersects on live range left side', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 1, 2 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 4 );
					const targetPosition = new ModelPosition( root, [ 0, 4, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 2 ] );
				expect( live.end.path ).toEqual( [ 0, 2, 2 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'intersects on live range right side', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 2, 1 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 4 );
					const targetPosition = new ModelPosition( root, [ 0, 4, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 4 ] );
				expect( live.end.path ).toEqual( [ 0, 2, 1 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is equal to live range', () => {
				live.end.path = [ 0, 1, 7 ];

				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 1, 4 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 3 );
					const targetPosition = new ModelPosition( root, [ 0, 4, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 4, 0 ] );
				expect( live.end.path ).toEqual( [ 0, 4, 3 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'contains live range', () => {
				live.end.path = [ 0, 1, 6 ];

				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 1, 3 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 5 );
					const targetPosition = new ModelPosition( root, [ 0, 4, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 4, 1 ] );
				expect( live.end.path ).toEqual( [ 0, 4, 3 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is intersecting with live range on left and points to live range', () => {
				live.end.path = [ 0, 1, 7 ];

				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 1, 2 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 3 );
					const targetPosition = new ModelPosition( root, [ 0, 1, 8 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 2 ] );
				expect( live.end.path ).toEqual( [ 0, 1, 4 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is intersecting with live range on right and is moved into live range', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 2, 1 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 5 );
					const targetPosition = new ModelPosition( root, [ 0, 2, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 4 ] );
				expect( live.end.path ).toEqual( [ 0, 2, 1 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'wrap', () => {
			// NOTE: it overrides the variable defined globally in these tests.
			// These tests need to be rewritten to use the batch API anyway and then this variable can be removed.
			let live;

			beforeEach( () => {
				model.schema.register( 'p', { inheritAllFrom: '$block' } );
				model.schema.register( 'w' );

				model.schema.extend( 'p', { allowIn: 'w' } );
				model.schema.extend( 'w', { allowIn: '$root' } );
			} );

			afterEach( () => {
				live.detach();
			} );

			it( 'is inside the wrapped range', () => {
				_setModelData( model, '<p>x</p><p>[a]</p><p>x</p>' );

				live = new ModelLiveRange( doc.selection.getFirstPosition(), doc.selection.getLastPosition() );

				model.change( writer => {
					// [<p>a</p>]
					writer.wrap( new ModelRange( new ModelPosition( root, [ 1 ] ), new ModelPosition( root, [ 2 ] ) ), 'w' );
				} );

				expect( _stringifyModel( root, live ) ).toBe( '<p>x</p><w><p>[a]</p></w><p>x</p>' );
			} );

			it( 'its start is intersecting with the wrapped range', () => {
				_setModelData( model, '<p>a[b</p><p>x</p><p>c]d</p>' );

				live = new ModelLiveRange( doc.selection.getFirstPosition(), doc.selection.getLastPosition() );

				model.change( writer => {
					// [<p>ab</p>]
					writer.wrap( new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1 ] ) ), 'w' );
				} );

				// Should be '<w><p>a[b</p></w><p>x</p><p>c]d</p>' but the range is trimmed.
				expect( _stringifyModel( root, live ) ).toBe( '<w><p>ab</p></w>[<p>x</p><p>c]d</p>' );
			} );

			it( 'its end is intersecting with the wrapped range', () => {
				_setModelData( model, '<p>a[b</p><p>x</p><p>c]d</p>' );

				live = new ModelLiveRange( doc.selection.getFirstPosition(), doc.selection.getLastPosition() );

				model.change( writer => {
					// [<p>cd</p>]
					writer.wrap( new ModelRange( new ModelPosition( root, [ 2 ] ), new ModelPosition( root, [ 3 ] ) ), 'w' );
				} );

				expect( _stringifyModel( root, live ) ).toBe( '<p>a[b</p><p>x</p><w><p>c]d</p></w>' );
			} );

			it( 'its start is intersecting with the wrapped range (multilpe elements)', () => {
				_setModelData( model, '<p>a[b</p><p>x</p><p>c]d</p>' );

				live = new ModelLiveRange( doc.selection.getFirstPosition(), doc.selection.getLastPosition() );

				model.change( writer => {
					// [<p>ab</p><p>x</p>]
					writer.wrap( new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 2 ] ) ), 'w' );
				} );

				// Should be '<w><p>a[b</p><p>x</p></w><p>c]d</p>' but the range is trimmed.
				expect( _stringifyModel( root, live ) ).toBe( '<w><p>ab</p><p>x</p></w>[<p>c]d</p>' );
			} );

			it( 'its end is intersecting with the wrapped range (multiple elements)', () => {
				_setModelData( model, '<p>a[b</p><p>x</p><p>c]d</p>' );

				live = new ModelLiveRange( doc.selection.getFirstPosition(), doc.selection.getLastPosition() );

				model.change( writer => {
					// [<p>x</p><p>cd</p>]
					writer.wrap( new ModelRange( new ModelPosition( root, [ 1 ] ), new ModelPosition( root, [ 3 ] ) ), 'w' );
				} );

				expect( _stringifyModel( root, live ) ).toBe( '<p>a[b</p><w><p>x</p><p>c]d</p></w>' );
			} );

			it( 'contains element to wrap', () => {
				_setModelData( model, '<p>a[b</p><p>x</p><p>c]d</p>' );

				live = new ModelLiveRange( doc.selection.getFirstPosition(), doc.selection.getLastPosition() );

				model.change( writer => {
					// [<p>x</p>]
					writer.wrap( new ModelRange( new ModelPosition( root, [ 1 ] ), new ModelPosition( root, [ 2 ] ) ), 'w' );
				} );

				expect( _stringifyModel( root, live ) ).toBe( '<p>a[b</p><w><p>x</p></w><p>c]d</p>' );
			} );
		} );

		describe( 'unwrap', () => {
			// NOTE: it overrides the variable defined globally in these tests.
			// These tests need to be rewritten to use the batch API anyway and then this variable can be removed.
			let live;

			beforeEach( () => {
				model.schema.register( 'p', { inheritAllFrom: '$block' } );
				model.schema.register( 'w' );

				model.schema.extend( 'p', { allowIn: 'w' } );
				model.schema.extend( 'w', { allowIn: '$root' } );
			} );

			afterEach( () => {
				live.detach();
			} );

			it( 'is inside the wrapper to remove', () => {
				_setModelData( model, '<p>x</p><w><p>[a]</p></w><p>x</p>' );

				live = new ModelLiveRange( doc.selection.getFirstPosition(), doc.selection.getLastPosition() );

				model.change( writer => {
					writer.unwrap( root.getChild( 1 ) );
				} );

				expect( _stringifyModel( root, live ) ).toBe( '<p>x</p><p>[a]</p><p>x</p>' );
			} );

			it( 'its start is intersecting with the wrapper to remove', () => {
				_setModelData( model, '<w><p>a[b</p></w><p>c]d</p>' );

				live = new ModelLiveRange( doc.selection.getFirstPosition(), doc.selection.getLastPosition() );

				model.change( writer => {
					writer.unwrap( root.getChild( 0 ) );
				} );

				expect( _stringifyModel( root, live ) ).toBe( '<p>a[b</p><p>c]d</p>' );
			} );

			it( 'its end is intersecting with the wrapper to remove', () => {
				_setModelData( model, '<p>a[b</p><w><p>c]d</p></w>' );

				live = new ModelLiveRange( doc.selection.getFirstPosition(), doc.selection.getLastPosition() );

				model.change( writer => {
					writer.unwrap( root.getChild( 1 ) );
				} );

				// Should be '<p>a[b</p><p>c]d</p>' but the range is trimmed.
				expect( _stringifyModel( root, live ) ).toBe( '<p>a[b</p>]<p>cd</p>' );
			} );

			it( 'its start is intersecting with the wrapper to remove (multiple elements)', () => {
				_setModelData( model, '<w><p>a[b</p><p>x</p></w><p>c]d</p>' );

				live = new ModelLiveRange( doc.selection.getFirstPosition(), doc.selection.getLastPosition() );

				model.change( writer => {
					writer.unwrap( root.getChild( 0 ) );
				} );

				expect( _stringifyModel( root, live ) ).toBe( '<p>a[b</p><p>x</p><p>c]d</p>' );
			} );

			it( 'its end is intersecting with the wrapper to remove (multiple elements)', () => {
				_setModelData( model, '<p>a[b</p><w><p>x</p><p>c]d</p></w>' );

				live = new ModelLiveRange( doc.selection.getFirstPosition(), doc.selection.getLastPosition() );

				model.change( writer => {
					writer.unwrap( root.getChild( 1 ) );
				} );

				// Should be '<p>a[b</p><p>x</p><p>c]d</p>' but the range is trimmed.
				expect( _stringifyModel( root, live ) ).toBe( '<p>a[b</p>]<p>x</p><p>cd</p>' );
			} );

			it( 'contains wrapped element', () => {
				_setModelData( model, '<p>a[b</p><w><p>x</p></w><p>c]d</p>' );

				live = new ModelLiveRange( doc.selection.getFirstPosition(), doc.selection.getLastPosition() );

				model.change( writer => {
					writer.unwrap( root.getChild( 1 ) );
				} );

				expect( _stringifyModel( root, live ) ).toBe( '<p>a[b</p><p>x</p><p>c]d</p>' );
			} );
		} );
	} );

	describe( 'should not get transformed but fire change:content', () => {
		let spy, live, clone;

		beforeEach( () => {
			live = new ModelLiveRange( new ModelPosition( root, [ 0, 1, 4 ] ), new ModelPosition( root, [ 0, 2, 2 ] ) );
			clone = live.toRange();

			spy = vi.fn();
			live.on( 'change:content', spy );
		} );

		afterEach( () => {
			live.detach();
		} );

		describe( 'insertion', () => {
			it( 'inside the range', () => {
				model.change( writer => {
					writer.insertText( 'xxx', new ModelPosition( root, [ 0, 1, 7 ] ) );
				} );

				expect( live.isEqual( clone ) ).toBe( true );
				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'range move', () => {
			it( 'inside the range', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 4, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 3 );
					const targetPosition = new ModelPosition( root, [ 0, 1, 5 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.isEqual( clone ) ).toBe( true );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'from the range', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 1, 5 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 2 );
					const targetPosition = new ModelPosition( root, [ 0, 4, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.isEqual( clone ) ).toBe( true );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'from the beginning of range', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 1, 4 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 2 );
					const targetPosition = new ModelPosition( root, [ 0, 4, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.isEqual( clone ) ).toBe( true );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'from the range to the range', () => {
				live.end.path = [ 0, 1, 8 ];

				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 1, 5 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( root, [ 0, 1, 7 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.start.path ).toEqual( [ 0, 1, 4 ] );
				expect( live.end.path ).toEqual( [ 0, 1, 8 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'should not get transformed and not fire change event if', () => {
		let otherRoot, spy, live, clone;

		beforeEach( () => {
			otherRoot = doc.createRoot( '$root', 'otherRoot' );
			live = new ModelLiveRange( new ModelPosition( root, [ 0, 1, 4 ] ), new ModelPosition( root, [ 0, 2, 2 ] ) );
			clone = live.toRange();

			spy = vi.fn();
			live.on( 'change', spy );
		} );

		afterEach( () => {
			live.detach();
		} );

		describe( 'insertion', () => {
			it( 'is in the same parent as range end and after it', () => {
				model.change( writer => {
					writer.insertText( 'foo', new ModelPosition( root, [ 0, 2, 7 ] ) );
				} );

				expect( live.isEqual( clone ) ).toBe( true );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'is to a position after a node from range end path', () => {
				model.change( writer => {
					writer.insert( new ModelElement( 'li' ), new ModelPosition( root, [ 3 ] ) );
				} );

				expect( live.isEqual( clone ) ).toBe( true );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'is in different root', () => {
				model.change( writer => {
					writer.insert( new ModelElement( 'li' ), new ModelPosition( otherRoot, [ 0 ] ) );
				} );

				expect( live.isEqual( clone ) ).toBe( true );
				expect( spy ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'range move', () => {
			it( 'is to the same parent as range end and after it', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 4, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 3 );
					const targetPosition = new ModelPosition( root, [ 0, 2, 4 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.isEqual( clone ) ).toBe( true );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'is to a position after a node from range end path', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 5 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( root, [ 0, 4 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.isEqual( clone ) ).toBe( true );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'is from the same parent as range end and after it', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 2, 4 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 3 );
					const targetPosition = new ModelPosition( root, [ 0, 4, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.isEqual( clone ) ).toBe( true );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'is from a position after a node from range end path', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 4 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( root, [ 0, 5 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.isEqual( clone ) ).toBe( true );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'is to different root', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 0, 4 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( otherRoot, [ 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.isEqual( clone ) ).toBe( true );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'is from different root', () => {
				model.change( writer => {
					writer.insertText( 'foo', new ModelPosition( otherRoot, [ 0 ] ) );

					const sourcePosition = new ModelPosition( otherRoot, [ 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( root, [ 0, 4 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.isEqual( clone ) ).toBe( true );
				expect( spy ).not.toHaveBeenCalled();
			} );
		} );
	} );
} );
