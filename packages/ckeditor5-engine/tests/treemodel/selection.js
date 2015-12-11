/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

const modules = bender.amd.require(
	'treemodel/document',
	'treemodel/element',
	'treemodel/range',
	'treemodel/position',
	'treemodel/liverange',
	'treemodel/selection',
	'treemodel/operation/insertoperation',
	'treemodel/operation/moveoperation',
	'ckeditorerror'
);

describe( 'Selection', () => {
	let Document, Element, Range, Position, LiveRange, Selection, InsertOperation, MoveOperation, CKEditorError;

	before( () => {
		Document = modules[ 'treemodel/document' ];
		Element = modules[ 'treemodel/element' ];
		Range = modules[ 'treemodel/range' ];
		Position = modules[ 'treemodel/position' ];
		LiveRange = modules[ 'treemodel/liverange' ];
		Selection = modules[ 'treemodel/selection' ];
		InsertOperation = modules[ 'treemodel/operation/insertoperation' ];
		MoveOperation = modules[ 'treemodel/operation/moveoperation' ];
		CKEditorError = modules.ckeditorerror;
	} );

	let doc, root, selection, liveRange, range;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		selection = new Selection();

		liveRange = new LiveRange( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
		range = new Range( new Position( root, [ 2 ] ), new Position( root, [ 2, 2 ] ) );
	} );

	afterEach( () => {
		selection.detach();
		liveRange.detach();
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
		selection.addRange( liveRange );

		expect( selection.isCollapsed ).to.be.false;

		selection.addRange( new Range( new Position( root, [ 0 ] ), new Position( root, [ 0 ] ) ) );

		expect( selection.isCollapsed ).to.be.false;
	} );

	it( 'should copy added ranges and store multiple ranges', () => {
		selection.addRange( liveRange );
		selection.addRange( range );

		let ranges = selection.getRanges();

		expect( ranges.length ).to.equal( 2 );
		expect( ranges[ 0 ].isEqual( liveRange ) ).to.be.true;
		expect( ranges[ 1 ].isEqual( range ) ).to.be.true;
		expect( ranges[ 0 ] ).not.to.be.equal( liveRange );
		expect( ranges[ 1 ] ).not.to.be.equal( range );
	} );

	it( 'should set anchor and focus to the start and end of the most recently added range', () => {
		selection.addRange( liveRange );

		expect( selection.anchor.path ).to.deep.equal( [ 0 ] );
		expect( selection.focus.path ).to.deep.equal( [ 1 ] );

		selection.addRange( range );

		expect( selection.anchor.path ).to.deep.equal( [ 2 ] );
		expect( selection.focus.path ).to.deep.equal( [ 2, 2 ] );
	} );

	it( 'should set anchor and focus to the end and start of the most recently added range if backward flag was used', () => {
		selection.addRange( liveRange, true );

		expect( selection.anchor.path ).to.deep.equal( [ 1 ] );
		expect( selection.focus.path ).to.deep.equal( [ 0 ] );

		selection.addRange( range, true );

		expect( selection.anchor.path ).to.deep.equal( [ 2, 2 ] );
		expect( selection.focus.path ).to.deep.equal( [ 2 ] );
	} );

	it( 'should return a copy of (not a reference to) array of stored ranges', () => {
		selection.addRange( liveRange );

		let ranges = selection.getRanges();

		selection.addRange( range );

		expect( ranges.length ).to.equal( 1 );
		expect( ranges[ 0 ].isEqual( liveRange ) ).to.be.true;
	} );

	it( 'should convert added Range to LiveRange', () => {
		selection.addRange( range );

		let ranges = selection.getRanges();

		expect( ranges[ 0 ] ).to.be.instanceof( LiveRange );
	} );

	it( 'should fire update event when adding a range', () => {
		let spy = sinon.spy();
		selection.on( 'update', spy );

		selection.addRange( range );

		expect( spy.called ).to.be.true;
	} );

	it( 'should unbind all events when detached', () => {
		selection.addRange( liveRange );
		selection.addRange( range );

		let ranges = selection.getRanges();

		sinon.spy( ranges[ 0 ], 'detach' );
		sinon.spy( ranges[ 1 ], 'detach' );

		selection.detach();

		expect( ranges[ 0 ].detach.called ).to.be.true;
		expect( ranges[ 1 ].detach.called ).to.be.true;

		ranges[ 0 ].detach.restore();
		ranges[ 1 ].detach.restore();
	} );

	it( 'should throw an error if added range intersects with already stored range', () => {
		selection.addRange( liveRange );

		expect( () => {
			selection.addRange(
				new Range(
					new Position( root, [ 0, 4 ] ),
					new Position( root, [ 1, 2 ] )
				)
			);
		} ).to.throw( CKEditorError, /selection-range-intersects/ );
	} );

	describe( 'removeAllRanges', () => {
		let spy, ranges;

		beforeEach( () => {
			selection.addRange( liveRange );
			selection.addRange( range );

			spy = sinon.spy();
			selection.on( 'update', spy );

			ranges = selection.getRanges();

			sinon.spy( ranges[ 0 ], 'detach' );
			sinon.spy( ranges[ 1 ], 'detach' );

			selection.removeAllRanges();
		} );

		afterEach( () => {
			ranges[ 0 ].detach.restore();
			ranges[ 1 ].detach.restore();
		} );

		it( 'should remove all stored ranges', () => {
			expect( selection.getRanges().length ).to.equal( 0 );
			expect( selection.anchor ).to.be.null;
			expect( selection.focus ).to.be.null;
			expect( selection.isCollapsed ).to.be.true;
		} );

		it( 'should fire exactly one update event', () => {
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should detach removed ranges', () => {
			expect( ranges[ 0 ].detach.called ).to.be.true;
			expect( ranges[ 1 ].detach.called ).to.be.true;
		} );
	} );

	describe( 'setRanges', () => {
		let newRanges, spy, oldRanges;

		before( () => {
			newRanges = [
				new Range( new Position( root, [ 4 ] ), new Position( root, [ 5 ] ) ),
				new Range( new Position( root, [ 5, 0 ] ), new Position( root, [ 6, 0 ] ) )
			];
		} );

		beforeEach( () => {
			selection.addRange( liveRange );
			selection.addRange( range );

			spy = sinon.spy();
			selection.on( 'update', spy );

			oldRanges = selection.getRanges();

			sinon.spy( oldRanges[ 0 ], 'detach' );
			sinon.spy( oldRanges[ 1 ], 'detach' );
		} );

		afterEach( () => {
			oldRanges[ 0 ].detach.restore();
			oldRanges[ 1 ].detach.restore();
		} );

		it( 'should remove all ranges and add given ranges', () => {
			selection.setRanges( newRanges );

			let ranges = selection.getRanges();

			expect( ranges.length ).to.equal( 2 );
			expect( ranges[ 0 ].isEqual( newRanges[ 0 ] ) ).to.be.true;
			expect( ranges[ 1 ].isEqual( newRanges[ 1 ] ) ).to.be.true;
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
			selection.setRanges( newRanges );
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should detach removed LiveRanges', () => {
			selection.setRanges( newRanges );
			expect( oldRanges[ 0 ].detach.called ).to.be.true;
			expect( oldRanges[ 1 ].detach.called ).to.be.true;
		} );
	} );

	// Selection uses LiveRanges so here are only simple test to see if integration is
	// working well, without getting into complicated corner cases.
	describe( 'after applying an operation should get updated and not fire update event', () => {
		let spy;

		beforeEach( () => {
			root.insertChildren( 0, [ new Element( 'ul', [], 'abcdef' ), new Element( 'p', [], 'foobar' ), 'xyz' ] );

			selection.addRange( new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 1, 4 ] ) ) );

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

				expect( range.start.path ).to.deep.equal( [ 0, 2 ] );
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

				expect( range.start.path ).to.deep.equal( [ 0, 2 ] );
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

				expect( range.start.path ).to.deep.equal( [ 0, 2 ] );
				expect( range.end.path ).to.deep.equal( [ 2, 2 ] );
				expect( spy.called ).to.be.false;
			} );
		} );
	} );
} );
