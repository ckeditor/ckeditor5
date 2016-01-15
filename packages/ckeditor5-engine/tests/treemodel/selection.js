/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import coreTestUtils from '/tests/core/_utils/utils.js';
import Document from '/ckeditor5/core/treemodel/document.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import Range from '/ckeditor5/core/treemodel/range.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import LiveRange from '/ckeditor5/core/treemodel/liverange.js';
import Selection from '/ckeditor5/core/treemodel/selection.js';
import InsertOperation from '/ckeditor5/core/treemodel/operation/insertoperation.js';
import MoveOperation from '/ckeditor5/core/treemodel/operation/moveoperation.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

const getIteratorCount = coreTestUtils.getIteratorCount;

describe( 'Selection', () => {
	let attrFooBar;

	before( () => {
		attrFooBar = new Attribute( 'foo', 'bar' );
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

	// Testing integration with attributes list.
	// Tests copied from AttributeList tests.
	// Some cases were omitted.

	describe( 'setAttr', () => {
		it( 'should insert an attribute', () => {
			selection.setAttr( attrFooBar );

			expect( getIteratorCount( selection.getAttrs() ) ).to.equal( 1 );
			expect( selection.getAttr( attrFooBar.key ) ).to.equal( attrFooBar.value );
		} );
	} );

	describe( 'setAttrsTo', () => {
		it( 'should remove all attributes and set passed ones', () => {
			selection.setAttr( attrFooBar );

			let attrs = [ new Attribute( 'abc', true ), new Attribute( 'xyz', false ) ];

			selection.setAttrsTo( attrs );

			expect( getIteratorCount( selection.getAttrs() ) ).to.equal( 2 );
			expect( selection.getAttr( 'foo' ) ).to.be.null;
			expect( selection.getAttr( 'abc' ) ).to.be.true;
			expect( selection.getAttr( 'xyz' ) ).to.be.false;
		} );
	} );

	describe( 'getAttr', () => {
		beforeEach( () => {
			selection.setAttr( attrFooBar );
		} );

		it( 'should return attribute value if key of previously set attribute has been passed', () => {
			expect( selection.getAttr( 'foo' ) ).to.equal( attrFooBar.value );
		} );

		it( 'should return null if attribute with given key has not been found', () => {
			expect( selection.getAttr( 'bar' ) ).to.be.null;
		} );
	} );

	describe( 'removeAttr', () => {
		it( 'should remove an attribute', () => {
			let attrA = new Attribute( 'a', 'A' );
			let attrB = new Attribute( 'b', 'B' );
			let attrC = new Attribute( 'c', 'C' );

			selection.setAttr( attrA );
			selection.setAttr( attrB );
			selection.setAttr( attrC );

			selection.removeAttr( attrB.key );

			expect( getIteratorCount( selection.getAttrs() ) ).to.equal( 2 );
			expect( selection.getAttr( attrA.key ) ).to.equal( attrA.value );
			expect( selection.getAttr( attrC.key ) ).to.equal( attrC.value );
			expect( selection.getAttr( attrB.key ) ).to.be.null;
		} );
	} );

	describe( 'hasAttr', () => {
		it( 'should check attribute by key', () => {
			selection.setAttr( attrFooBar );
			expect( selection.hasAttr( 'foo' ) ).to.be.true;
		} );

		it( 'should return false if attribute was not found by key', () => {
			expect( selection.hasAttr( 'bar' ) ).to.be.false;
		} );

		it( 'should check attribute by object', () => {
			selection.setAttr( attrFooBar );
			expect( selection.hasAttr( attrFooBar ) ).to.be.true;
		} );

		it( 'should return false if attribute was not found by object', () => {
			expect( selection.hasAttr( attrFooBar ) ).to.be.false;
		} );
	} );

	describe( 'getAttrs', () => {
		it( 'should return all set attributes', () => {
			let attrA = new Attribute( 'a', 'A' );
			let attrB = new Attribute( 'b', 'B' );
			let attrC = new Attribute( 'c', 'C' );

			selection.setAttrsTo( [
				attrA,
				attrB,
				attrC
			] );

			selection.removeAttr( attrB.key );

			expect( [ attrA, attrC ] ).to.deep.equal( Array.from( selection.getAttrs() ) );
		} );
	} );
} );
