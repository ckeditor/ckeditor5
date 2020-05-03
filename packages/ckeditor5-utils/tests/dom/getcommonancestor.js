/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import getCommonAncestor from '../../src/dom/getcommonancestor';
import createElement from '../../src/dom/createelement';

describe( 'getParents', () => {
	let b, span1, span2, p1, p2, i, div;

	beforeEach( () => {
		// DIV
		//  |- P (1)
		//  |  |- SPAN (1)
		//  |  |  |- B
		//  |  |
		//  |  |- SPAN (2)
		//  |
		//  |- P (2)
		//     |- I
		b = createElement( document, 'b' );
		span1 = createElement( document, 'span', {}, [ b ] );
		span2 = createElement( document, 'span' );
		p1 = createElement( document, 'p', {}, [ span1, span2 ] );
		i = createElement( document, 'i' );
		p2 = createElement( document, 'p', {}, [ i ] );
		div = createElement( document, 'div', {}, [ p1, p2 ] );
	} );

	function testParents( a, b, lca ) {
		expect( getCommonAncestor( a, b ) ).to.equal( lca );
		expect( getCommonAncestor( b, a ) ).to.equal( lca );
	}

	it( 'should return lowest common ancestor of nodes in different tree branches', () => {
		testParents( p1, p2, div );
		testParents( span1, span2, p1 );
		testParents( b, span2, p1 );
		testParents( i, b, div );
	} );

	it( 'should return one of nodes if it is a parent of another node', () => {
		testParents( div, p1, div );
		testParents( p1, b, p1 );
	} );

	it( 'should return the node if both parameters are same', () => {
		testParents( div, div, div );
		testParents( b, b, b );
	} );

	it( 'should return null for nodes that do not have common ancestor (different trees)', () => {
		const diffB = createElement( document, 'b' );
		const diffDiv = createElement( document, 'div', {}, diffB );

		testParents( diffB, span1, null );
		testParents( diffDiv, p1, null );
	} );
} );
