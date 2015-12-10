/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

const modules = bender.amd.require(
	'treemodel/document',
	'treemodel/range',
	'treemodel/position',
	'treemodel/liverange',
	'treemodel/selection',
	'treemodel/operation/insertoperation',
	'treemodel/operation/moveoperation'
);

describe( 'Selection', () => {
	let Document, Range, Position, LiveRange, Selection, InsertOperation, MoveOperation;

	before( () => {
		Document = modules[ 'treemodel/document' ];
		Range = modules[ 'treemodel/range' ];
		Position = modules[ 'treemodel/position' ];
		LiveRange = modules[ 'treemodel/liverange' ];
		Selection = modules[ 'treemodel/selection' ];
		InsertOperation = modules[ 'treemodel/operation/insertoperation' ];
		MoveOperation = modules[ 'treemodel/operation/moveoperation' ];
	} );

	let doc, root, selection, range1, range2;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		selection = new Selection();

		range1 = new LiveRange( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
		range2 = new LiveRange( new Position( root, [ 2 ] ), new Position( root, [ 2, 2 ] ) );
	} );

	afterEach( () => {
		selection.detach();
		range1.detach();
		range2.detach();
	} );

	it( 'should not have any range, anchor or focus position when just created', () => {
		let ranges = selection.getRanges();
		expect( ranges.length ).to.equal( 0 );
		expect( selection.anchor ).to.be.null;
		expect( selection.focus ).to.be.null;
	} );

	it( 'should be collapsed if it has no ranges or all ranges are collapsed', () => {
		expect( selection.isCollapsed ).to.be.true;

		selection.addRange( new Range( new Position( root, [ 0 ] ), new Position( root, [ 0 ] ) ) );

		expect( selection.isCollapsed ).to.be.true;
	} );

	it( 'should not be collapsed when it has a range that is not collapsed', () => {
		selection.addRange( range1 );

		expect( selection.isCollapsed ).to.be.false;

		selection.addRange( new Range( new Position( root, [ 0 ] ), new Position( root, [ 0 ] ) ) );

		expect( selection.isCollapsed ).to.be.false;
	} );

	it( 'should store multiple ranges', () => {
		selection.addRange( range1 );
		selection.addRange( range2 );

		let ranges = selection.getRanges();

		expect( ranges.length ).to.equal( 2 );
		expect( ranges[ 0 ] ).to.equal( range1 );
		expect( ranges[ 1 ] ).to.equal( range2 );
	} );

	it( 'should set anchor and focus to the start and end of the most recently added range', () => {
		selection.addRange( range1 );

		expect( selection.anchor.path ).to.deep.equal( [ 0 ] );
		expect( selection.focus.path ).to.deep.equal( [ 1 ] );

		selection.addRange( range2 );

		expect( selection.anchor.path ).to.deep.equal( [ 2 ] );
		expect( selection.focus.path ).to.deep.equal( [ 2, 2 ] );
	} );

	it( 'should set anchor and focus to the end and start of the most recently added range if backward flag was used', () => {
		selection.addRange( range1, true );

		expect( selection.anchor.path ).to.deep.equal( [ 1 ] );
		expect( selection.focus.path ).to.deep.equal( [ 0 ] );

		selection.addRange( range2, true );

		expect( selection.anchor.path ).to.deep.equal( [ 2, 2 ] );
		expect( selection.focus.path ).to.deep.equal( [ 2 ] );
	} );

	it( 'should convert added Range to LiveRange', () => {
		let range = new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
		selection.addRange( range );

		let ranges = selection.getRanges();

		expect( ranges[ 0 ] ).to.be.instanceof( LiveRange );
		expect( ranges[ 0 ].isEqual( range ) ).to.be.true;
	} );

	it( 'should fire update event when adding a range', () => {
		let spy = sinon.spy();
		selection.on( 'update', spy );

		selection.addRange( range1 );

		expect( spy.called ).to.be.true;
	} );

	it( 'should unbind all events when detached', () => {
		selection.addRange( range1 );
		selection.addRange( new Range( new Position( root, [ 3 ] ), new Position( root, [ 4 ] ) ) );

		let ranges = selection.getRanges();

		sinon.spy( ranges[ 0 ], 'detach' );
		sinon.spy( ranges[ 1 ], 'detach' );

		selection.detach();

		expect( ranges[ 0 ].detach.called ).to.be.true;
		expect( ranges[ 1 ].detach.called ).to.be.true;

		ranges[ 0 ].detach.restore();
		ranges[ 1 ].detach.restore();
	} );

	describe( 'removeAllRanges', () => {
		let spy;

		beforeEach( () => {
			selection.addRange( range1 );
			selection.addRange( range2 );

			spy = sinon.spy();
			selection.on( 'update', spy );

			sinon.spy( range1, 'detach' );
			sinon.spy( range2, 'detach' );

			selection.removeAllRanges();
		} );

		afterEach( () => {
			range1.detach.restore();
			range2.detach.restore();
		} );

		it( 'should remove all stored ranges', () => {
			let ranges = selection.getRanges();

			expect( ranges.length ).to.equal( 0 );
			expect( selection.anchor ).to.be.null;
			expect( selection.focus ).to.be.null;
			expect( selection.isCollapsed ).to.be.true;
		} );

		it( 'should fire exactly one update event', () => {
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should detach removed LiveRanges', () => {
			expect( range1.detach.called ).to.be.true;
			expect( range2.detach.called ).to.be.true;
		} );
	} );

	describe( 'setRanges', () => {
		let newRanges, spy;

		before( () => {
			newRanges = [
				new LiveRange( new Position( root, [ 4 ] ), new Position( root, [ 5 ] ) ),
				new LiveRange( new Position( root, [ 5, 0 ] ), new Position( root, [ 6, 0 ] ) )
			];
		} );

		beforeEach( () => {
			selection.addRange( range1 );
			selection.addRange( range2 );

			spy = sinon.spy();
			selection.on( 'update', spy );

			sinon.spy( range1, 'detach' );
			sinon.spy( range2, 'detach' );
		} );

		afterEach( () => {
			range1.detach.restore();
			range2.detach.restore();
		} );

		it( 'should remove all ranges and add given ranges', () => {
			selection.setRanges( newRanges );
			let ranges = selection.getRanges();

			expect( ranges.length ).to.equal( 2 );
			expect( ranges[ 0 ] ).to.equal( newRanges[ 0 ] );
			expect( ranges[ 1 ] ).to.equal( newRanges[ 1 ] );
		} );

		it( 'should use last range from given array to get anchor and focus position', () => {
			selection.setRanges( newRanges );

			expect( selection.anchor.path ).to.deep.equal( [ 5, 0 ] );
			expect( selection.focus.path ).to.deep.equal( [ 6, 0 ] );
		} );

		it( 'should acknowledge backward flag when setting anchor and focus', () => {
			selection.setRanges( newRanges, true );

			expect( selection.anchor.path ).to.deep.equal( [ 6, 0 ] );
			expect( selection.focus.path ).to.deep.equal( [ 5, 0 ] );
		} );

		it( 'should fire exactly one update event', () => {
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should detach removed LiveRanges', () => {
			expect( range1.detach.called ).to.be.true;
			expect( range2.detach.called ).to.be.true;
		} );
	} );

	// Selection uses LiveRanges so here are only simple test to see if integration is
	// working well, without getting into complicated corner cases.
	describe( 'after applying an operation should get updated and not fire update event', () => {
		let spy;

		beforeEach( () => {
			root.insertChildren( 0, [ new Element( 'ul', [], 'abcdef' ), new Element( 'p', [], 'foobar' ), 'xyz' ] );

			selection.addRange( new LiveRange( new Position( root, [ 0, 2 ] ), new Position( root, [ 1, 4 ] ) ) );

			spy = sinon.spy();
			selection.on( 'update', spy );
		} );

		describe( 'InsertOperation', () => {
			it( 'before selection', () => {
				doc.applyOperation(
					new InsertOperation(
						new Position( root, [ 0, 1 ] ),
						'xyz',
						doc.version
					)
				);

				let range = selection.getRanges()[ 0 ];

				expect( range.start.path ).to.deep.equal( [ 0, 5 ] );
				expect( range.end.path ).to.deep.equal( [ 1, 4 ] );
				expect( spy.called ).to.be.false;
			} );

			it( 'inside selection', () => {
				doc.applyOperation(
					new InsertOperation(
						new Position( root, [ 1, 0 ] ),
						'xyz',
						doc.version
					)
				);

				let range = selection.getRanges()[ 0 ];

				expect( range.start.path ).to.deep.equal( [ 0, 2 ] );
				expect( range.end.path ).to.deep.equal( [ 1, 7 ] );
				expect( spy.called ).to.be.false;
			} );
		} );

		describe( 'MoveOperation', () => {
			it( 'move range from before a selection', () => {
				doc.applyOperation(
					new MoveOperation(
						new Position( root, [ 0, 0 ] ),
						2,
						new Position( root, [ 2 ] ),
						doc.version
					)
				);

				let range = selection.getRanges()[ 0 ];

				expect( range.start.path ).to.deep.equal( [ 0, 0 ] );
				expect( range.end.path ).to.deep.equal( [ 1, 4 ] );
				expect( spy.called ).to.be.false;
			} );

			it( 'moved into before a selection', () => {
				doc.applyOperation(
					new MoveOperation(
						new Position( root, [ 2 ] ),
						2,
						new Position( root, [ 0, 0 ] ),
						doc.version
					)
				);

				let range = selection.getRanges()[ 0 ];

				expect( range.start.path ).to.deep.equal( [ 0, 4 ] );
				expect( range.end.path ).to.deep.equal( [ 1, 4 ] );
				expect( spy.called ).to.be.false;
			} );

			it( 'move range from inside of selection', () => {
				doc.applyOperation(
					new MoveOperation(
						new Position( root, [ 1, 0 ] ),
						2,
						new Position( root, [ 2 ] ),
						doc.version
					)
				);

				let range = selection.getRanges()[ 0 ];

				expect( range.start.path ).to.deep.equal( [ 0, 4 ] );
				expect( range.end.path ).to.deep.equal( [ 1, 2 ] );
				expect( spy.called ).to.be.false;
			} );

			it( 'moved range intersects with selection', () => {
				doc.applyOperation(
					new MoveOperation(
						new Position( root, [ 1, 3 ] ),
						2,
						new Position( root, [ 4 ] ),
						doc.version
					)
				);

				let range = selection.getRanges()[ 0 ];

				expect( range.start.path ).to.deep.equal( [ 0, 4 ] );
				expect( range.end.path ).to.deep.equal( [ 1, 3 ] );
				expect( spy.called ).to.be.false;
			} );

			it( 'split inside selection (do not break selection)', () => {
				doc.applyOperation(
					new InsertOperation(
						new Position( root, [ 2 ] ),
						new Element( 'p' ),
						doc.version
					)
				);

				doc.applyOperation(
					new MoveOperation(
						new Position( root, [ 1, 2 ] ),
						4,
						new Position( root, [ 2, 0 ] ),
						doc.version
					)
				);

				let range = selection.getRanges()[ 0 ];

				expect( range.start.path ).to.deep.equal( [ 0, 4 ] );
				expect( range.end.path ).to.deep.equal( [ 1, 2 ] );
				expect( spy.called ).to.be.false;
			} );
		} );
	} );
} );
