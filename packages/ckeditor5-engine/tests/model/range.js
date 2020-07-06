/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Range from '../../src/model/range';
import Position from '../../src/model/position';
import Element from '../../src/model/element';
import Text from '../../src/model/text';
import Model from '../../src/model/model';
import TreeWalker from '../../src/model/treewalker';
import MarkerOperation from '../../src/model/operation/markeroperation';
import AttributeOperation from '../../src/model/operation/attributeoperation';
import InsertOperation from '../../src/model/operation/insertoperation';
import MoveOperation from '../../src/model/operation/moveoperation';
import RenameOperation from '../../src/model/operation/renameoperation';
import MergeOperation from '../../src/model/operation/mergeoperation';
import SplitOperation from '../../src/model/operation/splitoperation';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'Range', () => {
	let doc, range, start, end, root, otherRoot, gy, model;

	beforeEach( () => {
		model = new Model();

		doc = model.document;
		root = doc.createRoot();
		otherRoot = doc.createRoot( '$root', 'otherRoot' );
		gy = doc.graveyard;

		start = new Position( root, [ 1 ] );
		end = new Position( root, [ 2 ] );

		range = new Range( start, end );
	} );

	describe( 'constructor()', () => {
		it( 'should create a range with given positions', () => {
			expect( range.start.isEqual( start ) ).to.be.true;
			expect( range.end.isEqual( end ) ).to.be.true;
		} );

		it( 'should create collapsed range', () => {
			const collapsed = new Range( start );

			expect( collapsed.start.isEqual( start ) ).to.be.true;
			expect( collapsed.isCollapsed ).to.be.true;
		} );
	} );

	describe( 'is()', () => {
		it( 'should return true for "range"', () => {
			expect( range.is( 'range' ) ).to.be.true;
			expect( range.is( 'model:range' ) ).to.be.true;
		} );

		it( 'should return false for incorrect values', () => {
			expect( range.is( 'model' ) ).to.be.false;
			expect( range.is( 'model:node' ) ).to.be.false;
			expect( range.is( 'text' ) ).to.be.false;
			expect( range.is( 'element', 'paragraph' ) ).to.be.false;
		} );
	} );

	describe( 'root', () => {
		it( 'should be equal to start position root', () => {
			expect( range.root ).to.equal( start.root );
		} );
	} );

	describe( 'isCollapsed', () => {
		it( 'should be true if range start and end positions are equal', () => {
			const collapsedRange = new Range( start, start );
			expect( collapsedRange.isCollapsed ).to.be.true;
		} );

		it( 'should be false if range start and end positions are not equal', () => {
			expect( range.isCollapsed ).to.be.false;
		} );
	} );

	describe( 'isEqual()', () => {
		it( 'should return true if the ranges are the same', () => {
			const sameStart = Position._createAt( start );
			const sameEnd = Position._createAt( end );

			const sameRange = new Range( sameStart, sameEnd );

			expect( range.isEqual( sameRange ) ).to.be.true;
		} );

		it( 'should return false if the start position is different', () => {
			const range = new Range( start, end );

			const diffStart = new Position( root, [ 0 ] );
			const sameEnd = Position._createAt( end );

			const diffRange = new Range( diffStart, sameEnd );

			expect( range.isEqual( diffRange ) ).to.be.false;
		} );

		it( 'should return false if the end position is different', () => {
			const sameStart = new Position( root, [ 0 ] );
			const diffEnd = new Position( root, [ 0 ] );

			const diffRange = new Range( sameStart, diffEnd );

			expect( range.isEqual( diffRange ) ).to.be.false;
		} );

		it( 'should return false if ranges are in different roots', () => {
			const otherRootStart = new Position( otherRoot, start.path.slice() );
			const otherRootEnd = new Position( otherRoot, end.path.slice() );

			const otherRootRange = new Range( otherRootStart, otherRootEnd );

			expect( range.isEqual( otherRootRange ) ).to.be.false;
		} );
	} );

	describe( 'isIntersecting()', () => {
		it( 'should return true if given range is equal', () => {
			const otherRange = range.clone();
			expect( range.isIntersecting( otherRange ) ).to.be.true;
		} );

		it( 'should return true if given range contains this range', () => {
			const otherRange = new Range( new Position( root, [ 0 ] ), new Position( root, [ 3 ] ) );
			expect( range.isIntersecting( otherRange ) ).to.be.true;
		} );

		it( 'should return true if given range ends in this range', () => {
			const otherRange = new Range( new Position( root, [ 0 ] ), new Position( root, [ 1, 4 ] ) );
			expect( range.isIntersecting( otherRange ) ).to.be.true;
		} );

		it( 'should return true if given range starts in this range', () => {
			const otherRange = new Range( new Position( root, [ 1, 4 ] ), new Position( root, [ 3 ] ) );
			expect( range.isIntersecting( otherRange ) ).to.be.true;
		} );

		it( 'should return false if given range is fully before this range', () => {
			const otherRange = new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
			expect( range.isIntersecting( otherRange ) ).to.be.false;
		} );

		it( 'should return false if given range is fully after this range', () => {
			const otherRange = new Range( new Position( root, [ 2 ] ), new Position( root, [ 2, 0 ] ) );
			expect( range.isIntersecting( otherRange ) ).to.be.false;
		} );

		it( 'should return false if ranges are in different roots', () => {
			const otherRange = new Range( new Position( otherRoot, [ 0 ] ), new Position( otherRoot, [ 1, 4 ] ) );
			expect( range.isIntersecting( otherRange ) ).to.be.false;
		} );

		it( 'should return false if ranges are collapsed and equal', () => {
			range = new Range( new Position( root, [ 1, 1 ] ) );
			const otherRange = new Range( new Position( otherRoot, [ 1, 1 ] ) );

			expect( range.isIntersecting( otherRange ) ).to.be.false;
		} );
	} );

	describe( 'static constructors', () => {
		let p;

		// root
		//  |- p
		//     |- foz
		beforeEach( () => {
			p = new Element( 'p', [], new Text( 'foz' ) );

			root._insertChild( 0, [ p ] );
		} );

		describe( '_createIn()', () => {
			it( 'should return range', () => {
				const range = Range._createIn( p );

				expect( range.start.path ).to.deep.equal( [ 0, 0 ] );
				expect( range.end.path ).to.deep.equal( [ 0, 3 ] );
			} );
		} );

		describe( '_createOn()', () => {
			it( 'should return range', () => {
				const range = Range._createOn( p );

				expect( range.start.path ).to.deep.equal( [ 0 ] );
				expect( range.end.path ).to.deep.equal( [ 1 ] );
			} );
		} );

		describe( '_createFromPositionAndShift()', () => {
			it( 'should make range from start position and offset', () => {
				const position = new Position( root, [ 1, 2, 3 ] );
				const range = Range._createFromPositionAndShift( position, 4 );

				expect( range ).to.be.instanceof( Range );
				expect( range.start.isEqual( position ) ).to.be.true;
				expect( range.end.root ).to.equal( range.start.root );
				expect( range.end.path ).to.deep.equal( [ 1, 2, 7 ] );
			} );
		} );

		describe( 'clone()', () => {
			it( 'should create a new instance of Range that is equal to passed range', () => {
				const clone = range.clone();

				expect( clone ).not.to.equal( range ); // clone is not pointing to the same object as position
				expect( clone.isEqual( range ) ).to.be.true; // but they are equal in the position-sense
			} );
		} );

		describe( '_createFromRanges()', () => {
			function makeRanges( root, ...points ) {
				const ranges = [];

				for ( let i = 0; i < points.length; i += 2 ) {
					ranges.push( new Range( Position._createAt( root, points[ i ] ), Position._createAt( root, points[ i + 1 ] ) ) );
				}

				return ranges;
			}

			beforeEach( () => {
				root._appendChild( new Text( 'abcdefghijklmnopqrtuvwxyz' ) );
			} );

			it( 'should throw if empty array is passed', () => {
				expectToThrowCKEditorError( () => {
					Range._createFromRanges( [] );
				}, /^range-create-from-ranges-empty-array/ );
			} );

			it( 'should return a copy of the range if only one range was passed', () => {
				const original = new Range( Position._createAt( root, 2 ), Position._createAt( root, 3 ) );
				const range = Range._createFromRanges( [ original ] );

				expect( range.isEqual( original ) ).to.be.true;
				expect( range ).not.to.equal( original );
			} );

			it( 'should combine ranges with reference range', () => {
				const range = Range._createFromRanges( makeRanges( root, 3, 7, 2, 3, 7, 9, 11, 14, 0, 1 ) );

				expect( range.start.offset ).to.equal( 2 );
				expect( range.end.offset ).to.equal( 9 );
			} );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over the range returning tree walker values', () => {
			prepareRichRoot( root );

			const range = new Range( new Position( root, [ 0, 0, 3 ] ), new Position( root, [ 3, 0, 2 ] ) );
			const nodes = Array.from( range ).map( value => value.item );
			const lengths = Array.from( range ).map( value => value.length );
			const nodeNames = mapNodesToNames( nodes );

			expect( nodeNames ).to.deep.equal(
				[ 'T:st', 'E:p', 'T:lorem ipsum', 'E:p', 'T:foo', 'E:p', 'T:bar', 'E:div', 'E:h', 'T:se' ] );
			expect( lengths ).to.deep.equal( [ 2, 1, 11, 1, 3, 1, 3, 1, 1, 2 ] );
		} );
	} );

	describe( 'getWalker()', () => {
		it( 'should be possible to iterate using this method', () => {
			prepareRichRoot( root );

			const range = new Range( new Position( root, [ 0, 0, 3 ] ), new Position( root, [ 3, 0, 2 ] ) );
			const items = [];
			const walker = range.getWalker();

			for ( const value of walker ) {
				items.push( value.item );
			}

			expect( mapNodesToNames( items ) ).to.deep.equal(
				[ 'T:st', 'E:h', 'E:p', 'T:lorem ipsum', 'E:p', 'E:div', 'E:p',
					'T:foo', 'E:p', 'E:p', 'T:bar', 'E:p', 'E:div', 'E:h', 'T:se' ] );
		} );

		it( 'should return treewalker with given options', () => {
			prepareRichRoot( root );

			const range = new Range( new Position( root, [ 0, 0, 3 ] ), new Position( root, [ 3, 0, 2 ] ) );
			const walker = range.getWalker( { singleCharacters: true } );

			expect( walker ).to.be.instanceof( TreeWalker );
			expect( walker ).to.have.property( 'singleCharacters' ).that.is.true;
			expect( walker ).to.have.property( 'boundaries' ).that.equals( range );
			expect( walker ).to.have.property( 'shallow' ).that.is.false;
		} );
	} );

	describe( 'getItems()', () => {
		it( 'should iterate over all items in the range', () => {
			prepareRichRoot( root );

			const range = new Range( new Position( root, [ 0, 0, 3 ] ), new Position( root, [ 3, 0, 2 ] ) );
			const items = Array.from( range.getItems() );
			const nodeNames = mapNodesToNames( items );

			expect( nodeNames ).to.deep.equal(
				[ 'T:st', 'E:p', 'T:lorem ipsum', 'E:p', 'T:foo', 'E:p', 'T:bar', 'E:div', 'E:h', 'T:se' ] );
		} );

		it( 'should iterate over all items in the range as single characters', () => {
			const a = new Text( 'a' );
			const b = new Text( 'b' );
			const x = new Text( 'x' );
			const y = new Text( 'y' );

			const e1 = new Element( 'e1' );
			const e2 = new Element( 'e2' );

			e1._insertChild( 0, [ a, b ] );
			e2._insertChild( 0, [ x, y ] );
			root._insertChild( 0, [ e1, e2 ] );

			const range = new Range(
				new Position( root, [ 0, 1 ] ),
				new Position( root, [ 1, 1 ] )
			);

			const items = Array.from( range.getItems( { singleCharacters: true } ) );

			expect( items.length ).to.equal( 3 );
			expect( items[ 0 ].data ).to.equal( 'b' );
			expect( items[ 1 ] ).to.equal( e2 );
			expect( items[ 2 ].data ).to.equal( 'x' );
		} );
	} );

	describe( 'getPositions()', () => {
		beforeEach( () => {
			prepareRichRoot( root );
		} );

		it( 'should iterate over all positions in this range', () => {
			const expectedPaths = [
				[ 1, 2 ], [ 1, 3 ],
				[ 2 ], [ 2, 0 ], [ 2, 3 ],
				[ 3 ], [ 3, 0 ], [ 3, 0, 0 ], [ 3, 0, 2 ]
			];
			const range = new Range( new Position( root, [ 1, 2 ] ), new Position( root, [ 3, 0, 2 ] ) );
			let i = 0;

			for ( const position of range.getPositions() ) {
				expect( position.path ).to.deep.equal( expectedPaths[ i ] );
				i++;
			}

			expect( i ).to.equal( expectedPaths.length );
		} );

		it( 'should return single nodes iterating over all positions in this range', () => {
			const expectedPaths = [
				[ 1, 2 ], [ 1, 3 ],
				[ 2 ], [ 2, 0 ], [ 2, 1 ], [ 2, 2 ], [ 2, 3 ],
				[ 3 ], [ 3, 0 ], [ 3, 0, 0 ], [ 3, 0, 1 ], [ 3, 0, 2 ]
			];
			const range = new Range( new Position( root, [ 1, 2 ] ), new Position( root, [ 3, 0, 2 ] ) );
			let i = 0;

			for ( const position of range.getPositions( { singleCharacters: true } ) ) {
				expect( position.path ).to.deep.equal( expectedPaths[ i ] );
				i++;
			}

			expect( i ).to.equal( expectedPaths.length );
		} );
	} );

	describe( 'containsPosition()', () => {
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

	describe( 'containsRange()', () => {
		beforeEach( () => {
			range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 3 ] ) );
		} );

		it( 'should return true if ranges are equal and check is not strict', () => {
			const otherRange = range.clone();

			expect( range.containsRange( otherRange, true ) ).to.be.true;
		} );

		it( 'should return true if ranges start at the same position and check is not strict', () => {
			const otherRange = new Range( range.start, new Position( root, [ 2 ] ) );

			expect( range.containsRange( otherRange, true ) ).to.be.true;
		} );

		it( 'should return true if ranges end at the same position and check is not strict', () => {
			const otherRange = new Range( new Position( root, [ 2 ] ), range.end );

			expect( range.containsRange( otherRange, true ) ).to.be.true;
		} );

		it( 'should return false if given range is collapsed and starts or ends at another range boundary', () => {
			expect( range.containsRange( new Range( range.start, range.start ) ) ).to.be.false;
			expect( range.containsRange( new Range( range.end, range.end ) ) ).to.be.false;

			// Collapsed range should always be checked in strict mode.
			expect( range.containsRange( new Range( range.start, range.start ), true ) ).to.be.false;
			expect( range.containsRange( new Range( range.end, range.end ), true ) ).to.be.false;
		} );
	} );

	describe( 'containsItem()', () => {
		let a, b, c, d, xxx;

		beforeEach( () => {
			a = new Element( 'a' );
			b = new Element( 'b' );
			c = new Element( 'c' );
			d = new Element( 'd' );

			xxx = new Text( 'xxx' );
			b._appendChild( xxx );

			root._appendChild( [ a, b, c, d ] );
		} );

		it( 'should return true if element is inside range and false when it is not inside range', () => {
			const range = new Range( Position._createAt( root, 1 ), Position._createAt( root, 3 ) ); // Range over `b` and `c`.

			expect( range.containsItem( a ) ).to.be.false;
			expect( range.containsItem( b ) ).to.be.true;
			expect( range.containsItem( xxx ) ).to.be.true;
			expect( range.containsItem( c ) ).to.be.true;
			expect( range.containsItem( d ) ).to.be.false;
		} );
	} );

	describe( '_getTransformedByInsertion()', () => {
		it( 'should return an array of Range objects', () => {
			const range = new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
			const transformed = range._getTransformedByInsertion( new Position( root, [ 2 ] ), 2 );

			expect( transformed ).to.be.instanceof( Array );
			expect( transformed[ 0 ] ).to.be.instanceof( Range );
		} );

		it( 'should update it\'s positions offsets if insertion is before range and they are affected', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 4 ] ) );
			const transformed = range._getTransformedByInsertion( new Position( root, [ 3, 1 ] ), 2 );

			expect( transformed[ 0 ].start.offset ).to.equal( 4 );
			expect( transformed[ 0 ].end.offset ).to.equal( 6 );
		} );

		it( 'should update it\'s positions paths if insertion is before range and they are affected', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 4, 4 ] ) );
			const transformed = range._getTransformedByInsertion( new Position( root, [ 0 ] ), 2 );

			expect( transformed[ 0 ].start.path[ 0 ] ).to.equal( 5 );
			expect( transformed[ 0 ].end.path[ 0 ] ).to.equal( 6 );
		} );

		it( 'should expand range if insertion was in the middle of range', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 5, 4 ] ) );
			const transformed = range._getTransformedByInsertion( new Position( root, [ 5, 0 ] ), 4 );

			expect( transformed.length ).to.equal( 1 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 5, 8 ] );
		} );

		it( 'should return array with two ranges if insertion was in the middle of range and spread flag was set', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 5, 4 ] ) );
			const transformed = range._getTransformedByInsertion( new Position( root, [ 4, 1, 6 ] ), 4, true );

			expect( transformed.length ).to.equal( 2 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 4, 1, 6 ] );

			expect( transformed[ 1 ].start.path ).to.deep.equal( [ 4, 1, 10 ] );
			expect( transformed[ 1 ].end.path ).to.deep.equal( [ 5, 4 ] );
		} );

		it( 'should not expand range if insertion is equal to start boundary of the range', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 8 ] ) );
			const transformed = range._getTransformedByInsertion( new Position( root, [ 3, 2 ] ), 3 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 5 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 3, 11 ] );
		} );

		it( 'should not update positions if insertion is before range (but not equal to the start boundary)', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 8 ] ) );
			const transformed = range._getTransformedByInsertion( new Position( root, [ 3, 1 ] ), 3 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 5 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 3, 11 ] );
		} );

		it( 'should not expand range if insertion is equal to end boundary of the range', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 4, 4 ] ) );
			const transformed = range._getTransformedByInsertion( new Position( root, [ 4, 4 ] ), 3 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 4, 4 ] );
		} );

		it( 'should not update positions if insertion is after range (but not equal to the end boundary)', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 4, 4 ] ) );
			const transformed = range._getTransformedByInsertion( new Position( root, [ 4, 5 ] ), 3 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 4, 4 ] );
		} );
	} );

	describe( '_getTransformedByMove()', () => {
		it( 'should return an array of Range objects', () => {
			const range = new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );
			const transformed = range._getTransformedByMove( new Position( root, [ 2 ] ), new Position( root, [ 5 ] ), 2 );

			expect( transformed ).to.be.instanceof( Array );
			expect( transformed[ 0 ] ).to.be.instanceof( Range );
		} );

		it( 'should update it\'s positions offsets if target is before range and they are affected', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 4 ] ) );
			const transformed = range._getTransformedByMove( new Position( root, [ 8, 1 ] ), new Position( root, [ 3, 1 ] ), 2 );

			expect( transformed[ 0 ].start.offset ).to.equal( 4 );
			expect( transformed[ 0 ].end.offset ).to.equal( 6 );
		} );

		it( 'should update it\'s positions paths if target is before range and they are affected', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 4, 4 ] ) );
			const transformed = range._getTransformedByMove( new Position( root, [ 8 ] ), new Position( root, [ 0 ] ), 2 );

			expect( transformed[ 0 ].start.path[ 0 ] ).to.equal( 5 );
			expect( transformed[ 0 ].end.path[ 0 ] ).to.equal( 6 );
		} );

		it( 'should expand range if target was in the middle of range', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 5, 4 ] ) );
			const transformed = range._getTransformedByMove( new Position( root, [ 8 ] ), new Position( root, [ 5, 0 ] ), 4 );

			expect( transformed.length ).to.equal( 1 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 5, 8 ] );
		} );

		it( 'should not expand range if insertion is equal to start boundary of the range', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 8 ] ) );
			const transformed = range._getTransformedByMove( new Position( root, [ 8, 2 ] ), new Position( root, [ 3, 2 ] ), 3 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 5 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 3, 11 ] );
		} );

		it( 'should not expand range if insertion is equal to end boundary of the range', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 4, 4 ] ) );
			const transformed = range._getTransformedByMove( new Position( root, [ 8, 4 ] ), new Position( root, [ 4, 4 ] ), 3 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 4, 4 ] );
		} );

		it( 'should update it\'s positions offsets if source is before range and they are affected', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 4 ] ) );
			const transformed = range._getTransformedByMove( new Position( root, [ 3, 0 ] ), new Position( root, [ 8, 1 ] ), 2 );

			expect( transformed[ 0 ].start.offset ).to.equal( 0 );
			expect( transformed[ 0 ].end.offset ).to.equal( 2 );
		} );

		it( 'should update it\'s positions paths if source is before range and they are affected', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 4, 4 ] ) );
			const transformed = range._getTransformedByMove( new Position( root, [ 0 ] ), new Position( root, [ 8 ] ), 2 );

			expect( transformed[ 0 ].start.path[ 0 ] ).to.equal( 1 );
			expect( transformed[ 0 ].end.path[ 0 ] ).to.equal( 2 );
		} );

		it( 'should shrink range if source was in the middle of range', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 5, 4 ] ) );
			const transformed = range._getTransformedByMove( new Position( root, [ 5, 0 ] ), new Position( root, [ 8 ] ), 4 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 5, 0 ] );
		} );

		it( 'should shrink range if source contained range start position', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 5, 4 ] ) );
			const transformed = range._getTransformedByMove( new Position( root, [ 3, 1 ] ), new Position( root, [ 8 ] ), 2 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 1 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 5, 4 ] );
		} );

		it( 'should shrink range if source contained range end position', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 5, 4 ] ) );
			const transformed = range._getTransformedByMove( new Position( root, [ 5, 3 ] ), new Position( root, [ 8 ] ), 2 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 5, 3 ] );
		} );

		it( 'should move range if it was contained in moved range', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 7 ] ) );
			const transformed = range._getTransformedByMove( new Position( root, [ 3 ] ), new Position( root, [ 6 ] ), 2 );

			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 4, 2 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 4, 7 ] );
		} );

		it( 'should not stick to moved range, if the transformed range is collapsed #1', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 2 ] ) );
			const transformed = range._getTransformedByMove( new Position( root, [ 3, 0 ] ), new Position( root, [ 6 ] ), 2 );

			expect( transformed.length ).to.equal( 1 );
			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 0 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 3, 0 ] );
		} );

		it( 'should not stick to moved range, if the transformed range is collapsed #2', () => {
			const range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 2 ] ) );
			const transformed = range._getTransformedByMove( new Position( root, [ 3, 2 ] ), new Position( root, [ 6 ] ), 2 );

			expect( transformed.length ).to.equal( 1 );
			expect( transformed[ 0 ].start.path ).to.deep.equal( [ 3, 2 ] );
			expect( transformed[ 0 ].end.path ).to.deep.equal( [ 3, 2 ] );
		} );
	} );

	describe( '_getTransformedByDeletion()', () => {
		it( 'should return a transformed range', () => {
			const range = new Range( new Position( root, [ 3 ] ), new Position( root, [ 5 ] ) );
			const transformed = range._getTransformedByDeletion( new Position( root, [ 1 ] ), 1 );

			expect( transformed.start.offset ).to.equal( 2 );
			expect( transformed.end.offset ).to.equal( 4 );
		} );

		it( 'should shrink the range if removed range was intersecting #1', () => {
			const range = new Range( new Position( root, [ 3 ] ), new Position( root, [ 5 ] ) );
			const transformed = range._getTransformedByDeletion( new Position( root, [ 2 ] ), 2 );

			expect( transformed.start.offset ).to.equal( 2 );
			expect( transformed.end.offset ).to.equal( 3 );
		} );

		it( 'should shrink the range if removed range was intersecting #2', () => {
			const range = new Range( new Position( root, [ 3 ] ), new Position( root, [ 5 ] ) );
			const transformed = range._getTransformedByDeletion( new Position( root, [ 4 ] ), 2 );

			expect( transformed.start.offset ).to.equal( 3 );
			expect( transformed.end.offset ).to.equal( 4 );
		} );

		it( 'should return null if the transformed range was contained in the removed range', () => {
			const range = new Range( new Position( root, [ 3 ] ), new Position( root, [ 5 ] ) );
			const transformed = range._getTransformedByDeletion( new Position( root, [ 2 ] ), 7 );

			expect( transformed ).to.be.null;
		} );
	} );

	describe( 'getDifference()', () => {
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

	describe( 'getIntersection()', () => {
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

		it( 'should return a range equal to both ranges if both ranges are equal', () => {
			const otherRange = range.clone();
			const common = range.getIntersection( otherRange );

			expect( common.isEqual( range ) ).to.be.true;
		} );
	} );

	describe( 'getJoined()', () => {
		let range;

		beforeEach( () => {
			range = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 5, 4 ] ) );
		} );

		it( 'should return a range spanning both of the ranges - original range contains the other range', () => {
			const otherRange = new Range( new Position( root, [ 4 ] ), new Position( root, [ 5 ] ) );
			const sum = range.getJoined( otherRange );

			expect( sum.isEqual( range ) ).to.be.true;
		} );

		it( 'should return a range spanning both of the ranges - original range is contained by the other range', () => {
			const otherRange = new Range( new Position( root, [ 3 ] ), new Position( root, [ 6 ] ) );
			const sum = range.getJoined( otherRange );

			expect( sum.isEqual( otherRange ) ).to.be.true;
		} );

		it( 'should return a range spanning both of the ranges - original range intersects with the other range', () => {
			const otherRange = new Range( new Position( root, [ 3 ] ), new Position( root, [ 4, 7 ] ) );
			const sum = range.getJoined( otherRange );

			expect( sum.start.path ).to.deep.equal( [ 3 ] );
			expect( sum.end.path ).to.deep.equal( [ 5, 4 ] );
		} );

		it( 'should return a range spanning both of the ranges if both ranges are equal', () => {
			const otherRange = range.clone();
			const sum = range.getJoined( otherRange );

			expect( sum.isEqual( range ) ).to.be.true;
		} );

		describe( 'with ranges "touching"', () => {
			beforeEach( () => {
				prepareRichRoot( root );
			} );

			it( 'should return null if ranges are not intersecting nor touching', () => {
				const range = new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 3 ] ) );
				const otherRange = new Range( new Position( root, [ 3, 1 ] ), new Position( root, [ 3, 2 ] ) );
				const sum = range.getJoined( otherRange );

				expect( sum ).to.be.null;
			} );

			it( 'should return a range spanning both of the ranges - original range end is equal to other range start position', () => {
				const range = new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 3 ] ) );
				const otherRange = new Range( new Position( root, [ 3 ] ), new Position( root, [ 3, 2 ] ) );
				const sum = range.getJoined( otherRange );

				expect( sum.start.path ).to.deep.equal( [ 0, 1 ] );
				expect( sum.end.path ).to.deep.equal( [ 3, 2 ] );
			} );

			it( 'should return a range spanning both of the ranges - original range start is equal to other range end position', () => {
				const range = new Range( new Position( root, [ 3 ] ), new Position( root, [ 3, 2 ] ) );
				const otherRange = new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 3 ] ) );
				const sum = range.getJoined( otherRange );

				expect( sum.start.path ).to.deep.equal( [ 0, 1 ] );
				expect( sum.end.path ).to.deep.equal( [ 3, 2 ] );
			} );

			it( 'should return a range spanning both of the ranges - original range is touching other range on the right side', () => {
				const range = new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 3 ] ) );
				const otherRange = new Range( new Position( root, [ 3, 0 ] ), new Position( root, [ 3, 2 ] ) );
				const sum = range.getJoined( otherRange );

				expect( sum.start.path ).to.deep.equal( [ 0, 1 ] );
				expect( sum.end.path ).to.deep.equal( [ 3, 2 ] );
			} );

			it( 'should return a range spanning both of the ranges - original range is touching other range on the left side', () => {
				const range = new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 3, 2 ] ) );
				const otherRange = new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 2 ] ) );
				const sum = range.getJoined( otherRange );

				expect( sum.start.path ).to.deep.equal( [ 0, 1 ] );
				expect( sum.end.path ).to.deep.equal( [ 3, 2 ] );
			} );
		} );
	} );

	// Note: We don't create model element structure in these tests because this method
	// is used by OT so it must not check the structure.
	describe( 'getTransformedByOperation()', () => {
		let gyPos;

		beforeEach( () => {
			range = new Range( Position._createAt( root, 2 ), Position._createAt( root, 5 ) );
			gyPos = new Position( gy, [ 0 ] );
		} );

		function expectRange( range, startOffset, endOffset ) {
			expect( range.start.offset ).to.equal( startOffset );
			expect( range.end.offset ).to.equal( endOffset );
		}

		describe( 'by AttributeOperation', () => {
			it( 'nothing should change', () => {
				const opRange = new Range( Position._createAt( root, 1 ), Position._createAt( root, 6 ) );
				const op = new AttributeOperation( opRange, 'key', true, false, 1 );
				const transformed = range.getTransformedByOperation( op );

				expectRange( transformed[ 0 ], 2, 5 );
			} );
		} );

		describe( 'by InsertOperation', () => {
			it( 'insert before range', () => {
				const op = new InsertOperation( new Position( root, [ 1 ] ), new Text( 'abc' ), 1 );
				const transformed = range.getTransformedByOperation( op );

				expectRange( transformed[ 0 ], 5, 8 );
			} );

			it( 'insert inside range', () => {
				const op = new InsertOperation( new Position( root, [ 3 ] ), new Text( 'abc' ), 1 );
				const transformed = range.getTransformedByOperation( op );

				expectRange( transformed[ 0 ], 2, 8 );
			} );

			it( 'insert after range', () => {
				const op = new InsertOperation( new Position( root, [ 6 ] ), new Text( 'abc' ), 1 );
				const transformed = range.getTransformedByOperation( op );

				expectRange( transformed[ 0 ], 2, 5 );
			} );
		} );

		describe( 'by MarkerOperation', () => {
			it( 'nothing should change', () => {
				const op = new MarkerOperation(
					'marker', null, new Range( Position._createAt( root, 1 ), Position._createAt( root, 6 ) ), model.markers, true, 1
				);

				const transformed = range.getTransformedByOperation( op );

				expectRange( transformed[ 0 ], 2, 5 );
			} );
		} );

		describe( 'by MoveOperation', () => {
			it( 'move before range', () => {
				const start = new Position( root, [ 0 ] );
				const target = new Position( otherRoot, [ 0 ] );
				const op = new MoveOperation( start, 2, target, 1 );

				const transformed = range.getTransformedByOperation( op );

				expectRange( transformed[ 0 ], 0, 3 );
			} );

			it( 'move intersecting with range (and targeting before range)', () => {
				const start = new Position( root, [ 4 ] );
				const target = new Position( root, [ 0 ] );
				const op = new MoveOperation( start, 2, target, 1 );

				const transformed = range.getTransformedByOperation( op );

				expectRange( transformed[ 0 ], 4, 6 );
				expectRange( transformed[ 1 ], 0, 1 );
			} );

			it( 'move inside the range', () => {
				range.end.offset = 6;
				const start = new Position( root, [ 3 ] );
				const target = new Position( root, [ 5 ] );
				const op = new MoveOperation( start, 1, target, 1 );

				const transformed = range.getTransformedByOperation( op );

				expectRange( transformed[ 0 ], 2, 4 );
				expectRange( transformed[ 1 ], 4, 5 );
				expectRange( transformed[ 2 ], 5, 6 );
			} );

			// #877.
			it( 'moved element contains range start and is moved towards inside of range', () => {
				// Initial state:
				// <w><p>abc</p><p>x[x</p></w><p>d]ef</p>
				// Expected state after moving `<p>` out of `<w>`:
				// <w><p>abc</p></w><p>x[x</p><p>d]ef</p>

				// <w><p>abc</p>{</w>}<p>x[x</p><p>d]ef</p>

				const range = new Range( new Position( root, [ 0, 1, 1 ] ), new Position( root, [ 1, 1 ] ) );
				const op = new MoveOperation( new Position( root, [ 0, 1 ] ), 1, new Position( root, [ 1 ] ), 1 );

				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 1, 1 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 2, 1 ] );
			} );

			it( 'moved element contains range end and is moved towards range', () => {
				// Initial state:
				// <p>a[bc</p><p>def</p><p>x]x</p>
				// Expected state after moving:
				// <p>a[bc</p><p>x]x</p><p>def</p>

				const range = new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 2, 1 ] ) );
				const op = new MoveOperation( new Position( root, [ 2 ] ), 1, new Position( root, [ 1 ] ), 1 );

				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 0, 1 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 1, 1 ] );
			} );

			// #1358
			it( 'should not crash and not transform the range if move operation moves 0 nodes', () => {
				const range = new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 4 ] ) );
				const op = new MoveOperation( new Position( root, [ 0, 1 ] ), 0, new Position( root, [ 0, 3 ] ), 1 );

				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 0, 2 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 0, 4 ] );
			} );
		} );

		describe( 'by MoveOperation to graveyard', () => {
			it( 'remove before range', () => {
				const start = new Position( root, [ 0 ] );
				const op = new MoveOperation( start, 2, gyPos, 1 );

				const transformed = range.getTransformedByOperation( op );

				expectRange( transformed[ 0 ], 0, 3 );
			} );

			it( 'remove intersecting with range', () => {
				const start = new Position( root, [ 4 ] );
				const op = new MoveOperation( start, 2, gyPos, 1 );

				const transformed = range.getTransformedByOperation( op );

				expectRange( transformed[ 0 ], 2, 4 );
				expect( transformed[ 1 ].root ).to.equal( doc.graveyard );
				expect( transformed[ 1 ].end.offset - transformed[ 1 ].start.offset ).to.equal( 1 );
			} );

			it( 'remove inside the range', () => {
				const start = new Position( root, [ 3 ] );

				const op = new MoveOperation( start, 2, gyPos, 1 );

				const transformed = range.getTransformedByOperation( op );

				expectRange( transformed[ 0 ], 2, 3 );
				expect( transformed[ 1 ].root ).to.equal( doc.graveyard );
				expect( transformed[ 1 ].end.offset - transformed[ 1 ].start.offset ).to.equal( 2 );
			} );
		} );

		describe( 'by RenameOperation', () => {
			it( 'nothing should change', () => {
				const op = new RenameOperation( new Position( root, [ 3 ] ), 'old', 'new', 1 );
				const transformed = range.getTransformedByOperation( op );

				expectRange( transformed[ 0 ], 2, 5 );
			} );
		} );

		describe( 'by SplitOperation', () => {
			it( 'split inside range', () => {
				range = new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 4 ] ) );

				const op = new SplitOperation( new Position( root, [ 0, 3 ] ), 6, gyPos, 1 );
				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 0, 2 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 1, 1 ] );
			} );

			it( 'split at the beginning of multi-element range', () => {
				range = new Range( new Position( root, [ 0, 4 ] ), new Position( root, [ 1, 2 ] ) );

				const op = new SplitOperation( new Position( root, [ 0, 4 ] ), 5, gyPos, 1 );
				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 1, 0 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 2, 2 ] );
			} );

			it( 'split inside range which starts at the beginning of split element', () => {
				range = new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 4 ] ) );

				const op = new SplitOperation( new Position( root, [ 0, 3 ] ), 6, gyPos, 1 );
				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 0, 0 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 1, 1 ] );
			} );

			it( 'split inside range which end is at the end of split element', () => {
				range = new Range( new Position( root, [ 0, 3 ] ), new Position( root, [ 0, 6 ] ) );

				const op = new SplitOperation( new Position( root, [ 0, 4 ] ), 5, gyPos, 1 );
				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 0, 3 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 1, 2 ] );
			} );

			it( 'split element which has collapsed range at the end', () => {
				range = new Range( new Position( root, [ 0, 6 ] ), new Position( root, [ 0, 6 ] ) );

				const op = new SplitOperation( new Position( root, [ 0, 3 ] ), 6, gyPos, 1 );
				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 1, 3 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 1, 3 ] );
			} );

			it( 'split element which is the last element in the range', () => {
				range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 3 ] ) );

				const op = new SplitOperation( new Position( root, [ 2, 0 ] ), 6, gyPos, 1 );
				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 1 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 4 ] );
			} );
		} );

		describe( 'by MergeOperation', () => {
			it( 'merge element with collapsed range', () => {
				range.start = new Position( root, [ 1, 0 ] );
				range.end = new Position( root, [ 1, 0 ] );

				const op = new MergeOperation(
					new Position( root, [ 1, 0 ] ),
					4,
					new Position( root, [ 0, 3 ] ),
					gyPos,
					1
				);

				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 0, 3 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 0, 3 ] );
			} );

			it( 'merge element with collapsed range #2', () => {
				range.start = new Position( root, [ 1, 3 ] );
				range.end = new Position( root, [ 1, 3 ] );

				const op = new MergeOperation(
					new Position( root, [ 0, 0 ] ),
					4,
					new Position( root, [ 1, 3 ] ),
					gyPos,
					1
				);

				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 0, 3 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 0, 3 ] );
			} );

			// #877.
			it( 'merge elements that contain elements with range boundaries', () => {
				// Initial state:
				// <w><p>x[x</p></w><w><p>y]y</p></w>
				// Expected state after merge:
				// <w><p>x[x</p><p>y]y</p></w>

				const range = new Range( new Position( root, [ 0, 0, 1 ] ), new Position( root, [ 1, 0, 1 ] ) );

				const op = new MergeOperation(
					new Position( root, [ 1, 0 ] ),
					4,
					new Position( root, [ 0, 1 ] ),
					gyPos,
					1
				);

				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 0, 0, 1 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 0, 1, 1 ] );
			} );

			it( 'merge at the beginning of the range', () => {
				const range = new Range( new Position( root, [ 2 ] ), new Position( root, [ 4 ] ) );

				const op = new MergeOperation(
					new Position( root, [ 2, 0 ] ),
					4,
					new Position( root, [ 1, 1 ] ),
					gyPos,
					1
				);

				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 2 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 3 ] );
			} );

			it( 'merge at the end of the range', () => {
				const range = new Range( new Position( root, [ 2 ] ), new Position( root, [ 4 ] ) );

				const op = new MergeOperation(
					new Position( root, [ 3, 0 ] ),
					4,
					new Position( root, [ 2, 1 ] ),
					gyPos,
					1
				);

				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 2 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 3 ] );
			} );

			it( 'merged element is the only node in the range', () => {
				const range = new Range( new Position( root, [ 2 ] ), new Position( root, [ 3 ] ) );

				const op = new MergeOperation(
					new Position( root, [ 2, 0 ] ),
					4,
					new Position( root, [ 1, 1 ] ),
					gyPos,
					1
				);

				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 2 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'range start is between merged elements #1', () => {
				// <p>aa</p>{<p>b}b</p><p>cc</p>
				const range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 1, 1 ] ) );

				const op = new MergeOperation(
					new Position( root, [ 1, 0 ] ),
					2,
					new Position( root, [ 0, 2 ] ),
					gyPos,
					1
				);

				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );

				// <p>aa{b}b</p><p>cc</p>
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 0, 2 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 0, 3 ] );
			} );

			it( 'range start is between merged elements #2', () => {
				// <p>aa</p>{<p>cc</p><p>b}b</p>
				const range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 2, 1 ] ) );

				const op = new MergeOperation(
					new Position( root, [ 2, 0 ] ),
					2,
					new Position( root, [ 0, 2 ] ),
					gyPos,
					1
				);

				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );

				// <p>aa{bb</p><p>cc</p>}
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 0, 2 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'range is set on closing tag of merge target element', () => {
				// <p>aa{</p>}<p>bb</p>
				const range = new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 1 ] ) );

				const op = new MergeOperation(
					new Position( root, [ 1, 0 ] ),
					2,
					new Position( root, [ 0, 2 ] ),
					gyPos,
					1
				);

				const transformed = range.getTransformedByOperation( op );

				expect( transformed.length ).to.equal( 1 );

				// <p>aa{}bb</p>
				expect( transformed[ 0 ].start.path ).to.deep.equal( [ 0, 2 ] );
				expect( transformed[ 0 ].end.path ).to.deep.equal( [ 0, 2 ] );
			} );
		} );
	} );

	describe( 'getTransformedByOperations()', () => {
		beforeEach( () => {
			root._appendChild( new Text( 'foobar' ) );
			range = new Range( Position._createAt( root, 2 ), Position._createAt( root, 5 ) );
		} );

		function expectRange( range, startOffset, endOffset ) {
			expect( range.start.offset ).to.equal( startOffset );
			expect( range.end.offset ).to.equal( endOffset );
		}

		it( 'should return a range transformed by multiple operations', () => {
			const transformed = range.getTransformedByOperations( [
				new InsertOperation( new Position( root, [ 1 ] ), new Text( 'abc' ), 1 ), // Range becomes 5..8.
				new InsertOperation( new Position( root, [ 6 ] ), new Text( 'xx' ), 2 ) // Range becomes 5..10.
			] );

			expectRange( transformed[ 0 ], 5, 10 );
		} );

		it( 'should correctly handle breaking transformed range and all range "pieces"', () => {
			const transformed = range.getTransformedByOperations( [
				new InsertOperation( new Position( root, [ 3 ] ), new Text( 'abc' ), 1 ), // Range becomes 2..8.
				new MoveOperation( new Position( root, [ 4 ] ), 3, new Position( root, [ 9 ] ), 2 ), // Range becomes 2..5 and 6..9.
				new InsertOperation( new Position( root, [ 0 ] ), new Text( 'x' ), 3 ), // Range becomes 3..6 and 7..10.
				new MoveOperation( new Position( root, [ 9 ] ), 1, new Position( root, [ 4 ] ), 4 ), // Range becomes 3..7 and 8..10.
				new MoveOperation( new Position( root, [ 6 ] ), 1, new Position( root, [ 1 ] ), 5 ) // Range becomes 1..2, 4..7 and 8..10.
			] );

			expect( transformed.length ).to.equal( 3 );

			expectRange( transformed[ 0 ], 4, 7 );
			expectRange( transformed[ 1 ], 1, 2 );
			expectRange( transformed[ 2 ], 8, 10 );
		} );

		it( 'should return range equal to original range for empty operation set', () => {
			const transformed = range.getTransformedByOperations( [] );

			expectRange( transformed[ 0 ], 2, 5 );
		} );
	} );

	describe( 'getMinimalFlatRanges()', () => {
		beforeEach( () => {
			prepareRichRoot( root );
		} );

		it( 'should return empty array if range is collapsed', () => {
			const range = new Range( new Position( root, [ 1, 3 ] ), new Position( root, [ 1, 3 ] ) );
			const flat = range.getMinimalFlatRanges();

			expect( flat.length ).to.equal( 0 );
		} );

		it( 'should return empty array if range does not contain any node', () => {
			const range = new Range( new Position( root, [ 1, 3 ] ), new Position( root, [ 2, 0 ] ) );
			const flat = range.getMinimalFlatRanges();

			expect( flat.length ).to.equal( 0 );
		} );

		it( 'should return a minimal set of flat ranges that covers the range (start and end in different sub-trees)', () => {
			const range = new Range( new Position( root, [ 0, 0, 3 ] ), new Position( root, [ 3, 0, 2 ] ) );
			const flat = range.getMinimalFlatRanges();

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
			const range = new Range( new Position( root, [ 0 ] ), new Position( root, [ 0, 1, 4 ] ) );
			const flat = range.getMinimalFlatRanges();

			expect( flat.length ).to.equal( 2 );
			expect( flat[ 0 ].start.path ).to.deep.equal( [ 0, 0 ] );
			expect( flat[ 0 ].end.path ).to.deep.equal( [ 0, 1 ] );
			expect( flat[ 1 ].start.path ).to.deep.equal( [ 0, 1, 0 ] );
			expect( flat[ 1 ].end.path ).to.deep.equal( [ 0, 1, 4 ] );
		} );
	} );

	describe( 'isFlat', () => {
		beforeEach( () => {
			prepareRichRoot( root );
		} );

		it( 'should be true if start and end position are in the same parent', () => {
			const range = new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 2 ] ) );
			expect( range.isFlat ).to.be.true;
		} );

		it( 'should be false if start and end position are in different parents', () => {
			const range = new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 3, 0, 1 ] ) );
			expect( range.isFlat ).to.be.false;
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should serialize range', () => {
			const range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 3 ] ) );

			const serialized = range.toJSON();

			expect( serialized ).to.deep.equal( {
				start: { root: 'main', path: [ 1 ], stickiness: 'toNext' },
				end: { root: 'main', path: [ 3 ], stickiness: 'toPrevious' }
			} );
		} );
	} );

	describe( 'fromJSON()', () => {
		it( 'should create range from given JSON object', () => {
			const serialized = range.toJSON();
			const deserialized = Range.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( range );
		} );
	} );

	describe( 'getCommonAncestor()', () => {
		it( 'should return common ancestor for positions from Range', () => {
			expect( range.getCommonAncestor() ).to.equal( root );
		} );
	} );

	describe( 'getContainedElement()', () => {
		beforeEach( () => {
			prepareRichRoot( root );
		} );

		it( 'should return an element when it is fully contained by the range', () => {
			// <div><h>first</h><p>lorem ipsum</p></div>[<p>foo</p>]<p>bar</p><div><h>second</h><p>lorem</p></div>
			const range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 2 ] ) );

			expect( range.getContainedElement() ).to.equal( root.getNodeByPath( [ 1 ] ) );
		} );

		it( 'should return "null" if the range is collapsed', () => {
			// <div><h>first</h><p>lorem ipsum</p></div>[]<p>foo</p><p>bar</p><div><h>second</h><p>lorem</p></div>
			const range = new Range( new Position( root, [ 1 ] ) );

			expect( range.getContainedElement() ).to.be.null;
		} );

		it( 'should return "null" if it contains 2+ elements', () => {
			// <div><h>first</h><p>lorem ipsum</p></div>[<p>foo</p><p>bar</p>]<div><h>second</h><p>lorem</p></div>
			const range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 3 ] ) );

			expect( range.getContainedElement() ).to.be.null;
		} );

		it( 'should return "null" if it contains an element and some other nodes', () => {
			// <div><h>first</h><p>lorem ipsum</p></div>[<p>foo</p><p>ba]r</p><div><h>second</h><p>lorem</p></div>
			const range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 2, 2 ] ) );

			expect( range.getContainedElement() ).to.be.null;
		} );

		it( 'should return "null" if it fully contains a node but the node is not an element', () => {
			// <div><h>first</h><p>lorem ipsum</p></div><p>foo</p><p>[bar]</p><div><h>second</h><p>lorem</p></div>
			const range = new Range( new Position( root, [ 2, 0 ] ), new Position( root, [ 2, 3 ] ) );

			expect( range.getContainedElement() ).to.be.null;
		} );
	} );

	function mapNodesToNames( nodes ) {
		return nodes.map( node => {
			return ( node instanceof Element ) ? 'E:' + node.name : 'T:' + node.data;
		} );
	}

	function prepareRichRoot() {
		root._insertChild( 0, [
			new Element( 'div', [], [
				new Element( 'h', [], new Text( 'first' ) ),
				new Element( 'p', [], new Text( 'lorem ipsum' ) )
			] ),
			new Element( 'p', [], new Text( 'foo' ) ),
			new Element( 'p', [], new Text( 'bar' ) ),
			new Element( 'div', [], [
				new Element( 'h', [], new Text( 'second' ) ),
				new Element( 'p', [], new Text( 'lorem' ) )
			] )
		] );
	}
} );
