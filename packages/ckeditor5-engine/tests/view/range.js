/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

'use strict';

import Range from '/ckeditor5/engine/view/range.js';
import Position from '/ckeditor5/engine/view/position.js';
import Element from '/ckeditor5/engine/view/element.js';
import Text from '/ckeditor5/engine/view/text.js';

describe( 'Range', () => {
	describe( 'constructor', () => {
		it( 'creates range from provided positions', () => {
			const start = new Position( {}, 1 );
			const end = new Position( {}, 2 );
			const range = new Range( start, end );

			expect( range ).to.be.an.instanceof( Range );
			expect( range ).to.have.property( 'start' ).that.not.equals( start );
			expect( range ).to.have.property( 'end' ).that.not.equals( end );
			expect( range.start.parent ).to.equal( start.parent );
			expect( range.end.parent ).to.equal( end.parent );
			expect( range.start.offset ).to.equal( start.offset );
			expect( range.end.offset ).to.equal( end.offset );
		} );
	} );

	describe( 'isEqual', () => {
		it( 'should return true for the same range', () => {
			const start = new Position( {}, 1 );
			const end = new Position( {}, 2 );
			const range = new Range( start, end );

			expect( range.isEqual( range ) ).to.be.true;
		} );

		it( 'should return true for ranges with same start and end positions', () => {
			const start = new Position( {}, 1 );
			const end = new Position( {}, 2 );
			const range1 = new Range( start, end );
			const range2 = new Range( start, end );

			expect( range1.isEqual( range2 ) ).to.be.true;
		} );

		it( 'should return false if start position is different', () => {
			const start1 = new Position( {}, 1 );
			const start2 = new Position( {}, 1 );
			const end = new Position( {}, 2 );
			const range1 = new Range( start1, end );
			const range2 = new Range( start2, end );

			expect( range1.isEqual( range2 ) ).to.be.false;
		} );

		it( 'should return false if end position is different', () => {
			const start = new Position( {}, 1 );
			const end1 = new Position( {}, 2 );
			const end2 = new Position( {}, 2 );
			const range1 = new Range( start, end1 );
			const range2 = new Range( start, end2 );

			expect( range1.isEqual( range2 ) ).to.be.false;
		} );

		it( 'should return false for ranges with same root and different offsets', () => {
			const mockObject = {};
			const range1 = new Range( new Position( mockObject, 0 ), new Position( mockObject, 10 )  );
			const range2 = new Range( new Position( mockObject, 2 ), new Position( mockObject, 10 )  );

			expect( range1.isEqual( range2 ) ).to.be.false;
		} );
	} );

	describe( 'isIntersecting', () => {
		let root, p1, p2, t1, t2, t3;

		//            root
		//    __________|__________
		//    |                   |
		// ___p1___               p2
		// |       |              |
		// t1      t2             t3

		beforeEach( () => {
			t1 = new Text( 'foo' );
			t2 = new Text( 'bar' );
			t3 = new Text( 'baz' );
			p1 = new Element( 'p', null, [ t1, t2 ] );
			p2 = new Element( 'p', null, t3 );
			root = new Element( 'div', null, [ p1, p2 ] );
		} );

		it( 'should return true if given range is equal', () => {
			const range = Range.createFromParentsAndOffsets( t1, 0, t3, 2 );
			const otherRange = Range.createFromRange( range );
			expect( range.isIntersecting( otherRange ) ).to.be.true;
			expect( otherRange.isIntersecting( range ) ).to.be.true;
		} );

		it( 'should return true if given range contains this range', () => {
			const range = Range.createFromParentsAndOffsets( t1, 0, t3, 3 );
			const otherRange = Range.createFromParentsAndOffsets( p1, 1, t2, 2 );

			expect( range.isIntersecting( otherRange ) ).to.be.true;
			expect( otherRange.isIntersecting( range ) ).to.be.true;
		} );

		it( 'should return true if given range ends in this range', () => {
			const range = Range.createFromParentsAndOffsets( root, 1, t3, 3 );
			const otherRange = Range.createFromParentsAndOffsets( t1, 0, p2, 0 );

			expect( range.isIntersecting( otherRange ) ).to.be.true;
			expect( otherRange.isIntersecting( range ) ).to.be.true;
		} );

		it( 'should return true if given range starts in this range', () => {
			const range = Range.createFromParentsAndOffsets( t1, 0, t2, 3 );
			const otherRange = Range.createFromParentsAndOffsets( p1, 1, p2, 0 );

			expect( range.isIntersecting( otherRange ) ).to.be.true;
			expect( otherRange.isIntersecting( range ) ).to.be.true;
		} );

		it( 'should return false if given range is fully before/after this range', () => {
			const range = Range.createFromParentsAndOffsets( t1, 0, t2, 3 );
			const otherRange = Range.createFromParentsAndOffsets( root, 1, t3, 0 );

			expect( range.isIntersecting( otherRange ) ).to.be.false;
			expect( otherRange.isIntersecting( range ) ).to.be.false;
		} );

		it( 'should return false if ranges are in different roots', () => {
			const range = Range.createFromParentsAndOffsets( t1, 0, t2, 3 );
			const otherRange = Range.createFromParentsAndOffsets( new Element( 'div' ), 1, t3, 0 );

			expect( range.isIntersecting( otherRange ) ).to.be.false;
			expect( otherRange.isIntersecting( range ) ).to.be.false;
		} );
	} );

	describe( 'createFromRange', () => {
		it( 'should create a new instance of Range that is equal to passed range', () => {
			const range = new Range( new Position( {}, 0 ), new Position( {}, 1 ) );
			const clone = Range.createFromRange( range );

			expect( clone ).not.to.be.equal( range ); // clone is not pointing to the same object as position
			expect( clone.isEqual( range ) ).to.be.true; // but they are equal in the position-sense
		} );
	} );
} );
