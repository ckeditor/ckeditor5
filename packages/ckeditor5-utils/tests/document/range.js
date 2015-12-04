/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

const modules = bender.amd.require(
	'document/range',
	'document/position',
	'document/element',
	'document/character',
	'document/document'
);

describe( 'Range', () => {
	let Range, Position, Element, Character, Document;
	let start, end, root;

	before( () => {
		Position = modules[ 'document/position' ];
		Range = modules[ 'document/range' ];
		Element = modules[ 'document/element' ];
		Character = modules[ 'document/character' ];
		Document = modules[ 'document/document' ];

		let doc = new Document();
		root = doc.createRoot( 'root' );

		start = new Position( [ 0 ], root );
		end = new Position( [ 1 ], root );
	} );

	let range;

	beforeEach( () => {
		range = new Range( start, end );
	} );

	describe( 'constructor', () => {
		it( 'should create a range with given positions', () => {
			expect( range ).to.have.property( 'start' ).that.equal( start );
			expect( range ).to.have.property( 'end' ).that.equal( end );
		} );
	} );

	describe( 'isEqual', () => {
		it( 'should return true if the ranges are the same', () => {
			let sameStart = new Position( [ 0 ], root );
			let sameEnd = new Position( [ 1 ], root );

			let sameRange = new Range( sameStart, sameEnd );

			expect( range.isEqual( sameRange ) ).to.be.true;
		} );

		it( 'should return false if the start position is different', () => {
			let range = new Range( start, end );

			let diffStart = new Position( [ 1 ], root );
			let sameEnd = new Position( [ 1 ], root );

			let diffRange = new Range( diffStart, sameEnd );

			expect( range.isEqual( diffRange ) ).to.not.be.true;
		} );

		it( 'should return false if the end position is different', () => {
			let sameStart = new Position( [ 0 ], root );
			let diffEnd = new Position( [ 0 ], root );

			let diffRange = new Range( sameStart, diffEnd );

			expect( range.isEqual( diffRange ) ).to.not.be.true;
		} );
	} );

	describe( 'static constructors', () => {
		let doc, root, p, f, o, z;

		// root
		//  |- p
		//     |- f
		//     |- o
		//     |- z
		before( () => {
			doc = new Document();

			root = doc.createRoot( 'root' );

			f = new Character( 'f' );
			o = new Character( 'o' );
			z = new Character( 'z' );

			p = new Element( 'p', [], [ f, o, z ] );

			root.insertChildren( 0, [ p ] );
		} );

		describe( 'createFromElement', () => {
			it( 'should return range', () => {
				const range = Range.createFromElement( p );

				expect( range.start.path ).to.deep.equal( [ 0, 0 ] );
				expect( range.end.path ).to.deep.equal( [ 0, 3 ] );
			} );
		} );

		describe( 'createFromParentsAndOffsets', () => {
			it( 'should return range', () => {
				const range = Range.createFromParentsAndOffsets( root, 0, p, 2 );

				expect( range.start.path ).to.deep.equal( [ 0 ] );
				expect( range.end.path ).to.deep.equal( [ 0, 2 ] );
			} );
		} );

		describe( 'createFromPositionAndOffset', () => {
			it( 'should make range from start position and offset', () => {
				const position = new Position( [ 1, 2, 3 ], root );
				const range = Range.createFromPositionAndOffset( position, 4 );

				expect( range ).to.be.instanceof( Range );
				expect( range.start.isEqual( position ) ).to.be.true;
				expect( range.end.root ).to.equal( range.start.root );
				expect( range.end.path ).to.deep.equal( [ 1, 2, 7 ] );
			} );
		} );
	} );

	describe( 'clone', () => {
		it( 'should return a new, equal position', () => {
			const clone = range.clone();

			expect( clone ).not.to.be.equal( range ); // clone is not pointing to the same object as position
			expect( clone.isEqual( range ) ).to.be.true; // but they are equal in the position-sense
		} );
	} );

	describe( 'containsPosition', () => {
		beforeEach( () => {
			range = new Range( new Position( [ 1 ], root ), new Position( [ 3 ], root ) );
		} );

		it( 'should return false if position is before range', () => {
			const position = new Position( [ 0, 4 ], root );

			expect( range.containsPosition( position ) ).to.be.false;
		} );

		it( 'should return false if position is after range', () => {
			const position = new Position( [ 3, 0 ], root );

			expect( range.containsPosition( position ) ).to.be.false;
		} );

		it( 'should return true if position is inside range', () => {
			const position = new Position( [ 2, 2 ], root );

			expect( range.containsPosition( position ) ).to.be.true;
		} );
	} );

	describe( 'getTransformedByInsertion', () => {
		it( 'should return an array of Range objects', () => {
			const range = new Range( new Position( [ 0 ], root ), new Position( [ 1 ], root ) );
			const transformed = range.getTransformedByInsertion( new Position( [ 2 ], root ), 2 );

			expect( transformed ).to.be.instanceof( Array );
			expect( transformed[ 0 ] ).to.be.instanceof( Range );
		} );

		it( 'should update it\'s positions offsets if insertion is before range and they are affected', () => {
			const range = new Range( new Position( [ 3, 2 ], root ), new Position( [ 3, 4 ], root ) );
			const transformed = range.getTransformedByInsertion( new Position( [ 3, 1 ], root ), 2 );

			expect( transformed[ 0 ].start.offset ).to.equal( 4 );
			expect( transformed[ 0 ].end.offset ).to.equal( 6 );
		} );

		it( 'should update it\'s positions paths if insertion is before range and they are affected', () => {
			const range = new Range( new Position( [ 3, 2 ], root ), new Position( [ 4, 4 ], root ) );
			const transformed = range.getTransformedByInsertion( new Position( [ 0 ], root ), 2 );

			expect( transformed[ 0 ].start.path[ 0 ] ).to.equal( 5 );
			expect( transformed[ 0 ].end.path[ 0 ] ).to.equal( 6 );
		} );

		it( 'should return array with two ranges and updated positions if insertion was in the middle of range', () => {
			const range = new Range( new Position( [ 3, 2 ], root ), new Position( [ 5, 4 ], root ) );
			const transformed = range.getTransformedByInsertion( new Position( [ 4, 1, 6 ], root ), 4 );

			expect( transformed.length ).to.equal( 2 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 4, 1, 6 ] );

			expect( transformed[ 1 ].start.path ).to.deep.equal( [ 4, 1, 10 ] );
			expect( transformed[ 1 ].end.path ).to.deep.equal( [ 5, 4 ] );
		} );

		it( 'should not updated positions if insertion is after range', () => {
			const range = new Range( new Position( [ 3, 2 ], root ), new Position( [ 4, 4 ], root ) );
			const transformed = range.getTransformedByInsertion( new Position( [ 4, 4 ], root ), 3 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 4, 4 ] );
		} );
	} );

	describe( 'getDifference', () => {
		let range;

		beforeEach( () => {
			range = new Range( new Position( [ 3, 2 ], root ), new Position( [ 5, 4 ], root ) );
		} );

		it( 'should return an array of Range objects', () => {
			const otherRange = new Range( new Position( [ 6 ], root ), new Position( [ 7 ], root ) );
			const diff = range.getDifference( otherRange );

			expect( diff ).to.be.instanceof( Array );
			expect( diff[ 0 ] ).to.be.instanceof( Range );
		} );

		it( 'should return original range if other range does not intersect with it', () => {
			const otherRange = new Range( new Position( [ 6 ], root ), new Position( [ 7 ], root ) );
			const diff = range.getDifference( otherRange );

			expect( diff[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( diff[ 0 ].end.path ).to.deep.equal( [ 5, 4 ] );
		} );

		it( 'should return shrunken range if other range intersects with it', () => {
			const otherRange = new Range( new Position( [ 4, 1 ], root ), new Position( [ 7 ], root ) );
			const diff = range.getDifference( otherRange );

			expect( diff[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( diff[ 0 ].end.path ).to.deep.equal( [ 4, 1 ] );
		} );

		it( 'should return an empty array if other range contains or is same as the original range', () => {
			const otherRange = new Range( new Position( [ 2 ], root ), new Position( [ 6 ], root ) );
			const diff = range.getDifference( otherRange );

			expect( diff.length ).to.equal( 0 );
		} );

		it( 'should two ranges if other range is contained by the original range', () => {
			const otherRange = new Range( new Position( [ 3, 7 ], root ), new Position( [ 4, 1 ], root ) );
			const diff = range.getDifference( otherRange );

			expect( diff.length ).to.equal( 2 );

			expect( diff[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( diff[ 0 ].end.path ).to.deep.equal( [ 3, 7 ] );

			expect( diff[ 1 ].start.path ).to.deep.equal( [ 4, 1 ] );
			expect( diff[ 1 ].end.path ).to.deep.equal( [ 5, 4 ] );
		} );
	} );

	describe( 'getIntersection', () => {
		let range;

		beforeEach( () => {
			range = new Range( new Position( [ 3, 2 ], root ), new Position( [ 5, 4 ], root ) );
		} );

		it( 'should return null if ranges do not intersect', () => {
			const otherRange = new Range( new Position( [ 5, 4 ], root ), new Position( [ 7 ], root ) );
			const common = range.getIntersection( otherRange );

			expect( common ).to.be.null;
		} );

		it( 'should return a range equal to the common part of ranges - original range contains the other range', () => {
			const otherRange = new Range( new Position( [ 4 ], root ), new Position( [ 5 ], root ) );
			const common = range.getIntersection( otherRange );

			expect( common.isEqual( otherRange ) ).to.be.true;
		} );

		it( 'should return a range equal to the common part of ranges - original range is contained by the other range', () => {
			const otherRange = new Range( new Position( [ 3 ], root ), new Position( [ 6 ], root ) );
			const common = range.getIntersection( otherRange );

			expect( common.isEqual( range ) ).to.be.true;
		} );

		it( 'should return a range equal to the common part of ranges - original range intersects with the other range', () => {
			const otherRange = new Range( new Position( [ 3 ], root ), new Position( [ 4, 7 ], root ) );
			const common = range.getIntersection( otherRange );

			expect( common.start.path ).to.deep.equal( [ 3, 2 ] );
			expect( common.end.path ).to.deep.equal( [ 4, 7 ] );
		} );
	} );
} );
