/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

const modules = bender.amd.require(
	'document/range',
	'document/position'
);

describe( 'Range', function() {
	let Range, Position, start, end;

	before( function() {
		Position = modules[ 'document/position' ];
		Range = modules[ 'document/range' ];

		start = new Position( [ 0 ] );
		end = new Position( [ 1 ] );
	} );

	let range;

	beforeEach( function() {
		range = new Range( start, end );
	} );

	describe( 'constructor', function() {
		it( 'should create a range with given positions', function() {
			expect( range ).to.have.property( 'start' ).that.equal( start );
			expect( range ).to.have.property( 'end' ).that.equal( end );
		} );
	} );

	describe( 'isEqual', function() {
		it( 'should return true if the ranges are the same', function() {
			let sameStart = new Position( [ 0 ] );
			let sameEnd = new Position( [ 1 ] );

			let sameRange = new Range( sameStart, sameEnd );

			expect( range.isEqual( sameRange ) ).to.be.true;
		} );

		it( 'should return false if the start position is different', function() {
			let range = new Range( start, end );

			let diffStart = new Position( [ 1 ] );
			let sameEnd = new Position( [ 1 ] );

			let diffRange = new Range( diffStart, sameEnd );

			expect( range.isEqual( diffRange ) ).to.not.be.true;
		} );

		it( 'should return false if the end position is different', function() {
			let sameStart = new Position( [ 0 ] );
			let diffEnd = new Position( [ 0 ] );

			let diffRange = new Range( sameStart, diffEnd );

			expect( range.isEqual( diffRange ) ).to.not.be.true;
		} );
	} );
} );
