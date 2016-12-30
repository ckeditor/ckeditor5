/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from 'ckeditor5-engine/src/model/document';
import Element from 'ckeditor5-engine/src/model/element';
import Position from 'ckeditor5-engine/src/model/position';
import LiveRange from 'ckeditor5-engine/src/model/liverange';
import Range from 'ckeditor5-engine/src/model/range';
import Text from 'ckeditor5-engine/src/model/text';

describe( 'LiveRange', () => {
	let doc, root, ul, p;

	before( () => {
		doc = new Document();
		root = doc.createRoot();

		let lis = [
			new Element( 'li', [], new Text( 'aaaaaaaaaa' ) ),
			new Element( 'li', [], new Text( 'bbbbbbbbbb' ) ),
			new Element( 'li', [], new Text( 'cccccccccc' ) ),
			new Element( 'li', [], new Text( 'dddddddddd' ) ),
			new Element( 'li', [], new Text( 'eeeeeeeeee' ) ),
			new Element( 'li', [], new Text( 'ffffffffff' ) ),
			new Element( 'li', [], new Text( 'gggggggggg' ) ),
			new Element( 'li', [], new Text( 'hhhhhhhhhh' ) )
		];

		ul = new Element( 'ul', [], lis );
		p = new Element( 'p', [], new Text( 'qwertyuiop' ) );

		root.insertChildren( 0, [ ul, p, new Text( 'xyzxyz' ) ] );
	} );

	it( 'should be an instance of Range', () => {
		let live = new LiveRange( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
		live.detach();

		expect( live ).to.be.instanceof( Range );
	} );

	it( 'should listen to a change event of the document that owns this range', () => {
		sinon.spy( LiveRange.prototype, 'listenTo' );

		let live = new LiveRange( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
		live.detach();

		expect( live.listenTo.calledWith( doc, 'change' ) ).to.be.true;

		LiveRange.prototype.listenTo.restore();
	} );

	it( 'should stop listening when detached', () => {
		sinon.spy( LiveRange.prototype, 'stopListening' );

		let live = new LiveRange( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
		live.detach();

		expect( live.stopListening.called ).to.be.true;

		LiveRange.prototype.stopListening.restore();
	} );

	it( 'createIn should return LiveRange', () => {
		let range = LiveRange.createIn( p );
		expect( range ).to.be.instanceof( LiveRange );
		range.detach();
	} );

	it( 'createFromParentsAndOffsets should return LiveRange', () => {
		let range = LiveRange.createFromParentsAndOffsets( root, 0, p, 2 );
		expect( range ).to.be.instanceof( LiveRange );
		range.detach();
	} );

	it( 'createFromPositionAndShift should return LiveRange', () => {
		let range = LiveRange.createFromPositionAndShift( new Position( root, [ 0, 1 ] ), 4 );
		expect( range ).to.be.instanceof( LiveRange );
		range.detach();
	} );

	it( 'createFromRange should return LiveRange', () => {
		let range = LiveRange.createFromRange( new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ) );
		expect( range ).to.be.instanceof( LiveRange );
		range.detach();
	} );

	// Examples may seem weird when you compare them with the tree structure generated at the beginning of tests.
	// Since change event is fired _after_ operation is executed on tree model, you have to imagine that generated
	// structure is representing what is _after_ operation is executed. So live LiveRange properties are describing
	// virtual tree that is not existing anymore and event ranges are operating on the tree generated above.
	describe( 'should get transformed if', () => {
		let live, spy;

		beforeEach( () => {
			live = new LiveRange( new Position( root, [ 0, 1, 4 ] ), new Position( root, [ 0, 2, 2 ] ) );

			spy = sinon.spy();
			live.on( 'change', spy );
		} );

		afterEach( () => {
			live.detach();
		} );

		describe( 'insertion', () => {
			it( 'is in the same parent as range start and before it', () => {
				let insertRange = new Range( new Position( root, [ 0, 1, 0 ] ), new Position( root, [ 0, 1, 4 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 8 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 2 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is in the same parent as range end and before it', () => {
				let insertRange = new Range( new Position( root, [ 0, 2, 0 ] ), new Position( root, [ 0, 2, 3 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 5 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is at a position before a node from range start path', () => {
				let insertRange = new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 2 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.start.path ).to.deep.equal( [ 0, 3, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 4, 2 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is at a position before a node from range end path', () => {
				let insertRange = new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 3 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 3, 2 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is at the live range start position and live range is collapsed', () => {
				live.end.path = [ 0, 1, 4 ];

				let insertRange = new Range( new Position( root, [ 0, 1, 4 ] ), new Position( root, [ 0, 1, 8 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 8 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 1, 8 ] );
				expect( spy.calledOnce ).to.be.true;
			} );
		} );

		describe( 'range move', () => {
			it( 'is to the same parent as range start and before it', () => {
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( root, [ 0, 1, 0 ] ), new Position( root, [ 0, 1, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 8 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 2 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is to the same parent as range end and before it', () => {
				let moveSource = new Position( root, [ 3 ] );
				let moveRange = new Range( new Position( root, [ 0, 2, 0 ] ), new Position( root, [ 0, 2, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 6 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is to a position before a node from range start path', () => {
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 2 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 3, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 4, 2 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is to a position before a node from range end path', () => {
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 3 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 3, 2 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is from the same parent as range start and before it', () => {
				let moveSource = new Position( root, [ 0, 1, 0 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 3 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 1 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 2 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is from the same parent as range end and before it', () => {
				let moveSource = new Position( root, [ 0, 2, 0 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 2 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 0 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is from a position before a node from range start path', () => {
				let moveSource = new Position( root, [ 0, 0 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 1 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 0, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 1, 2 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'intersects on live range left side', () => {
				let moveSource = new Position( root, [ 0, 1, 2 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 2 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 2 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'intersects on live range right side', () => {
				let moveSource = new Position( root, [ 0, 2, 1 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 2, 1 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'intersects on live range left side and live range new start is touching moved range end', () => {
				let moveSource = new Position( root, [ 0, 1, 0 ] );
				let moveRange = new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 6 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 5 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 7, 2 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'intersects on live range right side and live range new end is touching moved range start', () => {
				live.end.offset = 12;

				let moveSource = new Position( root, [ 0, 2, 10 ] );
				let moveRange = new Range( new Position( root, [ 0, 3, 0 ] ), new Position( root, [ 0, 3, 5 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 3, 2 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is equal to live range', () => {
				live.end.path = [ 0, 1, 7 ];

				let moveSource = new Position( root, [ 0, 1, 4 ] );
				let moveRange = new Range( new Position( root, [ 0, 3, 0 ] ), new Position( root, [ 0, 3, 3 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 3, 0 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 3, 3 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'contains live range', () => {
				live.end.path = [ 0, 1, 7 ];

				let moveSource = new Position( root, [ 0, 1, 3 ] );
				let moveRange = new Range( new Position( root, [ 0, 3, 0 ] ), new Position( root, [ 0, 3, 9 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 3, 1 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 3, 4 ] );
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'is intersecting with live range and points to live range', () => {
				live.end.path = [ 0, 1, 12 ];

				let moveSource = new Position( root, [ 0, 1, 2 ] );
				let moveRange = new Range( new Position( root, [ 0, 1, 7 ] ), new Position( root, [ 0, 1, 10 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 2 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 1, 12 ] );
				expect( spy.calledOnce ).to.be.true;
			} );
		} );
	} );

	describe( 'should not get transformed if', () => {
		let otherRoot, spy;

		before( () => {
			otherRoot = doc.createRoot( '$root', 'otherRoot' );
		} );

		let live, clone;

		beforeEach( () => {
			live = new LiveRange( new Position( root, [ 0, 1, 4 ] ), new Position( root, [ 0, 2, 2 ] ) );
			clone = Range.createFromRange( live );

			spy = sinon.spy();
			live.on( 'change', spy );
		} );

		afterEach( () => {
			live.detach();
		} );

		describe( 'insertion', () => {
			it( 'is in the same parent as range start and after it', () => {
				let insertRange = new Range( new Position( root, [ 0, 1, 7 ] ), new Position( root, [ 0, 1, 9 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.isEqual( clone ) ).to.be.true;
				expect( spy.called ).to.be.false;
			} );

			it( 'is in the same parent as range end and after it', () => {
				let insertRange = new Range( new Position( root, [ 0, 2, 7 ] ), new Position( root, [ 0, 2, 9 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.isEqual( clone ) ).to.be.true;
				expect( spy.called ).to.be.false;
			} );

			it( 'is to a position after a node from range end path', () => {
				let insertRange = new Range( new Position( root, [ 3 ] ), new Position( root, [ 4 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.isEqual( clone ) ).to.be.true;
				expect( spy.called ).to.be.false;
			} );

			it( 'is in different root', () => {
				let insertRange = new Range( new Position( otherRoot, [ 0, 0 ] ), new Position( otherRoot, [ 0, 2 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.isEqual( clone ) ).to.be.true;
				expect( spy.called ).to.be.false;
			} );
		} );

		describe( 'range move', () => {
			it( 'is to the same parent as range start and after it', () => {
				let moveSource = new Position( root, [ 4 ] );
				let moveRange = new Range( new Position( root, [ 0, 1, 7 ] ), new Position( root, [ 0, 1, 9 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
				expect( spy.called ).to.be.false;
			} );

			it( 'is to the same parent as range end and after it', () => {
				let moveSource = new Position( root, [ 4 ] );
				let moveRange = new Range( new Position( root, [ 0, 2, 3 ] ), new Position( root, [ 0, 2, 5 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
				expect( spy.called ).to.be.false;
			} );

			it( 'is to a position after a node from range end path', () => {
				let moveSource = new Position( root, [ 4 ] );
				let moveRange = new Range( new Position( root, [ 0, 3 ] ), new Position( root, [ 0, 5 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
				expect( spy.called ).to.be.false;
			} );

			it( 'is from the same parent as range start and after it', () => {
				let moveSource = new Position( root, [ 0, 1, 6 ] );
				let moveRange = new Range( new Position( root, [ 4, 0 ] ), new Position( root, [ 4, 3 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
				expect( spy.called ).to.be.false;
			} );

			it( 'is from the same parent as range end and after it', () => {
				let moveSource = new Position( root, [ 0, 2, 4 ] );
				let moveRange = new Range( new Position( root, [ 4, 0 ] ), new Position( root, [ 4, 2 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
				expect( spy.called ).to.be.false;
			} );

			it( 'is from a position after a node from range end path', () => {
				let moveSource = new Position( root, [ 0, 3 ] );
				let moveRange = new Range( new Position( root, [ 5, 0 ] ), new Position( root, [ 5, 1 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
				expect( spy.called ).to.be.false;
			} );

			it( 'is to different root', () => {
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( otherRoot, [ 0, 1, 0 ] ), new Position( otherRoot, [ 0, 1, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
				expect( spy.called ).to.be.false;
			} );

			it( 'is from different root', () => {
				let moveSource = new Position( otherRoot, [ 0, 2, 0 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 2 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.isEqual( clone ) ).to.be.true;
				expect( spy.called ).to.be.false;
			} );

			it( 'is inside live range and points to live range', () => {
				live.end.path = [ 0, 1, 12 ];

				let moveSource = new Position( root, [ 0, 1, 6 ] );
				let moveRange = new Range( new Position( root, [ 0, 1, 8 ] ), new Position( root, [ 0, 1, 10 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.start.path ).to.deep.equal( [ 0, 1, 4 ] );
				expect( live.end.path ).to.deep.equal( [ 0, 1, 12 ] );
				expect( spy.calledOnce ).to.be.false;
			} );
		} );
	} );
} );
