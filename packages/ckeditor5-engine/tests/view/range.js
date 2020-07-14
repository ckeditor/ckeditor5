/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Range from '../../src/view/range';
import Position from '../../src/view/position';
import Element from '../../src/view/element';
import DocumentFragment from '../../src/view/documentfragment';
import Text from '../../src/view/text';
import TextProxy from '../../src/view/textproxy';
import TreeWalker from '../../src/view/treewalker';
import Document from '../../src/view/document';
import { parse, stringify } from '../../src/dev-utils/view';
import { StylesProcessor } from '../../src/view/stylesmap';

function getRange( view, options = {} ) {
	const { selection } = parse( view, options );

	return selection.getFirstRange();
}

describe( 'Range', () => {
	let document;

	beforeEach( () => {
		document = new Document( new StylesProcessor() );
	} );

	describe( 'constructor()', () => {
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

		it( 'creates collapsed range', () => {
			const start = new Position( {}, 1 );
			const range = new Range( start );

			expect( range.start.isEqual( start ) ).to.be.true;
			expect( range.isCollapsed ).to.be.true;
		} );
	} );

	describe( 'is()', () => {
		let range;

		before( () => {
			const start = new Position( {}, 1 );
			range = new Range( start );
		} );

		it( 'should return true for "range"', () => {
			expect( range.is( 'range' ) ).to.be.true;
			expect( range.is( 'view:range' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( range.is( 'rootElement' ) ).to.be.false;
			expect( range.is( 'containerElement' ) ).to.be.false;
			expect( range.is( 'element' ) ).to.be.false;
			expect( range.is( 'p' ) ).to.be.false;
			expect( range.is( '$text' ) ).to.be.false;
			expect( range.is( '$textProxy' ) ).to.be.false;
			expect( range.is( 'attributeElement' ) ).to.be.false;
			expect( range.is( 'uiElement' ) ).to.be.false;
			expect( range.is( 'emptyElement' ) ).to.be.false;
			expect( range.is( 'documentFragment' ) ).to.be.false;
			expect( range.is( 'model:range' ) ).to.be.false;
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over the range returning tree walker values', () => {
			const range = getRange( '<p>fo{o</p><p>bar</p><p>xy}z</p>' );
			const values = Array.from( range );

			expect( values.length ).to.equal( 5 );
			expect( values[ 0 ].item.data ).to.equal( 'o' );
			expect( values[ 1 ].item.name ).to.equal( 'p' );
			expect( values[ 2 ].item.data ).to.equal( 'bar' );
			expect( values[ 3 ].item.name ).to.equal( 'p' );
			expect( values[ 4 ].item.data ).to.equal( 'xy' );
		} );
	} );

	describe( 'isFlat', () => {
		it( 'should be true if range start and range end are in same parent', () => {
			const range = getRange( '<p>f{oo}</p><p>bar</p>' );

			expect( range.isFlat ).to.be.true;
		} );

		it( 'should be false if range start and range end are in different parents', () => {
			const range = getRange( '<p>fo{o</p><p>b}ar</p>' );

			expect( range.isFlat ).to.be.false;
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return root element in which range is created', () => {
			const viewRoot = new Element( document, 'div' );
			const range = getRange( '<p>f{oo</p><p>ba}r</p>', { rootElement: viewRoot } );

			expect( range.root ).to.equal( viewRoot );
		} );

		it( 'should return document fragment in which range is created', () => {
			const viewFrag = new DocumentFragment();
			const range = getRange( '<p>f{oo</p><p>ba}r</p>', { rootElement: viewFrag } );

			expect( range.root ).to.equal( viewFrag );
		} );
	} );

	describe( 'getEnlarged', () => {
		it( 'case 1', () => {
			expect( enlarge( '<p>f<b>{oo}</b></p><p>bar</p>' ) )
				.to.equal( '<p>f[<b>oo</b>]</p><p>bar</p>' );
		} );

		it( 'case 2', () => {
			expect( enlarge( '<p>f{oo}bar</p>' ) )
				.to.equal( '<p>f{oo}bar</p>' );
		} );

		it( 'case 3', () => {
			expect( enlarge( '<p>f<span></span>{oo}<span></span>bar</p>' ) )
				.to.equal( '<p>f[<span></span>oo<span></span>]bar</p>' );
		} );

		it( 'case 4', () => {
			expect( enlarge( '<p>f<img></img>{oo}<img></img>bar</p>' ) )
				.to.equal( '<p>f<img></img>[oo]<img></img>bar</p>' );
		} );

		it( 'case 5', () => {
			expect( enlarge( '<p><b>f</b>{oo}<b><span></span>bar</b></p>' ) )
				.to.equal( '<p><b>f[</b>oo<b><span></span>]bar</b></p>' );
		} );

		it( 'case6', () => {
			expect( enlarge( '<p>foo</p><p>[bar]</p><p>bom</p>' ) )
				.to.equal( '<p>foo</p><p>[bar]</p><p>bom</p>' );
		} );

		function enlarge( data ) {
			data = data
				.replace( /<p>/g, '<container:p>' )
				.replace( /<\/p>/g, '</container:p>' )
				.replace( /<b>/g, '<attribute:b>' )
				.replace( /<\/b>/g, '</attribute:b>' )
				.replace( /<img><\/img>/g, '<empty:img></empty:img>' )
				.replace( /<span><\/span>/g, '<ui:span></ui:span>' );

			const viewFrag = new DocumentFragment();
			const { view, selection } = parse( data, { rootElement: viewFrag } );
			const range = selection.getFirstRange();

			const enlargedRange = range.getEnlarged();

			return stringify( view, enlargedRange );
		}
	} );

	describe( 'getTrimmed', () => {
		it( 'case 1', () => {
			expect( trim( '<p>f[<b>oo</b>]</p><p>bar</p>' ) )
				.to.equal( '<p>f<b>{oo}</b></p><p>bar</p>' );
		} );

		it( 'case 2', () => {
			expect( trim( '<p>f{oo}bar</p>' ) )
				.to.equal( '<p>f{oo}bar</p>' );
		} );

		it( 'case 3', () => {
			expect( trim( '<p>f[<span></span>oo<span></span>]bar</p>' ) )
				.to.equal( '<p>f<span></span>{oo}<span></span>bar</p>' );
		} );

		it( 'case 4', () => {
			expect( trim( '<p>f<img></img>[oo]<img></img>bar</p>' ) )
				.to.equal( '<p>f<img></img>{oo}<img></img>bar</p>' );
		} );

		it( 'case 5', () => {
			expect( trim( '<p><b>f[</b>oo<b><span></span>]bar</b></p>' ) )
				.to.equal( '<p><b>f</b>{oo}<b><span></span>bar</b></p>' );
		} );

		it( 'case 6', () => {
			expect( trim( '<p>foo[</p><p>bar</p><p>]bom</p>' ) )
				.to.equal( '<p>foo[</p><p>bar</p><p>]bom</p>' );
		} );

		it( 'case 7', () => {
			expect( trim( '<p>foo[<b><img></img></b>]bom</p>' ) )
				.to.equal( '<p>foo<b>[<img></img>]</b>bom</p>' );
		} );

		// Other results may theoretically be correct too. It is not decided whether the trimmed range should
		// be collapsed in attribute element, at its start or its end. This is one of possible correct results
		// and we won't know for sure unless we have more cases. See #1058.
		it( 'case 8', () => {
			expect( trim( '<p>[<b></b>]</p>' ) )
				.to.equal( '<p><b></b>[]</p>' );
		} );

		// As above.
		it( 'case 9', () => {
			expect( trim( '<p><b></b>[<b></b>]<b></b></p>' ) )
				.to.equal( '<p><b></b><b></b><b></b>[]</p>' );
		} );

		// As above.
		it( 'case 10', () => {
			expect( trim( '<p>[<b></b><b></b>]</p>' ) )
				.to.equal( '<p><b></b><b></b>[]</p>' );
		} );

		// As above.
		it( 'case 11', () => {
			expect( trim( '<p><b></b><b>[]</b><b></b></p>' ) )
				.to.equal( '<p><b></b><b></b><b></b>[]</p>' );
		} );

		function trim( data ) {
			data = data
				.replace( /<p>/g, '<container:p>' )
				.replace( /<\/p>/g, '</container:p>' )
				.replace( /<b>/g, '<attribute:b>' )
				.replace( /<\/b>/g, '</attribute:b>' )
				.replace( /<img><\/img>/g, '<empty:img></empty:img>' )
				.replace( /<span><\/span>/g, '<ui:span></ui:span>' );

			const viewFrag = new DocumentFragment();
			const { view, selection } = parse( data, { rootElement: viewFrag } );
			const range = selection.getFirstRange();

			const trimmedRange = range.getTrimmed();

			return stringify( view, trimmedRange );
		}
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
			const range1 = new Range( new Position( mockObject, 0 ), new Position( mockObject, 10 ) );
			const range2 = new Range( new Position( mockObject, 2 ), new Position( mockObject, 10 ) );

			expect( range1.isEqual( range2 ) ).to.be.false;
		} );
	} );

	describe( 'containsPosition', () => {
		let viewRoot, range;

		beforeEach( () => {
			viewRoot = new Element( document, 'div' );
			range = getRange( '<p>fo{o</p><p>bar</p><p>xy}z</p>', { rootElement: viewRoot } );
		} );

		it( 'should return false if position is before range', () => {
			const position = new Position( viewRoot.getChild( 0 ).getChild( 0 ), 1 ); // After "f".

			expect( range.containsPosition( position ) ).to.be.false;
		} );

		it( 'should return false if position is after range', () => {
			const position = new Position( viewRoot.getChild( 2 ).getChild( 0 ), 3 ); // After "z".

			expect( range.containsPosition( position ) ).to.be.false;
		} );

		it( 'should return true if position is inside range', () => {
			const position = new Position( viewRoot.getChild( 1 ).getChild( 0 ), 1 ); // After "b".

			expect( range.containsPosition( position ) ).to.be.true;
		} );
	} );

	describe( 'containsRange', () => {
		let viewRoot, range, beforeF, afterF, beforeB, afterX;

		beforeEach( () => {
			viewRoot = new Element( document, 'div' );
			range = getRange( '<p>fo{o</p><p>bar</p><p>xy}z</p>', { rootElement: viewRoot } );

			beforeF = new Position( viewRoot.getChild( 0 ).getChild( 0 ), 0 );
			afterF = new Position( viewRoot.getChild( 0 ).getChild( 0 ), 1 );
			beforeB = new Position( viewRoot.getChild( 1 ).getChild( 0 ), 0 );
			afterX = new Position( viewRoot.getChild( 2 ).getChild( 0 ), 1 );
		} );

		it( 'should return false if ranges do not intersect', () => {
			const otherRange = new Range( beforeF, afterF );

			expect( range.containsRange( otherRange ) ).to.be.false;
		} );

		it( 'should return false if ranges intersect but only partially', () => {
			const otherRange = new Range( afterF, afterX );

			expect( range.containsRange( otherRange ) ).to.be.false;
		} );

		it( 'should return false if ranges are equal', () => {
			const otherRange = range.clone();

			expect( range.containsRange( otherRange ) ).to.be.false;
		} );

		it( 'should return true if given range is inside range', () => {
			const otherRange = new Range( beforeB, afterX );

			expect( range.containsRange( otherRange ) ).to.be.true;
		} );

		it( 'should return true if ranges are equal and check is not strict', () => {
			const otherRange = range.clone();

			expect( range.containsRange( otherRange, true ) ).to.be.true;
		} );

		it( 'should return true if ranges start at the same position and check is not strict', () => {
			const otherRange = new Range( range.start, afterX );

			expect( range.containsRange( otherRange, true ) ).to.be.true;
		} );

		it( 'should return true if ranges end at the same position and check is not strict', () => {
			const otherRange = new Range( beforeB, range.end );

			expect( range.containsRange( otherRange, true ) ).to.be.true;
		} );

		it( 'should return false if given range is collapsed and starts or ends at another range boundary', () => {
			expect( range.containsRange( new Range( range.start, range.start ) ) ).to.be.false;
			expect( range.containsRange( new Range( range.end, range.end ) ) ).to.be.false;

			expect( range.containsRange( new Range( range.start, range.start ), true ) ).to.be.false;
			expect( range.containsRange( new Range( range.end, range.end ), true ) ).to.be.false;
		} );
	} );

	describe( 'other range interaction', () => {
		let root, p1, p2, t1, t2, t3;

		//            root
		//    __________|__________
		//    |                   |
		// ___p1___               p2
		// |       |              |
		// t1      t2             t3

		beforeEach( () => {
			t1 = new Text( document, 'foo' );
			t2 = new Text( document, 'bar' );
			t3 = new Text( document, 'baz' );
			p1 = new Element( document, 'p', null, [ t1, t2 ] );
			p2 = new Element( document, 'p', null, t3 );
			root = new Element( document, 'div', null, [ p1, p2 ] );
		} );

		describe( 'isIntersecting', () => {
			it( 'should return true if given range is equal', () => {
				const range = Range._createFromParentsAndOffsets( t1, 0, t3, 2 );
				const otherRange = range.clone();
				expect( range.isIntersecting( otherRange ) ).to.be.true;
				expect( otherRange.isIntersecting( range ) ).to.be.true;
			} );

			it( 'should return true if given range contains this range', () => {
				const range = Range._createFromParentsAndOffsets( t1, 0, t3, 3 );
				const otherRange = Range._createFromParentsAndOffsets( p1, 1, t2, 2 );

				expect( range.isIntersecting( otherRange ) ).to.be.true;
				expect( otherRange.isIntersecting( range ) ).to.be.true;
			} );

			it( 'should return true if given range ends in this range', () => {
				const range = Range._createFromParentsAndOffsets( root, 1, t3, 3 );
				const otherRange = Range._createFromParentsAndOffsets( t1, 0, p2, 0 );

				expect( range.isIntersecting( otherRange ) ).to.be.true;
				expect( otherRange.isIntersecting( range ) ).to.be.true;
			} );

			it( 'should return true if given range starts in this range', () => {
				const range = Range._createFromParentsAndOffsets( t1, 0, t2, 3 );
				const otherRange = Range._createFromParentsAndOffsets( p1, 1, p2, 0 );

				expect( range.isIntersecting( otherRange ) ).to.be.true;
				expect( otherRange.isIntersecting( range ) ).to.be.true;
			} );

			it( 'should return false if given range is fully before/after this range', () => {
				const range = Range._createFromParentsAndOffsets( t1, 0, t2, 3 );
				const otherRange = Range._createFromParentsAndOffsets( root, 1, t3, 0 );

				expect( range.isIntersecting( otherRange ) ).to.be.false;
				expect( otherRange.isIntersecting( range ) ).to.be.false;
			} );

			it( 'should return false if ranges are in different roots', () => {
				const range = Range._createFromParentsAndOffsets( t1, 0, t2, 3 );
				const otherRange = Range._createFromParentsAndOffsets( new Element( document, 'div' ), 1, t3, 0 );

				expect( range.isIntersecting( otherRange ) ).to.be.false;
				expect( otherRange.isIntersecting( range ) ).to.be.false;
			} );
		} );

		describe( 'getDifference', () => {
			it( 'should return range equal to original range if other range does not intersect with it', () => {
				const range = Range._createFromParentsAndOffsets( t1, 0, t2, 3 );
				const otherRange = Range._createFromParentsAndOffsets( root, 1, t3, 0 );
				const difference = range.getDifference( otherRange );

				expect( difference.length ).to.equal( 1 );
				expect( difference[ 0 ].isEqual( range ) ).to.be.true;
			} );

			it( 'should return shrunken range if other range intersects with it', () => {
				const range = Range._createFromParentsAndOffsets( root, 1, t3, 3 );
				const otherRange = Range._createFromParentsAndOffsets( t1, 0, p2, 0 );
				const difference = range.getDifference( otherRange );

				expect( difference.length ).to.equal( 1 );

				expect( difference[ 0 ].start.parent ).to.equal( p2 );
				expect( difference[ 0 ].start.offset ).to.equal( 0 );
				expect( difference[ 0 ].end.parent ).to.equal( t3 );
				expect( difference[ 0 ].end.offset ).to.equal( 3 );
			} );

			it( 'should return an empty array if other range contains or is same as the original range', () => {
				const range = Range._createFromParentsAndOffsets( p1, 1, t2, 2 );
				const otherRange = Range._createFromParentsAndOffsets( t1, 0, t3, 3 );
				const difference = range.getDifference( otherRange );

				expect( difference.length ).to.equal( 0 );
			} );

			it( 'should two ranges if other range is contained by the original range', () => {
				const range = Range._createFromParentsAndOffsets( t1, 0, t3, 3 );
				const otherRange = Range._createFromParentsAndOffsets( p1, 1, t2, 2 );
				const difference = range.getDifference( otherRange );

				expect( difference.length ).to.equal( 2 );

				expect( difference[ 0 ].start.parent ).to.equal( t1 );
				expect( difference[ 0 ].start.offset ).to.equal( 0 );
				expect( difference[ 0 ].end.parent ).to.equal( p1 );
				expect( difference[ 0 ].end.offset ).to.equal( 1 );

				expect( difference[ 1 ].start.parent ).to.equal( t2 );
				expect( difference[ 1 ].start.offset ).to.equal( 2 );
				expect( difference[ 1 ].end.parent ).to.equal( t3 );
				expect( difference[ 1 ].end.offset ).to.equal( 3 );
			} );
		} );

		describe( 'getIntersection', () => {
			it( 'should return range equal to original range if other range contains it', () => {
				const range = Range._createFromParentsAndOffsets( t2, 0, t3, 0 );
				const otherRange = Range._createFromParentsAndOffsets( t1, 1, t3, 1 );
				const intersection = range.getIntersection( otherRange );

				expect( intersection.isEqual( range ) ).to.be.true;
			} );

			it( 'should return range equal to other range if it is contained in original range', () => {
				const range = Range._createFromParentsAndOffsets( t1, 1, t3, 1 );
				const otherRange = Range._createFromParentsAndOffsets( t2, 0, t3, 0 );
				const intersection = range.getIntersection( otherRange );

				expect( intersection.isEqual( otherRange ) ).to.be.true;
			} );

			it( 'should return null if ranges do not intersect', () => {
				const range = Range._createFromParentsAndOffsets( t1, 0, t2, 3 );
				const otherRange = Range._createFromParentsAndOffsets( t3, 0, t3, 3 );
				const intersection = range.getIntersection( otherRange );

				expect( intersection ).to.be.null;
			} );

			it( 'should return common part if ranges intersect partially', () => {
				const range = Range._createFromParentsAndOffsets( t1, 0, t2, 3 );
				const otherRange = Range._createFromParentsAndOffsets( t2, 0, t3, 3 );
				const intersection = range.getIntersection( otherRange );

				expect( intersection.start.parent ).to.equal( t2 );
				expect( intersection.start.offset ).to.equal( 0 );
				expect( intersection.end.parent ).to.equal( t2 );
				expect( intersection.end.offset ).to.equal( 3 );
			} );
		} );
	} );

	describe( 'getWalker', () => {
		it( 'should be possible to iterate using this method', () => {
			const range = getRange( '<p>fo{o</p><p>ba}r</p><p>xyz</p>' );
			const values = [];

			for ( const value of range.getWalker() ) {
				values.push( value );
			}

			expect( values.length ).to.equal( 4 );
			expect( values[ 0 ].item.data ).to.equal( 'o' );
			expect( values[ 1 ].item.name ).to.equal( 'p' );
			expect( values[ 1 ].type ).to.equal( 'elementEnd' );
			expect( values[ 2 ].item.name ).to.equal( 'p' );
			expect( values[ 2 ].type ).to.equal( 'elementStart' );
			expect( values[ 3 ].item.data ).to.equal( 'ba' );
		} );

		it( 'should accept TreeWalker options', () => {
			const range = getRange( '<p>foo</p><p>b{ar</p><p>xy}z</p>' );
			const walker = range.getWalker( { singleCharacters: true, ignoreElementEnd: true } );
			const values = [];

			for ( const value of walker ) {
				values.push( value );
			}

			expect( walker ).to.be.instanceof( TreeWalker );
			expect( walker ).to.have.property( 'singleCharacters' ).that.is.true;

			expect( values.length ).to.equal( 5 );
			expect( values[ 0 ].item.data ).to.equal( 'a' );
			expect( values[ 1 ].item.data ).to.equal( 'r' );
			expect( values[ 2 ].item.name ).to.equal( 'p' );
			expect( values[ 3 ].item.data ).to.equal( 'x' );
			expect( values[ 4 ].item.data ).to.equal( 'y' );
		} );
	} );

	describe( 'getItems', () => {
		it( 'should return iterator that iterates over all view items in the range', () => {
			const range = getRange( '<p>fo{o</p><p>bar</p><p>xy}z</p>' );
			const nodes = [];

			for ( const node of range.getItems() ) {
				nodes.push( node );
			}

			expect( nodes.length ).to.equal( 5 );
			expect( nodes[ 0 ].data ).to.equal( 'o' );
			expect( nodes[ 1 ].name ).to.equal( 'p' );
			expect( nodes[ 2 ].data ).to.equal( 'bar' );
			expect( nodes[ 3 ].name ).to.equal( 'p' );
			expect( nodes[ 4 ].data ).to.equal( 'xy' );
		} );

		it( 'should accept TreeWalker options', () => {
			const range = getRange( '<p>foo</p><p>b{ar</p><p>xy}z</p>' );
			const nodes = [];

			for ( const node of range.getItems( { singleCharacters: true } ) ) {
				nodes.push( node );
			}

			expect( nodes.length ).to.equal( 5 );
			expect( nodes[ 0 ].data ).to.equal( 'a' );
			expect( nodes[ 1 ].data ).to.equal( 'r' );
			expect( nodes[ 2 ].name ).to.equal( 'p' );
			expect( nodes[ 3 ].data ).to.equal( 'x' );
			expect( nodes[ 4 ].data ).to.equal( 'y' );
		} );
	} );

	describe( 'getPositions', () => {
		it( 'should return iterator that iterates over all positions in the range', () => {
			const range = getRange( '<p>fo{o</p><p>b}ar</p><p>xyz</p>' );
			const positions = [];

			for ( const position of range.getPositions() ) {
				positions.push( position );
			}

			expect( positions.length ).to.equal( 5 );

			expect( positions[ 0 ].parent.data ).to.equal( 'foo' ); // Inside text node "foo".
			expect( positions[ 0 ].offset ).to.equal( 2 );

			expect( positions[ 1 ].parent.name ).to.equal( 'p' ); // At the end of the first P element.
			expect( positions[ 1 ].offset ).to.equal( 1 );

			expect( positions[ 2 ].parent ).to.be.instanceof( DocumentFragment ); // In document fragment, between Ps.
			expect( positions[ 2 ].offset ).to.equal( 1 );

			expect( positions[ 3 ].parent.name ).to.equal( 'p' ); // At the beginning of the second P element.
			expect( positions[ 3 ].offset ).to.equal( 0 );

			expect( positions[ 4 ].parent.data ).to.equal( 'bar' ); // Inside text node "bar".
			expect( positions[ 4 ].offset ).to.equal( 1 );
		} );

		it( 'should accept TreeWalker options', () => {
			const range = getRange( '<p>foo</p><p>b{ar</p><p>xy}z</p>' );
			const positions = [];

			for ( const position of range.getPositions( { singleCharacters: true } ) ) {
				positions.push( position );
			}

			expect( positions.length ).to.equal( 7 );

			expect( positions[ 0 ].parent.data ).to.equal( 'bar' ); // "b^ar".
			expect( positions[ 0 ].offset ).to.equal( 1 );

			expect( positions[ 1 ].parent.data ).to.equal( 'bar' ); // "ba^r".
			expect( positions[ 1 ].offset ).to.equal( 2 );

			expect( positions[ 2 ].parent.name ).to.equal( 'p' ); // <p>bar^</p> -- at the end of P node.
			expect( positions[ 2 ].offset ).to.equal( 1 );

			expect( positions[ 3 ].parent ).to.be.instanceof( DocumentFragment ); // "</p>^<p>" -- between P nodes.
			expect( positions[ 3 ].offset ).to.equal( 2 );

			expect( positions[ 4 ].parent.name ).to.equal( 'p' ); // <p>^xyz</p> -- at the start of P node.
			expect( positions[ 4 ].offset ).to.equal( 0 );

			expect( positions[ 5 ].parent.data ).to.equal( 'xyz' ); // "x^yz".
			expect( positions[ 5 ].offset ).to.equal( 1 );

			expect( positions[ 6 ].parent.data ).to.equal( 'xyz' ); // "xy^z".
			expect( positions[ 6 ].offset ).to.equal( 2 );
		} );
	} );

	describe( 'static constructors', () => {
		let div, p, foz;

		beforeEach( () => {
			foz = new Text( document, 'foz' );
			p = new Element( document, 'p', null, foz );
			div = new Element( document, 'div', null, p );
		} );

		describe( '_createIn', () => {
			it( 'should return range', () => {
				const range = Range._createIn( p );

				expect( range.start.parent ).to.deep.equal( p );
				expect( range.start.offset ).to.deep.equal( 0 );
				expect( range.end.parent ).to.deep.equal( p );
				expect( range.end.offset ).to.deep.equal( 1 );
			} );
		} );

		describe( '_createOn', () => {
			it( 'should return range', () => {
				const range = Range._createOn( p );

				expect( range.start.parent ).to.equal( div );
				expect( range.start.offset ).to.equal( 0 );
				expect( range.end.parent ).to.equal( div );
				expect( range.end.offset ).to.equal( 1 );
			} );

			it( 'should create a proper range on a text proxy', () => {
				const text = new Text( document, 'foobar' );
				const textProxy = new TextProxy( text, 2, 3 );
				const range = Range._createOn( textProxy );

				expect( range.start.parent ).to.equal( text );
				expect( range.start.offset ).to.equal( 2 );
				expect( range.end.parent ).to.equal( text );
				expect( range.end.offset ).to.equal( 5 );
			} );
		} );

		describe( '_createFromParentsAndOffsets', () => {
			it( 'should return range', () => {
				const range = Range._createFromParentsAndOffsets( div, 0, foz, 1 );

				expect( range.start.parent ).to.deep.equal( div );
				expect( range.start.offset ).to.deep.equal( 0 );
				expect( range.end.parent ).to.deep.equal( foz );
				expect( range.end.offset ).to.deep.equal( 1 );
			} );
		} );

		describe( '_createFromPositionAndShift', () => {
			it( 'should make range from start position and offset', () => {
				const position = new Position( foz, 1 );
				const range = Range._createFromPositionAndShift( position, 2 );

				expect( range ).to.be.instanceof( Range );
				expect( range.start.isEqual( position ) ).to.be.true;
				expect( range.end.parent ).to.equal( foz );
				expect( range.end.offset ).to.deep.equal( 3 );
			} );

			it( 'should accept negative shift value', () => {
				const position = new Position( foz, 3 );
				const range = Range._createFromPositionAndShift( position, -1 );

				expect( range ).to.be.instanceof( Range );
				expect( range.end.isEqual( position ) ).to.be.true;
				expect( range.start.parent ).to.equal( foz );
				expect( range.start.offset ).to.deep.equal( 2 );
			} );
		} );
	} );

	describe( 'getCommonAncestor()', () => {
		it( 'should return common ancestor for positions from Range', () => {
			const foz = new Text( document, 'foz' );
			const bar = new Text( document, 'bar' );

			const li1 = new Element( document, 'li', null, foz );
			const li2 = new Element( document, 'li', null, bar );

			const ul = new Element( document, 'ul', null, [ li1, li2 ] );

			const range = new Range( new Position( li1, 0 ), new Position( li2, 2 ) );

			expect( range.getCommonAncestor() ).to.equal( ul );
		} );
	} );

	describe( 'getContainedElement()', () => {
		it( 'should return an element when it is fully contained by the range', () => {
			const { selection, view } = parse( 'foo [<b>bar</b>] baz' );
			const range = selection.getFirstRange();
			const element = view.getChild( 1 );

			expect( range.getContainedElement() ).to.equal( element );
		} );

		it( 'should return selected element if the range is anchored at the end/at the beginning of a text node', () => {
			const { selection, view } = parse( 'foo {<b>bar</b>} baz' );
			const range = selection.getFirstRange();
			const element = view.getChild( 1 );

			expect( range.getContainedElement() ).to.equal( element );
		} );

		it( 'should return "null" if the selection is collapsed', () => {
			const { selection } = parse( 'foo []<b>bar</b> baz' );
			const range = selection.getFirstRange();

			expect( range.getContainedElement() ).to.be.null;
		} );

		it( 'should return "null" if it contains 2+ elements', () => {
			const { selection } = parse( 'foo [<b>bar</b><i>qux</i>] baz' );
			const range = selection.getFirstRange();

			expect( range.getContainedElement() ).to.be.null;
		} );

		it( 'should return "null" if the range spans over more than a single element', () => {
			const { selection } = parse( 'foo [<b>bar</b> ba}z' );
			const range = selection.getFirstRange();

			expect( range.getContainedElement() ).to.be.null;
		} );

		it( 'should return "null" if the range spans over a single text node', () => {
			const { selection } = parse( 'foo <b>{bar}</b> baz' );
			const range = selection.getFirstRange();

			expect( range.getContainedElement() ).to.be.null;
		} );
	} );
} );
