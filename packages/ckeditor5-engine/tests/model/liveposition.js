/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Model } from '../../src/model/model.js';
import { ModelDocumentFragment } from '../../src/model/documentfragment.js';
import { ModelElement } from '../../src/model/element.js';
import { Text } from '../../src/model/text.js';
import { ModelPosition } from '../../src/model/position.js';
import { ModelLivePosition } from '../../src/model/liveposition.js';
import { ModelRange } from '../../src/model/range.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'LivePosition', () =>
{
	let model, doc, root, ul, p, li1, li2;

	beforeEach( () => {
		model = new Model();

		doc = model.document;
		root = doc.createRoot();

		li1 = new ModelElement( 'li', [], new Text( 'abcdef' ) );
		li2 = new ModelElement( 'li', [], new Text( 'foobar' ) );
		ul = new ModelElement( 'ul', [], [ li1, li2 ] );
		p = new ModelElement( 'p', [], new Text( 'qwerty' ) );

		root._insertChild( 0, [ p, ul ] );
	} );

	afterEach( () => {
		doc.destroy();
	} );

	it( 'should be an instance of Position', () => {
		const live = new ModelLivePosition( root, [ 0 ] );
		live.detach();

		expect( live ).to.be.instanceof( ModelPosition );
	} );

	describe( 'is()', () => {
		let live;

		beforeEach( () => {
			live = new ModelLivePosition( root, [ 0 ] );
			live.detach();
		} );

		it( 'should return true for "livePosition" and "position"', () => {
			expect( live.is( 'livePosition' ) ).to.be.true;
			expect( live.is( 'model:livePosition' ) ).to.be.true;
			expect( live.is( 'position' ) ).to.be.true;
			expect( live.is( 'model:position' ) ).to.be.true;
		} );

		it( 'should return false for incorrect values', () => {
			expect( live.is( 'model' ) ).to.be.false;
			expect( live.is( 'model:node' ) ).to.be.false;
			expect( live.is( '$text' ) ).to.be.false;
			expect( live.is( 'element', 'paragraph' ) ).to.be.false;
		} );
	} );

	it( 'should throw if given root is not a ModelRootElement', () => {
		const docFrag = new ModelDocumentFragment();

		expectToThrowCKEditorError( () => {
			new ModelLivePosition( docFrag, [ 1 ] ); // eslint-disable-line no-new
		}, /model-liveposition-root-not-rootelement/, docFrag );
	} );

	it( 'should listen to the model applyOperation event', () => {
		sinon.spy( ModelLivePosition.prototype, 'listenTo' );

		const live = new ModelLivePosition( root, [ 0 ] );
		live.detach();

		expect( live.listenTo.calledWith( model, 'applyOperation' ) ).to.be.true;

		ModelLivePosition.prototype.listenTo.restore();
	} );

	it( 'should stop listening when detached', () => {
		sinon.spy( ModelLivePosition.prototype, 'stopListening' );

		const live = new ModelLivePosition( root, [ 0 ] );
		live.detach();

		expect( live.stopListening.called ).to.be.true;

		ModelLivePosition.prototype.stopListening.restore();
	} );

	describe( 'fromPosition()', () => {
		it( 'should return LivePosition', () => {
			const position = ModelLivePosition.fromPosition( new ModelPosition( root, [ 0 ] ) );
			expect( position ).to.be.instanceof( ModelLivePosition );
			position.detach();
		} );
	} );

	it( '_createBefore should return LivePosition', () => {
		const position = ModelLivePosition._createBefore( ul, 'toPrevious' );
		expect( position ).to.be.instanceof( ModelLivePosition );
		expect( position.stickiness ).to.equal( 'toPrevious' );
		position.detach();
	} );

	it( '_createAfter should return LivePosition', () => {
		const position = ModelLivePosition._createAfter( ul, 'toPrevious' );
		expect( position ).to.be.instanceof( ModelLivePosition );
		expect( position.stickiness ).to.equal( 'toPrevious' );
		position.detach();
	} );

	it( '_createAt should return LivePosition', () => {
		const position = ModelLivePosition._createAt( ul, 'end', 'toPrevious' );
		expect( position ).to.be.instanceof( ModelLivePosition );
		expect( position.stickiness ).to.equal( 'toPrevious' );
		position.detach();
	} );

	describe( 'should get transformed if', () => {
		let live, spy;

		beforeEach( () => {
			live = new ModelLivePosition( root, [ 1, 1, 3 ] );

			spy = sinon.spy();
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

				expect( live.path ).to.deep.equal( [ 1, 1, 6 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is at the same position and live position is sticking to the next node', () => {
				live.stickiness = 'toNext';
				model.change( writer => {
					writer.insertText( 'foo', new ModelPosition( root, [ 1, 1, 3 ] ) );
				} );

				expect( live.path ).to.deep.equal( [ 1, 1, 6 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is before a node from the live position path', () => {
				model.change( writer => {
					writer.insert( new ModelElement( 'paragraph' ), new ModelPosition( root, [ 1, 0 ] ) );
				} );

				expect( live.path ).to.deep.equal( [ 1, 2, 3 ] );
				expect( spy.calledOnce ).to.be.true;
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

				expect( live.path ).to.deep.equal( [ 1, 1, 6 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is at the same position and live position is sticking to right side', () => {
				live.stickiness = 'toNext';
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 0, 1 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 3 );
					const targetPosition = new ModelPosition( root, [ 1, 1, 3 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).to.deep.equal( [ 1, 1, 6 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is at a position before a node from the live position path', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 0, 1 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 2 );
					const targetPosition = new ModelPosition( root, [ 1, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).to.deep.equal( [ 1, 3, 3 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is from the same parent and closer offset', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 1, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 2 );
					const targetPosition = new ModelPosition( root, [ 1, 0, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).to.deep.equal( [ 1, 1, 1 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is from a position before a node from the live position path', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( root, [ 1, 2 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).to.deep.equal( [ 1, 0, 3 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'contains live position (same level)', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 1, 2 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 2 );
					const targetPosition = new ModelPosition( root, [ 1, 0, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).to.deep.equal( [ 1, 0, 1 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'contains live position (deep)', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 1 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( root, [ 1, 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).to.deep.equal( [ 1, 0, 3 ] );
				expect( spy.calledOnce ).to.be.true;
			} );
		} );
	} );

	describe( 'should not get transformed if', () => {
		let path, otherRoot, spy, live;

		beforeEach( () => {
			path = [ 1, 1, 3 ];
			otherRoot = doc.createRoot( '$root', 'otherRoot' );
			live = new ModelLivePosition( root, path );

			spy = sinon.spy();
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

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );

			it( 'is at the same position and live position is sticking to left side', () => {
				const newLive = new ModelLivePosition( root, path, 'toPrevious' );
				spy = sinon.spy();
				newLive.on( 'change', spy );

				model.change( writer => {
					writer.insertText( 'foo', new ModelPosition( root, [ 1, 1, 3 ] ) );
				} );

				expect( newLive.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;

				newLive.detach();
			} );

			it( 'is after a node from the position path', () => {
				model.change( writer => {
					writer.insertElement( 'paragraph', new ModelPosition( root, [ 2 ] ) );
				} );

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );

			it( 'is in different root', () => {
				model.change( writer => {
					writer.insertText( 'foo', new ModelPosition( otherRoot, [ 0 ] ) );
				} );

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
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

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );

			it( 'is at the same position and live position is sticking to left side', () => {
				const newLive = new ModelLivePosition( root, path, 'toPrevious' );
				spy = sinon.spy();
				newLive.on( 'change', spy );

				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 0, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 3 );
					const targetPosition = new ModelPosition( root, [ 1, 1, 3 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( newLive.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;

				newLive.detach();
			} );

			it( 'is at a position after a node from the live position path', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 0, 0 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 3 );
					const targetPosition = new ModelPosition( root, [ 2 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );

			it( 'is from the same parent and further offset', () => {
				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 1, 4 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 2 );
					const targetPosition = new ModelPosition( otherRoot, [ 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );

			it( 'is from a position after a node from the live position path', () => {
				const newLive = new ModelLivePosition( root, [ 1, 0, 3 ] );
				spy = sinon.spy();
				newLive.on( 'change', spy );

				model.change( writer => {
					const sourcePosition = new ModelPosition( root, [ 1, 1 ] );
					const sourceRange = ModelRange._createFromPositionAndShift( sourcePosition, 1 );
					const targetPosition = new ModelPosition( otherRoot, [ 0 ] );

					writer.move( sourceRange, targetPosition );
				} );

				expect( newLive.path ).to.deep.equal( [ 1, 0, 3 ] );
				expect( spy.called ).to.be.false;

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

				expect( live.path ).to.deep.equal( path );
				expect( spy.called ).to.be.false;
			} );
		} );

		it( 'attributes changed', () => {
			model.change( writer => {
				writer.setAttribute( 'foo', 'bar',
					new ModelRange( new ModelPosition( root, [ 1, 1, 0 ] ), new ModelPosition( root, [ 1, 1, 6 ] ) ) );
			} );

			expect( live.path ).to.deep.equal( path );
			expect( spy.called ).to.be.false;
		} );
	} );
} );
