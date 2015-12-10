/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

const modules = bender.amd.require(
	'treemodel/document',
	'treemodel/element',
	'treemodel/position',
	'treemodel/liveposition',
	'treemodel/range',
	'emittermixin'
);

describe( 'LivePosition', () => {
	let Document, Element, Position, LivePosition, Range, EmitterMixin;
	let doc, root, ul, p, li1, li2;

	before( () => {
		Document = modules[ 'treemodel/document' ];
		Element = modules[ 'treemodel/element' ];
		Position = modules[ 'treemodel/position' ];
		LivePosition = modules[ 'treemodel/liveposition' ];
		Range = modules[ 'treemodel/range' ];
		EmitterMixin = modules.emittermixin;

		doc = new Document();
		root = doc.createRoot( 'root' );

		li1 = new Element( 'li', [], 'abcdef' );
		li2 = new Element( 'li', [], 'foobar' );
		ul = new Element( 'ul', [], [ li1, li2 ] );
		p = new Element( 'p', [], 'qwerty' );

		root.insertChildren( 0, [ p, ul ] );
	} );

	it( 'should be an instance of Position', () => {
		let live = new LivePosition( root, [ 0 ] );
		live.detach();

		expect( live ).to.be.instanceof( Position );
	} );

	it( 'should return instance of Position when cloned', () => {
		let live = new LivePosition( root, [ 0 ] );
		let clone = live.clone();

		expect( clone ).to.be.instanceof( Position );

		live.detach();
	} );

	it( 'should return instance of LivePosition when cloned with flag set to true', () => {
		let live = new LivePosition( root, [ 0 ] );
		let clone = live.clone( true );

		expect( clone ).to.be.instanceof( LivePosition );

		live.detach();
		clone.detach();
	} );

	it( 'should listen to a change event of the document that owns this position root', () => {
		sinon.spy( LivePosition.prototype, 'listenTo' );

		let live = new LivePosition( root, [ 0 ] );
		live.detach();

		expect( live.listenTo.calledWith( doc, 'change' ) ).to.be.true;

		LivePosition.prototype.listenTo.restore();
	} );

	it( 'should stop listening when detached', () => {
		sinon.spy( LivePosition.prototype, 'stopListening' );

		let live = new LivePosition( root, [ 0 ] );
		live.detach();

		expect( live.stopListening.called ).to.be.true;

		LivePosition.prototype.stopListening.restore();
	} );

	it( 'createFromParentAndOffset should return LivePosition', () => {
		let position = LivePosition.createFromParentAndOffset( ul, 0 );
		expect( position ).to.be.instanceof( LivePosition );
		position.detach();
	} );

	it( 'createBefore should return LivePosition', () => {
		let position = LivePosition.createBefore( ul );
		expect( position ).to.be.instanceof( LivePosition );
		position.detach();
	} );

	it( 'createAfter should return LivePosition', () => {
		let position = LivePosition.createAfter( ul );
		expect( position ).to.be.instanceof( LivePosition );
		position.detach();
	} );

	describe( 'should get transformed if', () => {
		let live;

		beforeEach( () => {
			live = new LivePosition( root, [ 1, 4, 6 ] );
		} );

		afterEach( () => {
			live.detach();
		} );

		describe( 'insertion', () => {
			it( 'is in the same parent and closer offset', () => {
				let insertRange = new Range( new Position( root, [ 1, 4, 0 ] ), new Position( root, [ 1, 4, 3 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.path ).to.deep.equal( [ 1, 4, 9 ] );
			} );

			it( 'is at the same position and live position is sticking to right side', () => {
				let insertRange = new Range( new Position( root, [ 1, 4, 6 ] ), new Position( root, [ 1, 4, 9 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.path ).to.deep.equal( [ 1, 4, 9 ] );
			} );

			it( 'is before a node from the live position path', () => {
				let insertRange = new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 1, 2 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.path ).to.deep.equal( [ 1, 6, 6 ] );
			} );
		} );

		describe( 'range move', () => {
			it( 'is at the same parent and closer offset', () => {
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( root, [ 1, 4, 0 ] ), new Position( root, [ 1, 4, 3 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( [ 1, 4, 9 ] );
			} );

			it( 'is at the same position and live position is sticking to right side', () => {
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( root, [ 1, 4, 6 ] ), new Position( root, [ 1, 4, 9 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( [ 1, 4, 9 ] );
			} );

			it( 'is at a position before a node from the live position path', () => {
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 1, 2 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( [ 1, 6, 6 ] );
			} );

			it( 'is from the same parent and closer offset', () => {
				let moveSource = new Position( root, [ 1, 4, 0 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( [ 1, 4, 2 ] );
			} );

			it( 'is from a position before a node from the live position path', () => {
				let moveSource = new Position( root, [ 1, 0 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( [ 1, 0, 6 ] );
			} );

			it( 'contains live position (same level)', () => {
				let moveSource = new Position( root, [ 1, 4, 4 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( [ 2, 2 ] );
			} );

			it( 'contains live position (deep)', () => {
				let moveSource = new Position( root, [ 1, 3 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( [ 2, 1, 6 ] );
			} );
		} );
	} );

	describe( 'should not get transformed if', () => {
		let path, otherRoot;

		before( () => {
			path = [ 1, 4, 6 ];
			otherRoot = doc.createRoot( 'otherRoot' );
		} );

		let live;

		beforeEach( () => {
			live = new LivePosition( root, path );
		} );

		afterEach( () => {
			live.detach();
		} );

		describe( 'insertion', () => {
			it( 'is in the same parent and further offset', () => {
				let insertRange = new Range( new Position( root, [ 1, 4, 7 ] ), new Position( root, [ 1, 4, 9 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.path ).to.deep.equal( path );
			} );

			it( 'is at the same position and live position is sticking to left side', () => {
				let live = new LivePosition( root, path, true );
				let insertRange = new Range( new Position( root, [ 1, 4, 6 ] ), new Position( root, [ 1, 4, 9 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.path ).to.deep.equal( path );

				live.detach();
			} );

			it( 'is after a node from the position path', () => {
				let insertRange = new Range( new Position( root, [ 1, 5 ] ), new Position( root, [ 1, 7 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.path ).to.deep.equal( path );
			} );

			it( 'is in different root', () => {
				let insertRange = new Range( new Position( otherRoot, [ 1, 4, 0 ] ), new Position( otherRoot, [ 1, 4, 4 ] ) );

				doc.fire( 'change', 'insert', { range: insertRange }, null );

				expect( live.path ).to.deep.equal( path );
			} );
		} );

		describe( 'range move', () => {
			it( 'is at the same parent and further offset', () => {
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( root, [ 1, 4, 7 ] ), new Position( root, [ 1, 4, 9 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( path );
			} );

			it( 'is at the same position and live position is sticking to left side', () => {
				let live = new LivePosition( root, path, true );
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( root, [ 1, 4, 6 ] ), new Position( root, [ 1, 4, 9 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( path );

				live.detach();
			} );

			it( 'is at a position after a node from the live position path', () => {
				let moveSource = new Position( root, [ 2 ] );
				let moveRange = new Range( new Position( root, [ 1, 5 ] ), new Position( root, [ 1, 7 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( path );
			} );

			it( 'is from the same parent and further offset', () => {
				let moveSource = new Position( root, [ 1, 4, 7 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( path );
			} );

			it( 'is from a position after a node from the live position path', () => {
				let moveSource = new Position( root, [ 1, 5 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( path );
			} );

			it( 'is to different root', () => {
				let moveSource = new Position( root, [ 2, 0 ] );
				let moveRange = new Range( new Position( otherRoot, [ 1, 0 ] ), new Position( otherRoot, [ 1, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( path );
			} );

			it( 'is from different root', () => {
				let moveSource = new Position( otherRoot, [ 1, 0 ] );
				let moveRange = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 4 ] ) );

				let changes = {
					range: moveRange,
					sourcePosition: moveSource
				};
				doc.fire( 'change', 'move', changes, null );

				expect( live.path ).to.deep.equal( path );
			} );
		} );
	} );
} );
