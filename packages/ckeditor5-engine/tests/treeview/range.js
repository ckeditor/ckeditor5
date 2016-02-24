/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Range from '/ckeditor5/core/treeview/range.js';
import Position from '/ckeditor5/core/treeview/position.js';

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
} );
