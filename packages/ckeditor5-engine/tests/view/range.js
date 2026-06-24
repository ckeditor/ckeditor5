/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { ViewRange } from '../../src/view/range.js';
import { ViewPosition } from '../../src/view/position.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewDocumentFragment } from '../../src/view/documentfragment.js';
import { ViewText } from '../../src/view/text.js';
import { ViewTextProxy } from '../../src/view/textproxy.js';
import { ViewTreeWalker } from '../../src/view/treewalker.js';
import { ViewDocument } from '../../src/view/document.js';
import { _parseView, _stringifyView } from '../../src/dev-utils/view.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

function getRange( view, options = {} ) {
	const { selection } = _parseView( view, options );

	return selection.getFirstRange();
}

describe( 'Range', () => {
	let document;

	beforeEach( () => {
		document = new ViewDocument( new StylesProcessor() );
	} );

	describe( 'constructor()', () => {
		it( 'creates range from provided positions', () => {
			const start = new ViewPosition( {}, 1 );
			const end = new ViewPosition( {}, 2 );
			const range = new ViewRange( start, end );

			expect( range ).toBeInstanceOf( ViewRange );
			expect( range ).toHaveProperty( 'start' );
			expect( range.start ).not.toBe( start );
			expect( range ).toHaveProperty( 'end' );
			expect( range.end ).not.toBe( end );
			expect( range.start.parent ).toBe( start.parent );
			expect( range.end.parent ).toBe( end.parent );
			expect( range.start.offset ).toBe( start.offset );
			expect( range.end.offset ).toBe( end.offset );
		} );

		it( 'creates collapsed range', () => {
			const start = new ViewPosition( {}, 1 );
			const range = new ViewRange( start );

			expect( range.start.isEqual( start ) ).toBe( true );
			expect( range.isCollapsed ).toBe( true );
		} );
	} );

	describe( 'is()', () => {
		let range;

		beforeAll( () => {
			const start = new ViewPosition( {}, 1 );
			range = new ViewRange( start );
		} );

		it( 'should return true for "range"', () => {
			expect( range.is( 'range' ) ).toBe( true );
			expect( range.is( 'view:range' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( range.is( 'rootElement' ) ).toBe( false );
			expect( range.is( 'containerElement' ) ).toBe( false );
			expect( range.is( 'element' ) ).toBe( false );
			expect( range.is( 'element', 'p' ) ).toBe( false );
			expect( range.is( '$text' ) ).toBe( false );
			expect( range.is( '$textProxy' ) ).toBe( false );
			expect( range.is( 'attributeElement' ) ).toBe( false );
			expect( range.is( 'uiElement' ) ).toBe( false );
			expect( range.is( 'emptyElement' ) ).toBe( false );
			expect( range.is( 'documentFragment' ) ).toBe( false );
			expect( range.is( 'model:range' ) ).toBe( false );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over the range returning tree walker values', () => {
			const range = getRange( '<p>fo{o</p><p>bar</p><p>xy}z</p>' );
			const values = Array.from( range );

			expect( values.length ).toBe( 5 );
			expect( values[ 0 ].item.data ).toBe( 'o' );
			expect( values[ 1 ].item.name ).toBe( 'p' );
			expect( values[ 2 ].item.data ).toBe( 'bar' );
			expect( values[ 3 ].item.name ).toBe( 'p' );
			expect( values[ 4 ].item.data ).toBe( 'xy' );
		} );
	} );

	describe( 'isFlat', () => {
		it( 'should be true if range start and range end are in same parent', () => {
			const range = getRange( '<p>f{oo}</p><p>bar</p>' );

			expect( range.isFlat ).toBe( true );
		} );

		it( 'should be false if range start and range end are in different parents', () => {
			const range = getRange( '<p>fo{o</p><p>b}ar</p>' );

			expect( range.isFlat ).toBe( false );
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return root element in which range is created', () => {
			const viewRoot = new ViewElement( document, 'div' );
			const range = getRange( '<p>f{oo</p><p>ba}r</p>', { rootElement: viewRoot } );

			expect( range.root ).toBe( viewRoot );
		} );

		it( 'should return document fragment in which range is created', () => {
			const viewFrag = new ViewDocumentFragment();
			const range = getRange( '<p>f{oo</p><p>ba}r</p>', { rootElement: viewFrag } );

			expect( range.root ).toBe( viewFrag );
		} );
	} );

	describe( 'getEnlarged', () => {
		it( 'case 1', () => {
			expect( enlarge( '<p>f<b>{oo}</b></p><p>bar</p>' ) )
				.toBe( '<p>f[<b>oo</b>]</p><p>bar</p>' );
		} );

		it( 'case 2', () => {
			expect( enlarge( '<p>f{oo}bar</p>' ) )
				.toBe( '<p>f{oo}bar</p>' );
		} );

		it( 'case 3', () => {
			expect( enlarge( '<p>f<span></span>{oo}<span></span>bar</p>' ) )
				.toBe( '<p>f[<span></span>oo<span></span>]bar</p>' );
		} );

		it( 'case 4', () => {
			expect( enlarge( '<p>f<img></img>{oo}<img></img>bar</p>' ) )
				.toBe( '<p>f<img></img>[oo]<img></img>bar</p>' );
		} );

		it( 'case 5', () => {
			expect( enlarge( '<p><b>f</b>{oo}<b><span></span>bar</b></p>' ) )
				.toBe( '<p><b>f[</b>oo<b><span></span>]bar</b></p>' );
		} );

		it( 'case6', () => {
			expect( enlarge( '<p>foo</p><p>[bar]</p><p>bom</p>' ) )
				.toBe( '<p>foo</p><p>[bar]</p><p>bom</p>' );
		} );

		function enlarge( data ) {
			data = data
				.replace( /<p>/g, '<container:p>' )
				.replace( /<\/p>/g, '</container:p>' )
				.replace( /<b>/g, '<attribute:b>' )
				.replace( /<\/b>/g, '</attribute:b>' )
				.replace( /<img><\/img>/g, '<empty:img></empty:img>' )
				.replace( /<span><\/span>/g, '<ui:span></ui:span>' );

			const viewFrag = new ViewDocumentFragment();
			const { view, selection } = _parseView( data, { rootElement: viewFrag } );
			const range = selection.getFirstRange();

			const enlargedRange = range.getEnlarged();

			return _stringifyView( view, enlargedRange );
		}
	} );

	describe( 'getTrimmed', () => {
		it( 'case 1', () => {
			expect( trim( '<p>f[<b>oo</b>]</p><p>bar</p>' ) )
				.toBe( '<p>f<b>{oo}</b></p><p>bar</p>' );
		} );

		it( 'case 2', () => {
			expect( trim( '<p>f{oo}bar</p>' ) )
				.toBe( '<p>f{oo}bar</p>' );
		} );

		it( 'case 3', () => {
			expect( trim( '<p>f[<span></span>oo<span></span>]bar</p>' ) )
				.toBe( '<p>f<span></span>{oo}<span></span>bar</p>' );
		} );

		it( 'case 4', () => {
			expect( trim( '<p>f<img></img>[oo]<img></img>bar</p>' ) )
				.toBe( '<p>f<img></img>{oo}<img></img>bar</p>' );
		} );

		it( 'case 5', () => {
			expect( trim( '<p><b>f[</b>oo<b><span></span>]bar</b></p>' ) )
				.toBe( '<p><b>f</b>{oo}<b><span></span>bar</b></p>' );
		} );

		it( 'case 6', () => {
			expect( trim( '<p>foo[</p><p>bar</p><p>]bom</p>' ) )
				.toBe( '<p>foo[</p><p>bar</p><p>]bom</p>' );
		} );

		it( 'case 7', () => {
			expect( trim( '<p>foo[<b><img></img></b>]bom</p>' ) )
				.toBe( '<p>foo<b>[<img></img>]</b>bom</p>' );
		} );

		// Other results may theoretically be correct too. It is not decided whether the trimmed range should
		// be collapsed in attribute element, at its start or its end. This is one of possible correct results
		// and we won't know for sure unless we have more cases. See https://github.com/ckeditor/ckeditor5-engine/issues/1058.
		it( 'case 8', () => {
			expect( trim( '<p>[<b></b>]</p>' ) )
				.toBe( '<p><b></b>[]</p>' );
		} );

		// As above.
		it( 'case 9', () => {
			expect( trim( '<p><b></b>[<b></b>]<b></b></p>' ) )
				.toBe( '<p><b></b><b></b><b></b>[]</p>' );
		} );

		// As above.
		it( 'case 10', () => {
			expect( trim( '<p>[<b></b><b></b>]</p>' ) )
				.toBe( '<p><b></b><b></b>[]</p>' );
		} );

		// As above.
		it( 'case 11', () => {
			expect( trim( '<p><b></b><b>[]</b><b></b></p>' ) )
				.toBe( '<p><b></b><b></b><b></b>[]</p>' );
		} );

		function trim( data ) {
			data = data
				.replace( /<p>/g, '<container:p>' )
				.replace( /<\/p>/g, '</container:p>' )
				.replace( /<b>/g, '<attribute:b>' )
				.replace( /<\/b>/g, '</attribute:b>' )
				.replace( /<img><\/img>/g, '<empty:img></empty:img>' )
				.replace( /<span><\/span>/g, '<ui:span></ui:span>' );

			const viewFrag = new ViewDocumentFragment();
			const { view, selection } = _parseView( data, { rootElement: viewFrag } );
			const range = selection.getFirstRange();

			const trimmedRange = range.getTrimmed();

			return _stringifyView( view, trimmedRange );
		}
	} );

	describe( 'isEqual', () => {
		it( 'should return true for the same range', () => {
			const start = new ViewPosition( {}, 1 );
			const end = new ViewPosition( {}, 2 );
			const range = new ViewRange( start, end );

			expect( range.isEqual( range ) ).toBe( true );
		} );

		it( 'should return true for ranges with same start and end positions', () => {
			const start = new ViewPosition( {}, 1 );
			const end = new ViewPosition( {}, 2 );
			const range1 = new ViewRange( start, end );
			const range2 = new ViewRange( start, end );

			expect( range1.isEqual( range2 ) ).toBe( true );
		} );

		it( 'should return false if start position is different', () => {
			const start1 = new ViewPosition( {}, 1 );
			const start2 = new ViewPosition( {}, 1 );
			const end = new ViewPosition( {}, 2 );
			const range1 = new ViewRange( start1, end );
			const range2 = new ViewRange( start2, end );

			expect( range1.isEqual( range2 ) ).toBe( false );
		} );

		it( 'should return false if end position is different', () => {
			const start = new ViewPosition( {}, 1 );
			const end1 = new ViewPosition( {}, 2 );
			const end2 = new ViewPosition( {}, 2 );
			const range1 = new ViewRange( start, end1 );
			const range2 = new ViewRange( start, end2 );

			expect( range1.isEqual( range2 ) ).toBe( false );
		} );

		it( 'should return false for ranges with same root and different offsets', () => {
			const mockObject = {};
			const range1 = new ViewRange( new ViewPosition( mockObject, 0 ), new ViewPosition( mockObject, 10 ) );
			const range2 = new ViewRange( new ViewPosition( mockObject, 2 ), new ViewPosition( mockObject, 10 ) );

			expect( range1.isEqual( range2 ) ).toBe( false );
		} );
	} );

	describe( 'containsPosition', () => {
		let viewRoot, range;

		beforeEach( () => {
			viewRoot = new ViewElement( document, 'div' );
			range = getRange( '<p>fo{o</p><p>bar</p><p>xy}z</p>', { rootElement: viewRoot } );
		} );

		it( 'should return false if position is before range', () => {
			const position = new ViewPosition( viewRoot.getChild( 0 ).getChild( 0 ), 1 ); // After "f".

			expect( range.containsPosition( position ) ).toBe( false );
		} );

		it( 'should return false if position is after range', () => {
			const position = new ViewPosition( viewRoot.getChild( 2 ).getChild( 0 ), 3 ); // After "z".

			expect( range.containsPosition( position ) ).toBe( false );
		} );

		it( 'should return true if position is inside range', () => {
			const position = new ViewPosition( viewRoot.getChild( 1 ).getChild( 0 ), 1 ); // After "b".

			expect( range.containsPosition( position ) ).toBe( true );
		} );
	} );

	describe( 'containsRange', () => {
		let viewRoot, range, beforeF, afterF, beforeB, afterX;

		beforeEach( () => {
			viewRoot = new ViewElement( document, 'div' );
			range = getRange( '<p>fo{o</p><p>bar</p><p>xy}z</p>', { rootElement: viewRoot } );

			beforeF = new ViewPosition( viewRoot.getChild( 0 ).getChild( 0 ), 0 );
			afterF = new ViewPosition( viewRoot.getChild( 0 ).getChild( 0 ), 1 );
			beforeB = new ViewPosition( viewRoot.getChild( 1 ).getChild( 0 ), 0 );
			afterX = new ViewPosition( viewRoot.getChild( 2 ).getChild( 0 ), 1 );
		} );

		it( 'should return false if ranges do not intersect', () => {
			const otherRange = new ViewRange( beforeF, afterF );

			expect( range.containsRange( otherRange ) ).toBe( false );
		} );

		it( 'should return false if ranges intersect but only partially', () => {
			const otherRange = new ViewRange( afterF, afterX );

			expect( range.containsRange( otherRange ) ).toBe( false );
		} );

		it( 'should return false if ranges are equal', () => {
			const otherRange = range.clone();

			expect( range.containsRange( otherRange ) ).toBe( false );
		} );

		it( 'should return true if given range is inside range', () => {
			const otherRange = new ViewRange( beforeB, afterX );

			expect( range.containsRange( otherRange ) ).toBe( true );
		} );

		it( 'should return true if ranges are equal and check is not strict', () => {
			const otherRange = range.clone();

			expect( range.containsRange( otherRange, true ) ).toBe( true );
		} );

		it( 'should return true if ranges start at the same position and check is not strict', () => {
			const otherRange = new ViewRange( range.start, afterX );

			expect( range.containsRange( otherRange, true ) ).toBe( true );
		} );

		it( 'should return true if ranges end at the same position and check is not strict', () => {
			const otherRange = new ViewRange( beforeB, range.end );

			expect( range.containsRange( otherRange, true ) ).toBe( true );
		} );

		it( 'should return false if given range is collapsed and starts or ends at another range boundary', () => {
			expect( range.containsRange( new ViewRange( range.start, range.start ) ) ).toBe( false );
			expect( range.containsRange( new ViewRange( range.end, range.end ) ) ).toBe( false );

			expect( range.containsRange( new ViewRange( range.start, range.start ), true ) ).toBe( false );
			expect( range.containsRange( new ViewRange( range.end, range.end ), true ) ).toBe( false );
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
			t1 = new ViewText( document, 'foo' );
			t2 = new ViewText( document, 'bar' );
			t3 = new ViewText( document, 'baz' );
			p1 = new ViewElement( document, 'p', null, [ t1, t2 ] );
			p2 = new ViewElement( document, 'p', null, t3 );
			root = new ViewElement( document, 'div', null, [ p1, p2 ] );
		} );

		describe( 'isIntersecting', () => {
			it( 'should return true if given range is equal', () => {
				const range = ViewRange._createFromParentsAndOffsets( t1, 0, t3, 2 );
				const otherRange = range.clone();
				expect( range.isIntersecting( otherRange ) ).toBe( true );
				expect( otherRange.isIntersecting( range ) ).toBe( true );
			} );

			it( 'should return true if given range contains this range', () => {
				const range = ViewRange._createFromParentsAndOffsets( t1, 0, t3, 3 );
				const otherRange = ViewRange._createFromParentsAndOffsets( p1, 1, t2, 2 );

				expect( range.isIntersecting( otherRange ) ).toBe( true );
				expect( otherRange.isIntersecting( range ) ).toBe( true );
			} );

			it( 'should return true if given range ends in this range', () => {
				const range = ViewRange._createFromParentsAndOffsets( root, 1, t3, 3 );
				const otherRange = ViewRange._createFromParentsAndOffsets( t1, 0, p2, 0 );

				expect( range.isIntersecting( otherRange ) ).toBe( true );
				expect( otherRange.isIntersecting( range ) ).toBe( true );
			} );

			it( 'should return true if given range starts in this range', () => {
				const range = ViewRange._createFromParentsAndOffsets( t1, 0, t2, 3 );
				const otherRange = ViewRange._createFromParentsAndOffsets( p1, 1, p2, 0 );

				expect( range.isIntersecting( otherRange ) ).toBe( true );
				expect( otherRange.isIntersecting( range ) ).toBe( true );
			} );

			it( 'should return false if given range is fully before/after this range', () => {
				const range = ViewRange._createFromParentsAndOffsets( t1, 0, t2, 3 );
				const otherRange = ViewRange._createFromParentsAndOffsets( root, 1, t3, 0 );

				expect( range.isIntersecting( otherRange ) ).toBe( false );
				expect( otherRange.isIntersecting( range ) ).toBe( false );
			} );

			it( 'should return false if ranges are in different roots', () => {
				const range = ViewRange._createFromParentsAndOffsets( t1, 0, t2, 3 );
				const otherRange = ViewRange._createFromParentsAndOffsets( new ViewElement( document, 'div' ), 1, t3, 0 );

				expect( range.isIntersecting( otherRange ) ).toBe( false );
				expect( otherRange.isIntersecting( range ) ).toBe( false );
			} );
		} );

		describe( 'getDifference', () => {
			it( 'should return range equal to original range if other range does not intersect with it', () => {
				const range = ViewRange._createFromParentsAndOffsets( t1, 0, t2, 3 );
				const otherRange = ViewRange._createFromParentsAndOffsets( root, 1, t3, 0 );
				const difference = range.getDifference( otherRange );

				expect( difference.length ).toBe( 1 );
				expect( difference[ 0 ].isEqual( range ) ).toBe( true );
			} );

			it( 'should return shrunken range if other range intersects with it', () => {
				const range = ViewRange._createFromParentsAndOffsets( root, 1, t3, 3 );
				const otherRange = ViewRange._createFromParentsAndOffsets( t1, 0, p2, 0 );
				const difference = range.getDifference( otherRange );

				expect( difference.length ).toBe( 1 );

				expect( difference[ 0 ].start.parent ).toBe( p2 );
				expect( difference[ 0 ].start.offset ).toBe( 0 );
				expect( difference[ 0 ].end.parent ).toBe( t3 );
				expect( difference[ 0 ].end.offset ).toBe( 3 );
			} );

			it( 'should return an empty array if other range contains or is same as the original range', () => {
				const range = ViewRange._createFromParentsAndOffsets( p1, 1, t2, 2 );
				const otherRange = ViewRange._createFromParentsAndOffsets( t1, 0, t3, 3 );
				const difference = range.getDifference( otherRange );

				expect( difference.length ).toBe( 0 );
			} );

			it( 'should two ranges if other range is contained by the original range', () => {
				const range = ViewRange._createFromParentsAndOffsets( t1, 0, t3, 3 );
				const otherRange = ViewRange._createFromParentsAndOffsets( p1, 1, t2, 2 );
				const difference = range.getDifference( otherRange );

				expect( difference.length ).toBe( 2 );

				expect( difference[ 0 ].start.parent ).toBe( t1 );
				expect( difference[ 0 ].start.offset ).toBe( 0 );
				expect( difference[ 0 ].end.parent ).toBe( p1 );
				expect( difference[ 0 ].end.offset ).toBe( 1 );

				expect( difference[ 1 ].start.parent ).toBe( t2 );
				expect( difference[ 1 ].start.offset ).toBe( 2 );
				expect( difference[ 1 ].end.parent ).toBe( t3 );
				expect( difference[ 1 ].end.offset ).toBe( 3 );
			} );
		} );

		describe( 'getIntersection', () => {
			it( 'should return range equal to original range if other range contains it', () => {
				const range = ViewRange._createFromParentsAndOffsets( t2, 0, t3, 0 );
				const otherRange = ViewRange._createFromParentsAndOffsets( t1, 1, t3, 1 );
				const intersection = range.getIntersection( otherRange );

				expect( intersection.isEqual( range ) ).toBe( true );
			} );

			it( 'should return range equal to other range if it is contained in original range', () => {
				const range = ViewRange._createFromParentsAndOffsets( t1, 1, t3, 1 );
				const otherRange = ViewRange._createFromParentsAndOffsets( t2, 0, t3, 0 );
				const intersection = range.getIntersection( otherRange );

				expect( intersection.isEqual( otherRange ) ).toBe( true );
			} );

			it( 'should return null if ranges do not intersect', () => {
				const range = ViewRange._createFromParentsAndOffsets( t1, 0, t2, 3 );
				const otherRange = ViewRange._createFromParentsAndOffsets( t3, 0, t3, 3 );
				const intersection = range.getIntersection( otherRange );

				expect( intersection ).toBeNull();
			} );

			it( 'should return common part if ranges intersect partially', () => {
				const range = ViewRange._createFromParentsAndOffsets( t1, 0, t2, 3 );
				const otherRange = ViewRange._createFromParentsAndOffsets( t2, 0, t3, 3 );
				const intersection = range.getIntersection( otherRange );

				expect( intersection.start.parent ).toBe( t2 );
				expect( intersection.start.offset ).toBe( 0 );
				expect( intersection.end.parent ).toBe( t2 );
				expect( intersection.end.offset ).toBe( 3 );
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

			expect( values.length ).toBe( 4 );
			expect( values[ 0 ].item.data ).toBe( 'o' );
			expect( values[ 1 ].item.name ).toBe( 'p' );
			expect( values[ 1 ].type ).toBe( 'elementEnd' );
			expect( values[ 2 ].item.name ).toBe( 'p' );
			expect( values[ 2 ].type ).toBe( 'elementStart' );
			expect( values[ 3 ].item.data ).toBe( 'ba' );
		} );

		it( 'should accept TreeWalker options', () => {
			const range = getRange( '<p>foo</p><p>b{ar</p><p>xy}z</p>' );
			const walker = range.getWalker( { singleCharacters: true, ignoreElementEnd: true } );
			const values = [];

			for ( const value of walker ) {
				values.push( value );
			}

			expect( walker ).toBeInstanceOf( ViewTreeWalker );
			expect( walker.singleCharacters ).toBe( true );

			expect( values.length ).toBe( 5 );
			expect( values[ 0 ].item.data ).toBe( 'a' );
			expect( values[ 1 ].item.data ).toBe( 'r' );
			expect( values[ 2 ].item.name ).toBe( 'p' );
			expect( values[ 3 ].item.data ).toBe( 'x' );
			expect( values[ 4 ].item.data ).toBe( 'y' );
		} );
	} );

	describe( 'getItems', () => {
		it( 'should return iterator that iterates over all view items in the range', () => {
			const range = getRange( '<p>fo{o</p><p>bar</p><p>xy}z</p>' );
			const nodes = [];

			for ( const node of range.getItems() ) {
				nodes.push( node );
			}

			expect( nodes.length ).toBe( 5 );
			expect( nodes[ 0 ].data ).toBe( 'o' );
			expect( nodes[ 1 ].name ).toBe( 'p' );
			expect( nodes[ 2 ].data ).toBe( 'bar' );
			expect( nodes[ 3 ].name ).toBe( 'p' );
			expect( nodes[ 4 ].data ).toBe( 'xy' );
		} );

		it( 'should accept TreeWalker options', () => {
			const range = getRange( '<p>foo</p><p>b{ar</p><p>xy}z</p>' );
			const nodes = [];

			for ( const node of range.getItems( { singleCharacters: true } ) ) {
				nodes.push( node );
			}

			expect( nodes.length ).toBe( 5 );
			expect( nodes[ 0 ].data ).toBe( 'a' );
			expect( nodes[ 1 ].data ).toBe( 'r' );
			expect( nodes[ 2 ].name ).toBe( 'p' );
			expect( nodes[ 3 ].data ).toBe( 'x' );
			expect( nodes[ 4 ].data ).toBe( 'y' );
		} );
	} );

	describe( 'getPositions', () => {
		it( 'should return iterator that iterates over all positions in the range', () => {
			const range = getRange( '<p>fo{o</p><p>b}ar</p><p>xyz</p>' );
			const positions = [];

			for ( const position of range.getPositions() ) {
				positions.push( position );
			}

			expect( positions.length ).toBe( 5 );

			expect( positions[ 0 ].parent.data ).toBe( 'foo' ); // Inside text node "foo".
			expect( positions[ 0 ].offset ).toBe( 2 );

			expect( positions[ 1 ].parent.name ).toBe( 'p' ); // At the end of the first P element.
			expect( positions[ 1 ].offset ).toBe( 1 );

			expect( positions[ 2 ].parent ).toBeInstanceOf( ViewDocumentFragment ); // In document fragment, between Ps.
			expect( positions[ 2 ].offset ).toBe( 1 );

			expect( positions[ 3 ].parent.name ).toBe( 'p' ); // At the beginning of the second P element.
			expect( positions[ 3 ].offset ).toBe( 0 );

			expect( positions[ 4 ].parent.data ).toBe( 'bar' ); // Inside text node "bar".
			expect( positions[ 4 ].offset ).toBe( 1 );
		} );

		it( 'should accept TreeWalker options', () => {
			const range = getRange( '<p>foo</p><p>b{ar</p><p>xy}z</p>' );
			const positions = [];

			for ( const position of range.getPositions( { singleCharacters: true } ) ) {
				positions.push( position );
			}

			expect( positions.length ).toBe( 7 );

			expect( positions[ 0 ].parent.data ).toBe( 'bar' ); // "b^ar".
			expect( positions[ 0 ].offset ).toBe( 1 );

			expect( positions[ 1 ].parent.data ).toBe( 'bar' ); // "ba^r".
			expect( positions[ 1 ].offset ).toBe( 2 );

			expect( positions[ 2 ].parent.name ).toBe( 'p' ); // <p>bar^</p> -- at the end of P node.
			expect( positions[ 2 ].offset ).toBe( 1 );

			expect( positions[ 3 ].parent ).toBeInstanceOf( ViewDocumentFragment ); // "</p>^<p>" -- between P nodes.
			expect( positions[ 3 ].offset ).toBe( 2 );

			expect( positions[ 4 ].parent.name ).toBe( 'p' ); // <p>^xyz</p> -- at the start of P node.
			expect( positions[ 4 ].offset ).toBe( 0 );

			expect( positions[ 5 ].parent.data ).toBe( 'xyz' ); // "x^yz".
			expect( positions[ 5 ].offset ).toBe( 1 );

			expect( positions[ 6 ].parent.data ).toBe( 'xyz' ); // "xy^z".
			expect( positions[ 6 ].offset ).toBe( 2 );
		} );
	} );

	describe( 'static constructors', () => {
		let div, p, foz;

		beforeEach( () => {
			foz = new ViewText( document, 'foz' );
			p = new ViewElement( document, 'p', null, foz );
			div = new ViewElement( document, 'div', null, p );
		} );

		describe( '_createIn', () => {
			it( 'should return range', () => {
				const range = ViewRange._createIn( p );

				expect( range.start.parent ).toEqual( p );
				expect( range.start.offset ).toEqual( 0 );
				expect( range.end.parent ).toEqual( p );
				expect( range.end.offset ).toEqual( 1 );
			} );
		} );

		describe( '_createOn', () => {
			it( 'should return range', () => {
				const range = ViewRange._createOn( p );

				expect( range.start.parent ).toBe( div );
				expect( range.start.offset ).toBe( 0 );
				expect( range.end.parent ).toBe( div );
				expect( range.end.offset ).toBe( 1 );
			} );

			it( 'should create a proper range on a text proxy', () => {
				const text = new ViewText( document, 'foobar' );
				const textProxy = new ViewTextProxy( text, 2, 3 );
				const range = ViewRange._createOn( textProxy );

				expect( range.start.parent ).toBe( text );
				expect( range.start.offset ).toBe( 2 );
				expect( range.end.parent ).toBe( text );
				expect( range.end.offset ).toBe( 5 );
			} );
		} );

		describe( '_createFromParentsAndOffsets', () => {
			it( 'should return range', () => {
				const range = ViewRange._createFromParentsAndOffsets( div, 0, foz, 1 );

				expect( range.start.parent ).toEqual( div );
				expect( range.start.offset ).toEqual( 0 );
				expect( range.end.parent ).toEqual( foz );
				expect( range.end.offset ).toEqual( 1 );
			} );
		} );

		describe( '_createFromPositionAndShift', () => {
			it( 'should make range from start position and offset', () => {
				const position = new ViewPosition( foz, 1 );
				const range = ViewRange._createFromPositionAndShift( position, 2 );

				expect( range ).toBeInstanceOf( ViewRange );
				expect( range.start.isEqual( position ) ).toBe( true );
				expect( range.end.parent ).toBe( foz );
				expect( range.end.offset ).toEqual( 3 );
			} );

			it( 'should accept negative shift value', () => {
				const position = new ViewPosition( foz, 3 );
				const range = ViewRange._createFromPositionAndShift( position, -1 );

				expect( range ).toBeInstanceOf( ViewRange );
				expect( range.end.isEqual( position ) ).toBe( true );
				expect( range.start.parent ).toBe( foz );
				expect( range.start.offset ).toEqual( 2 );
			} );
		} );
	} );

	describe( 'getCommonAncestor()', () => {
		it( 'should return common ancestor for positions from Range', () => {
			const foz = new ViewText( document, 'foz' );
			const bar = new ViewText( document, 'bar' );

			const li1 = new ViewElement( document, 'li', null, foz );
			const li2 = new ViewElement( document, 'li', null, bar );

			const ul = new ViewElement( document, 'ul', null, [ li1, li2 ] );

			const range = new ViewRange( new ViewPosition( li1, 0 ), new ViewPosition( li2, 2 ) );

			expect( range.getCommonAncestor() ).toBe( ul );
		} );
	} );

	describe( 'getContainedElement()', () => {
		it( 'should return an element when it is fully contained by the range', () => {
			const { selection, view } = _parseView( 'foo [<b>bar</b>] baz' );
			const range = selection.getFirstRange();
			const element = view.getChild( 1 );

			expect( range.getContainedElement() ).toBe( element );
		} );

		it( 'should return selected element if the range is anchored at the end/at the beginning of a text node', () => {
			const { selection, view } = _parseView( 'foo {<b>bar</b>} baz' );
			const range = selection.getFirstRange();
			const element = view.getChild( 1 );

			expect( range.getContainedElement() ).toBe( element );
		} );

		it( 'should return "null" if the selection is collapsed', () => {
			const { selection } = _parseView( 'foo []<b>bar</b> baz' );
			const range = selection.getFirstRange();

			expect( range.getContainedElement() ).toBeNull();
		} );

		it( 'should return "null" if it contains 2+ elements', () => {
			const { selection } = _parseView( 'foo [<b>bar</b><i>qux</i>] baz' );
			const range = selection.getFirstRange();

			expect( range.getContainedElement() ).toBeNull();
		} );

		it( 'should return "null" if the range spans over more than a single element', () => {
			const { selection } = _parseView( 'foo [<b>bar</b> ba}z' );
			const range = selection.getFirstRange();

			expect( range.getContainedElement() ).toBeNull();
		} );

		it( 'should return "null" if the range spans over a single text node', () => {
			const { selection } = _parseView( 'foo <b>{bar}</b> baz' );
			const range = selection.getFirstRange();

			expect( range.getContainedElement() ).toBeNull();
		} );
	} );
} );
