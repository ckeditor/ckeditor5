/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

const modules = bender.amd.require(
	'core/treemodel/range',
	'core/treemodel/position',
	'core/treemodel/element',
	'core/treemodel/character',
	'core/treemodel/document'
);

describe( 'Range', () => {
	let Range, Position, Element, Character, Document;

	before( () => {
		Position = modules[ 'core/treemodel/position' ];
		Range = modules[ 'core/treemodel/range' ];
		Element = modules[ 'core/treemodel/element' ];
		Character = modules[ 'core/treemodel/character' ];
		Document = modules[ 'core/treemodel/document' ];
	} );

	let range, start, end, root, otherRoot;

	beforeEach( () => {
		let doc = new Document();
		root = doc.createRoot( 'root' );
		otherRoot = doc.createRoot( 'otherRoot' );

		start = new Position( root, [ 1 ] );
		end = new Position( root, [ 2 ] );

		range = new Range( start, end );
	} );

	describe( 'constructor', () => {
		it( 'should create a range with given positions', () => {
			expect( range.start.isEqual( start ) ).to.be.true;
			expect( range.end.isEqual( end ) ).to.be.true;
		} );
	} );

	describe( 'root', () => {
		it( 'should be equal to start position root', () => {
			expect( range.root ).to.equal( start.root );
		} );
	} );

	describe( 'isCollapsed', () => {
		it( 'should be true if range start and end positions are equal', () => {
			let collapsedRange = new Range( start, start );
			expect( collapsedRange.isCollapsed ).to.be.true;
		} );

		it( 'should be false if range start and end positions are not equal', () => {
			expect( range.isCollapsed ).to.be.false;
		} );
	} );

	describe( 'isEqual', () => {
		it( 'should return true if the ranges are the same', () => {
			let sameStart = Position.createFromPosition( start );
			let sameEnd = Position.createFromPosition( end );

			let sameRange = new Range( sameStart, sameEnd );

			expect( range.isEqual( sameRange ) ).to.be.true;
		} );

		it( 'should return false if the start position is different', () => {
			let range = new Range( start, end );

			let diffStart = new Position( root, [ 0 ] );
			let sameEnd = Position.createFromPosition( end );

			let diffRange = new Range( diffStart, sameEnd );

			expect( range.isEqual( diffRange ) ).to.be.false;
		} );

		it( 'should return false if the end position is different', () => {
			let sameStart = new Position( root, [ 0 ] );
			let diffEnd = new Position( root, [ 0 ] );

			let diffRange = new Range( sameStart, diffEnd );

			expect( range.isEqual( diffRange ) ).to.be.false;
		} );

		it( 'should return false if ranges are in different roots', () => {
			let otherRootStart = new Position( otherRoot, start.path.slice() );
			let otherRootEnd = new Position( otherRoot, end.path.slice() );

			let otherRootRange = new Range( otherRootStart, otherRootEnd );

			expect( range.isEqual( otherRootRange ) ).to.be.false;
		} );
	} );

	describe( 'isIntersecting', () => {
		it( 'should return true if given range is equal', () => {
			let otherRange = Range.createFromRange( range );
			expect( range.isIntersecting( otherRange ) ).to.be.true;
		} );

		it( 'should return true if given range contains this range', () => {
			let otherRange = new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) );
			expect( range.isIntersecting( otherRange ) ).to.be.true;
		} );

		it( 'should return true if given range ends in this range', () => {
			let otherRange = new Range( new Position( root, [ 0 ] ), new Position( root, [ 1, 4 ] ) );
			expect( range.isIntersecting( otherRange ) ).to.be.true;
		} );

		it( 'should return true if given range starts in this range', () => {
			let otherRange = new Range( new Position( root, [ 1, 4 ] ), new Position( root, [ 3 ] ) );
			expect( range.isIntersecting( otherRange ) ).to.be.true;
		} );

		it( 'should return false if given range is fully before this range', () => {
			let otherRange = new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
			expect( range.isIntersecting( otherRange ) ).to.be.false;
		} );

		it( 'should return false if given range is fully after this range', () => {
			let otherRange = new Range( new Position( root, [ 2 ] ), new Position( root, [ 2, 0 ] ) );
			expect( range.isIntersecting( otherRange ) ).to.be.false;
		} );

		it( 'should return false if ranges are in different roots', () => {
			let otherRange = new Range( new Position( otherRoot, [ 0 ] ), new Position( otherRoot, [ 1, 4 ] ) );
			expect( range.isIntersecting( otherRange ) ).to.be.false;
		} );
	} );

	describe( 'static constructors', () => {
		let p, f, o, z;

		// root
		//  |- p
		//     |- f
		//     |- o
		//     |- z
		before( () => {
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

		describe( 'createFromPositionAndShift', () => {
			it( 'should make range from start position and offset', () => {
				const position = new Position( root, [ 1, 2, 3 ] );
				const range = Range.createFromPositionAndShift( position, 4 );

				expect( range ).to.be.instanceof( Range );
				expect( range.start.isEqual( position ) ).to.be.true;
				expect( range.end.root ).to.equal( range.start.root );
				expect( range.end.path ).to.deep.equal( [ 1, 2, 7 ] );
			} );
		} );

		describe( 'createFromRange', () => {
			it( 'should create a new instance of Range that is equal to passed range', () => {
				const clone = Range.createFromRange( range );

				expect( clone ).not.to.be.equal( range ); // clone is not pointing to the same object as position
				expect( clone.isEqual( range ) ).to.be.true; // but they are equal in the position-sense
			} );
		} );
	} );

	describe( 'getAllNodes', () => {
		it( 'should iterate over all nodes which "starts" in the range', () => {
			let nodes = [];

			const a = new Character( 'a' );
			const b = new Character( 'b' );
			const x = new Character( 'x' );
			const y = new Character( 'y' );

			const e1 = new Element( 'e1' );
			const e2 = new Element( 'e2' );

			e1.insertChildren( 0, [ a, b ] );
			e2.insertChildren( 0, [ x, y ] );
			root.insertChildren( 0, [ e1, e2 ] );

			let range = new Range(
				new Position( root, [ 0, 1 ] ),
				new Position( root, [ 1, 1 ] )
			);

			for ( let node of range.getAllNodes() ) {
				nodes.push( node );
			}

			expect( nodes ).to.deep.equal( [ b, e2, x ] );
		} );
	} );

	describe( 'containsPosition', () => {
		beforeEach( () => {
			range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 3 ] ) );
		} );

		it( 'should return false if position is before range', () => {
			const position = new Position( root, [ 0, 4 ] );

			expect( range.containsPosition( position ) ).to.be.false;
		} );

		it( 'should return false if position is after range', () => {
			const position = new Position( root, [ 3, 0 ] );

			expect( range.containsPosition( position ) ).to.be.false;
		} );

		it( 'should return true if position is inside range', () => {
			const position = new Position( root, [ 2, 2 ] );

			expect( range.containsPosition( position ) ).to.be.true;
		} );
	} );

	describe( 'getTransformedByInsertion', () => {
		it( 'should return an array of Range objects', () => {
			const range = new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
			const transformed = range.getTransformedByInsertion( new Position( root, [ 2 ] ), 2 );

			expect( transformed ).to.be.instanceof( Array );
			expect( transformed[ 0 ] ).to.be.instanceof( Range );
		} );

		it( 'should update it\'s positions offsets if insertion is before range and they are affected', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 4 ] ) );
			const transformed = range.getTransformedByInsertion( new Position( root, [ 3, 1 ] ), 2 );

			expect( transformed[ 0 ].start.offset ).to.equal( 4 );
			expect( transformed[ 0 ].end.offset ).to.equal( 6 );
		} );

		it( 'should update it\'s positions paths if insertion is before range and they are affected', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 4, 4 ] ) );
			const transformed = range.getTransformedByInsertion( new Position( root, [ 0 ] ), 2 );

			expect( transformed[ 0 ].start.path[ 0 ] ).to.equal( 5 );
			expect( transformed[ 0 ].end.path[ 0 ] ).to.equal( 6 );
		} );

		it( 'should return array with two ranges and updated positions if insertion was in the middle of range', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 5, 4 ] ) );
			const transformed = range.getTransformedByInsertion( new Position( root, [ 4, 1, 6 ] ), 4 );

			expect( transformed.length ).to.equal( 2 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 4, 1, 6 ] );

			expect( transformed[ 1 ].start.path ).to.deep.equal( [ 4, 1, 10 ] );
			expect( transformed[ 1 ].end.path ).to.deep.equal( [ 5, 4 ] );
		} );

		it( 'should not updated positions if insertion is after range', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 4, 4 ] ) );
			const transformed = range.getTransformedByInsertion( new Position( root, [ 4, 4 ] ), 3 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 4, 4 ] );
		} );
	} );

	describe( 'getDifference', () => {
		let range;

		beforeEach( () => {
			range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 5, 4 ] ) );
		} );

		it( 'should return an array of Range objects', () => {
			const otherRange = new Range( new Position( root, [ 6 ] ), new Position( root, [ 7 ] ) );
			const diff = range.getDifference( otherRange );

			expect( diff ).to.be.instanceof( Array );
			expect( diff[ 0 ] ).to.be.instanceof( Range );
		} );

		it( 'should return original range if other range does not intersect with it', () => {
			const otherRange = new Range( new Position( root, [ 6 ] ), new Position( root, [ 7 ] ) );
			const diff = range.getDifference( otherRange );

			expect( diff[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( diff[ 0 ].end.path ).to.deep.equal( [ 5, 4 ] );
		} );

		it( 'should return shrunken range if other range intersects with it', () => {
			const otherRange = new Range( new Position( root, [ 4, 1 ] ), new Position( root, [ 7 ] ) );
			const diff = range.getDifference( otherRange );

			expect( diff[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( diff[ 0 ].end.path ).to.deep.equal( [ 4, 1 ] );
		} );

		it( 'should return an empty array if other range contains or is same as the original range', () => {
			const otherRange = new Range( new Position( root, [ 2 ] ), new Position( root, [ 6 ] ) );
			const diff = range.getDifference( otherRange );

			expect( diff.length ).to.equal( 0 );
		} );

		it( 'should two ranges if other range is contained by the original range', () => {
			const otherRange = new Range( new Position( root, [ 3, 7 ] ), new Position( root, [ 4, 1 ] ) );
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
			range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 5, 4 ] ) );
		} );

		it( 'should return null if ranges do not intersect', () => {
			const otherRange = new Range( new Position( root, [ 5, 4 ] ), new Position( root, [ 7 ] ) );
			const common = range.getIntersection( otherRange );

			expect( common ).to.be.null;
		} );

		it( 'should return a range equal to the common part of ranges - original range contains the other range', () => {
			const otherRange = new Range( new Position( root, [ 4 ] ), new Position( root, [ 5 ] ) );
			const common = range.getIntersection( otherRange );

			expect( common.isEqual( otherRange ) ).to.be.true;
		} );

		it( 'should return a range equal to the common part of ranges - original range is contained by the other range', () => {
			const otherRange = new Range( new Position( root, [ 3 ] ), new Position( root, [ 6 ] ) );
			const common = range.getIntersection( otherRange );

			expect( common.isEqual( range ) ).to.be.true;
		} );

		it( 'should return a range equal to the common part of ranges - original range intersects with the other range', () => {
			const otherRange = new Range( new Position( root, [ 3 ] ), new Position( root, [ 4, 7 ] ) );
			const common = range.getIntersection( otherRange );

			expect( common.start.path ).to.deep.equal( [ 3, 2 ] );
			expect( common.end.path ).to.deep.equal( [ 4, 7 ] );
		} );
	} );

	describe( 'getMinimalFlatRanges', () => {
		beforeEach( () => {
			prepareRichRoot( root );
		} );

		it( 'should return empty array if range is collapsed', () => {
			let range = new Range( new Position( root, [ 1, 3 ] ), new Position( root, [ 1, 3 ] ) );
			let flat = range.getMinimalFlatRanges();

			expect( flat.length ).to.equal( 0 );
		} );

		it( 'should return empty array if range does not contain any node', () => {
			let range = new Range( new Position( root, [ 1, 3 ] ), new Position( root, [ 2, 0 ] ) );
			let flat = range.getMinimalFlatRanges();

			expect( flat.length ).to.equal( 0 );
		} );

		it( 'should return a minimal set of flat ranges that covers the range (start and end in different sub-trees)', () => {
			let range = new Range( new Position( root, [ 0, 0, 3 ] ), new Position( root, [ 3, 0, 2 ] ) );
			let flat = range.getMinimalFlatRanges();

			expect( flat.length ).to.equal( 4 );
			expect( flat[ 0 ].start.path ).to.deep.equal( [ 0, 0, 3 ] );
			expect( flat[ 0 ].end.path ).to.deep.equal( [ 0, 0, 5 ] );
			expect( flat[ 1 ].start.path ).to.deep.equal( [ 0, 1 ] );
			expect( flat[ 1 ].end.path ).to.deep.equal( [ 0, 2 ] );
			expect( flat[ 2 ].start.path ).to.deep.equal( [ 1 ] );
			expect( flat[ 2 ].end.path ).to.deep.equal( [ 3 ] );
			expect( flat[ 3 ].start.path ).to.deep.equal( [ 3, 0, 0 ] );
			expect( flat[ 3 ].end.path ).to.deep.equal( [ 3, 0, 2 ] );
		} );

		it( 'should return a minimal set of flat ranges that covers the range (start.path is prefix of end.path)', () => {
			let range = new Range( new Position( root, [ 0 ] ), new Position( root, [ 0, 1, 4 ] ) );
			let flat = range.getMinimalFlatRanges();

			expect( flat.length ).to.equal( 2 );
			expect( flat[ 0 ].start.path ).to.deep.equal( [ 0, 0 ] );
			expect( flat[ 0 ].end.path ).to.deep.equal( [ 0, 1 ] );
			expect( flat[ 1 ].start.path ).to.deep.equal( [ 0, 1, 0 ] );
			expect( flat[ 1 ].end.path ).to.deep.equal( [ 0, 1, 4 ] );
		} );
	} );

	describe( 'getTopLevelNodes', () => {
		beforeEach( () => {
			prepareRichRoot( root );
		} );

		it( 'should iterate over all top-level nodes of this range', () => {
			let range = new Range( new Position( root, [ 0, 0, 3 ] ), new Position( root, [ 3, 0, 2 ] ) );
			let nodes = Array.from( range.getTopLevelNodes() );
			let nodeNames = nodes.map( ( node ) => {
				return ( node instanceof Element ) ? 'E:' + node.name : 'C:' + node.character;
			} );

			expect( nodeNames ).to.deep.equal( [ 'C:s', 'C:t', 'E:p', 'E:p', 'E:p', 'C:s', 'C:e' ] );
		} );
	} );

	describe( 'isFlat', () => {
		beforeEach( () => {
			prepareRichRoot( root );
		} );

		it( 'should be true if start and end position are in the same parent', () => {
			let range = new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 2 ] ) );
			expect( range.isFlat ).to.be.true;
		} );

		it( 'should be false if start and end position are in different parents', () => {
			let range = new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 3, 0, 1 ] ) );
			expect( range.isFlat ).to.be.false;
		} );
	} );

	function prepareRichRoot() {
		root.insertChildren( 0, [
			new Element( 'div', [], [
				new Element( 'h', [], 'first' ),
				new Element( 'p', [], 'lorem ipsum' )
			] ),
			new Element( 'p', [], 'foo' ),
			new Element( 'p', [], 'bar' ),
			new Element( 'div', [], [
				new Element( 'h', [], 'second' ),
				new Element( 'p', [], 'lorem' )
			] )
		] );
	}
} );
