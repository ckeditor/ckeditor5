/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Model } from '../../src/model/model.js';
import { ModelDocumentFragment } from '../../src/model/documentfragment.js';
import { ModelElement } from '../../src/model/element.js';
import { ModelText } from '../../src/model/text.js';
import { ModelPosition } from '../../src/model/position.js';
import { ModelLivePosition } from '../../src/model/liveposition.js';
import { ModelRange } from '../../src/model/range.js';
import { DetachOperation } from '../../src/model/operation/detachoperation.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'LivePosition', () =>
{
	let model, doc, root, ul, p, li1, li2;

	beforeEach( () => {
		model = new Model();

		doc = model.document;
		root = doc.createRoot();

		li1 = new ModelElement( 'li', [], new ModelText( 'abcdef' ) );
		li2 = new ModelElement( 'li', [], new ModelText( 'foobar' ) );
		ul = new ModelElement( 'ul', [], [ li1, li2 ] );
		p = new ModelElement( 'p', [], new ModelText( 'qwerty' ) );

		root._insertChild( 0, [ p, ul ] );
	} );

	afterEach( () => {
		doc.destroy();
	} );

	it( 'should be an instance of Position', () => {
		const live = new ModelLivePosition( root, [ 0 ] );
		live.detach();

		expect( live ).toBeInstanceOf( ModelPosition );
	} );

	describe( 'is()', () => {
		let live;

		beforeEach( () => {
			live = new ModelLivePosition( root, [ 0 ] );
			live.detach();
		} );

		it( 'should return true for "livePosition" and "position"', () => {
			expect( live.is( 'livePosition' ) ).toBe( true );
			expect( live.is( 'model:livePosition' ) ).toBe( true );
			expect( live.is( 'position' ) ).toBe( true );
			expect( live.is( 'model:position' ) ).toBe( true );
		} );

		it( 'should return false for incorrect values', () => {
			expect( live.is( 'model' ) ).toBe( false );
			expect( live.is( 'model:node' ) ).toBe( false );
			expect( live.is( '$text' ) ).toBe( false );
			expect( live.is( 'element', 'paragraph' ) ).toBe( false );
		} );
	} );

	it( 'should throw if given root is not a ModelRootElement and no model is provided', () => {
		const docFrag = new ModelDocumentFragment();

		expectToThrowCKEditorError( () => {
			new ModelLivePosition( docFrag, [ 1 ] ); // eslint-disable-line no-new
		}, /model-liveposition-no-model-reference/, docFrag );
	} );

	it( 'should not throw if given root is not a ModelRootElement but a model is provided', () => {
		const docFrag = new ModelDocumentFragment();

		expect( () => {
			const live = new ModelLivePosition( docFrag, [ 0 ], 'toNone', model );
			live.detach();
		} ).not.toThrow();
	} );

	it( 'should listen to the model applyOperation event', () => {
		const listenToSpy = vi.spyOn( ModelLivePosition.prototype, 'listenTo' );

		const live = new ModelLivePosition( root, [ 0 ] );
		live.detach();

		expect( listenToSpy ).toHaveBeenCalledWith( model, 'applyOperation', expect.any( Function ), expect.any( Object ) );

		vi.restoreAllMocks();
	} );

	it( 'should stop listening when detached', () => {
		const stopListeningSpy = vi.spyOn( ModelLivePosition.prototype, 'stopListening' );

		const live = new ModelLivePosition( root, [ 0 ] );
		live.detach();

		expect( stopListeningSpy ).toHaveBeenCalled();

		vi.restoreAllMocks();
	} );

	describe( 'fromPosition()', () => {
		it( 'should return LivePosition', () => {
			const position = ModelLivePosition.fromPosition( new ModelPosition( root, [ 0 ] ) );
			expect( position ).toBeInstanceOf( ModelLivePosition );
			position.detach();
		} );
	} );

	describe( '_fromPositionInDocumentFragment()', () => {
		let docFrag, el1, el2;

		beforeEach( () => {
			el1 = new ModelElement( 'paragraph', [], new ModelText( 'abc' ) );
			el2 = new ModelElement( 'paragraph', [], new ModelText( 'xyz' ) );
			docFrag = new ModelDocumentFragment( [ el1, el2 ] );
		} );

		it( 'should return a LivePosition', () => {
			const live = ModelLivePosition._fromPositionInDocumentFragment( new ModelPosition( docFrag, [ 1 ] ), model );

			expect( live ).toBeInstanceOf( ModelLivePosition );
			expect( live.root ).toBe( docFrag );
			expect( live.path ).toEqual( [ 1 ] );

			live.detach();
		} );

		it( 'should take the stickiness from the given position by default', () => {
			const position = new ModelPosition( docFrag, [ 1 ], 'toPrevious' );
			const live = ModelLivePosition._fromPositionInDocumentFragment( position, model );

			expect( live.stickiness ).toBe( 'toPrevious' );

			live.detach();
		} );

		it( 'should allow overriding the stickiness', () => {
			const live = ModelLivePosition._fromPositionInDocumentFragment(
				new ModelPosition( docFrag, [ 1 ], 'toPrevious' ), model, 'toNext'
			);

			expect( live.stickiness ).toBe( 'toNext' );

			live.detach();
		} );

		it( 'should listen to the provided model applyOperation event', () => {
			const spy = vi.spyOn( ModelLivePosition.prototype, 'listenTo' );

			const live = ModelLivePosition._fromPositionInDocumentFragment( new ModelPosition( docFrag, [ 1 ] ), model );

			expect( spy ).toHaveBeenCalledWith( model, 'applyOperation', expect.any( Function ), expect.any( Object ) );

			live.detach();
			vi.restoreAllMocks();
		} );

		it( 'should get transformed when content is detached from before the position', () => {
			const live = ModelLivePosition._fromPositionInDocumentFragment( new ModelPosition( docFrag, [ 1 ] ), model );
			const spy = vi.fn();
			live.on( 'change', spy );

			model.applyOperation( new DetachOperation( ModelPosition._createBefore( el1 ), 1 ) );

			expect( live.path ).toEqual( [ 0 ] );
			expect( spy ).toHaveBeenCalledOnce();

			live.detach();
		} );

		it( 'should get transformed even though the operation is not a document operation', () => {
			const live = ModelLivePosition._fromPositionInDocumentFragment( new ModelPosition( docFrag, [ 1, 1 ] ), model );

			const op = new DetachOperation( new ModelPosition( docFrag, [ 1, 0 ] ), 1 );

			expect( op.isDocumentOperation ).toBe( false );

			model.applyOperation( op );

			expect( live.path ).toEqual( [ 1, 0 ] );

			live.detach();
		} );

		it( 'should not get transformed by an operation applied in a different root', () => {
			const live = ModelLivePosition._fromPositionInDocumentFragment( new ModelPosition( docFrag, [ 1 ] ), model );
			const spy = vi.fn();
			live.on( 'change', spy );

			model.change( writer => {
				writer.insertText( 'foo', new ModelPosition( root, [ 0 ] ) );
			} );

			expect( live.path ).toEqual( [ 1 ] );
			expect( spy ).not.toHaveBeenCalled();

			live.detach();
		} );

		it( 'should stop listening when detached', () => {
			const stopListeningSpy = vi.spyOn( ModelLivePosition.prototype, 'stopListening' );

			const live = ModelLivePosition._fromPositionInDocumentFragment( new ModelPosition( docFrag, [ 1 ] ), model );
			live.detach();

			expect( stopListeningSpy ).toHaveBeenCalled();

			vi.restoreAllMocks();
		} );
	} );

	it( '_createBefore should return LivePosition', () => {
		const position = ModelLivePosition._createBefore( ul, 'toPrevious' );
		expect( position ).toBeInstanceOf( ModelLivePosition );
		expect( position.stickiness ).toBe( 'toPrevious' );
		position.detach();
	} );

	it( '_createAfter should return LivePosition', () => {
		const position = ModelLivePosition._createAfter( ul, 'toPrevious' );
		expect( position ).toBeInstanceOf( ModelLivePosition );
		expect( position.stickiness ).toBe( 'toPrevious' );
		position.detach();
	} );

	it( '_createAt should return LivePosition', () => {
		const position = ModelLivePosition._createAt( ul, 'end', 'toPrevious' );
		expect( position ).toBeInstanceOf( ModelLivePosition );
		expect( position.stickiness ).toBe( 'toPrevious' );
		position.detach();
	} );

	describe( 'should get transformed if', () => {
		let live, spy;

		beforeEach( () => {
			live = new ModelLivePosition( root, [ 1, 1, 3 ] );

			spy = vi.fn();
			live.on( 'change', spy );
		} );

		afterEach( () => {
			live.detach();
		} );

		describe( 'insertion', () => {
			it( 'is in the same parent and closer offset', () => {
				model.change( writer => {
					writer.insertText( 'foo', new ModelPosition( root, [ 1, 1, 0 ] ) );
				} );

				expect( live.path ).toEqual( [ 1, 1, 6 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is at the same position and live position is sticking to the next node', () => {
				live.stickiness = 'toNext';
				model.change( writer => {
					writer.insertText( 'foo', new ModelPosition( root, [ 1, 1, 3 ] ) );
				} );

				expect( live.path ).toEqual( [ 1, 1, 6 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is before a node from the live position path', () => {
				model.change( writer => {
					writer.insert( new ModelElement( 'paragraph' ), new ModelPosition( root, [ 1, 0 ] ) );
				} );

				expect( live.path ).toEqual( [ 1, 2, 3 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'range move', () => {
			it( 'is at the same parent and closer offset', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 0, 1 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 3 );
					const targetPosition = new ModelPosition( root, [ 1, 1, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).toEqual( [ 1, 1, 6 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is at the same position and live position is sticking to right side', () => {
				live.stickiness = 'toNext';
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 0, 1 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 3 );
					const targetPosition = new ModelPosition( root, [ 1, 1, 3 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).toEqual( [ 1, 1, 6 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is at a position before a node from the live position path', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 0, 1 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 2 );
					const targetPosition = new ModelPosition( root, [ 1, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).toEqual( [ 1, 3, 3 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is from the same parent and closer offset', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 1, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 2 );
					const targetPosition = new ModelPosition( root, [ 1, 0, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).toEqual( [ 1, 1, 1 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'is from a position before a node from the live position path', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( root, [ 1, 2 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).toEqual( [ 1, 0, 3 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'contains live position (same level)', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 1, 2 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 2 );
					const targetPosition = new ModelPosition( root, [ 1, 0, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).toEqual( [ 1, 0, 1 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'contains live position (deep)', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 1 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( root, [ 1, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).toEqual( [ 1, 0, 3 ] );
				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'should not get transformed if', () => {
		let path, otherRoot, spy, live;

		beforeEach( () => {
			path = [ 1, 1, 3 ];
			otherRoot = doc.createRoot( '$root', 'otherRoot' );
			live = new ModelLivePosition( root, path );

			spy = vi.fn();
			live.on( 'change', spy );
		} );

		afterEach( () => {
			live.detach();
		} );

		describe( 'insertion', () => {
			it( 'is in the same parent and further offset', () => {
				model.change( writer => {
					writer.insertText( 'foo', new ModelPosition( root, [ 1, 1, 6 ] ) );
				} );

				expect( live.path ).toEqual( path );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'is at the same position and live position is sticking to left side', () => {
				const newLive = new ModelLivePosition( root, path, 'toPrevious' );
				spy = vi.fn();
				newLive.on( 'change', spy );

				model.change( writer => {
					writer.insertText( 'foo', new ModelPosition( root, [ 1, 1, 3 ] ) );
				} );

				expect( newLive.path ).toEqual( path );
				expect( spy ).not.toHaveBeenCalled();

				newLive.detach();
			} );

			it( 'is after a node from the position path', () => {
				model.change( writer => {
					writer.insertElement( 'paragraph', new ModelPosition( root, [ 2 ] ) );
				} );

				expect( live.path ).toEqual( path );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'is in different root', () => {
				model.change( writer => {
					writer.insertText( 'foo', new ModelPosition( otherRoot, [ 0 ] ) );
				} );

				expect( live.path ).toEqual( path );
				expect( spy ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'range move', () => {
			it( 'is at the same parent and further offset', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 0, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 3 );
					const targetPosition = new ModelPosition( root, [ 1, 1, 6 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).toEqual( path );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'is at the same position and live position is sticking to left side', () => {
				const newLive = new ModelLivePosition( root, path, 'toPrevious' );
				spy = vi.fn();
				newLive.on( 'change', spy );

				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 0, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 3 );
					const targetPosition = new ModelPosition( root, [ 1, 1, 3 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( newLive.path ).toEqual( path );
				expect( spy ).not.toHaveBeenCalled();

				newLive.detach();
			} );

			it( 'is at a position after a node from the live position path', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 0, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 3 );
					const targetPosition = new ModelPosition( root, [ 2 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).toEqual( path );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'is from the same parent and further offset', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 1, 4 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 2 );
					const targetPosition = new ModelPosition( otherRoot, [ 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).toEqual( path );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'is from a position after a node from the live position path', () => {
				const newLive = new ModelLivePosition( root, [ 1, 0, 3 ] );
				spy = vi.fn();
				newLive.on( 'change', spy );

				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 1 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( otherRoot, [ 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( newLive.path ).toEqual( [ 1, 0, 3 ] );
				expect( spy ).not.toHaveBeenCalled();

				newLive.detach();
			} );

			it( 'is from different root', () => {
				model.change( writer => {
					writer.insertText( 'foo', new ModelPosition( otherRoot, [ 0 ] ) );

					const sourcePosition = new ModelPosition( otherRoot, [ 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( otherRoot, [ 3 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).toEqual( path );
				expect( spy ).not.toHaveBeenCalled();
			} );
		} );

		it( 'attributes changed', () => {
			model.change( writer => {
				writer.setAttribute( 'foo', 'bar',
					new ModelRange( new ModelPosition( root, [ 1, 1, 0 ] ), new ModelPosition( root, [ 1, 1, 6 ] ) ) );
			} );

			expect( live.path ).toEqual( path );
			expect( spy ).not.toHaveBeenCalled();
		} );
	} );
} );
