/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import findClosestScrollableAncestor from '../../src/dom/findclosestscrollableancestor.js';
import createElement from '../../src/dom/createelement.js';

describe( 'findClosestScrollableAncestor', () => {
	const overflowAutoStyleAttribute = { style: 'overflow-y: auto;' };
	const overflowScrollStyleAttribute = { style: 'overflow-y: auto;' };

	it( 'returns parent if parent is scrollable', () => {
		// DIV
		//  |- P (1)
		//  |  |- SPAN (1)
		//  |     |- B
		//  |
		//  |- P (2)
		//     |- I
		const b = createElement( document, 'b' );
		const span = createElement( document, 'span', overflowAutoStyleAttribute, [ b ] );
		const p1 = createElement( document, 'p', {}, [ span ] );
		const p2 = createElement( document, 'p', {}, [ createElement( document, 'i' ) ] );
		createElement( document, 'div', {}, [ p1, p2 ] );

		expect( findClosestScrollableAncestor( b ) ).to.equal( span );
	} );

	it( 'returns first scrollable ancestor if there are many', () => {
		// DIV
		//  |- P (1)
		//  |  |- SPAN (1)
		//  |     |- B
		//  |
		//  |- P (2)
		//     |- I
		const b = createElement( document, 'b' );
		const span = createElement( document, 'span', {}, [ b ] );
		const p1 = createElement( document, 'p', overflowAutoStyleAttribute, [ span ] );
		const p2 = createElement( document, 'p', {}, [ createElement( document, 'i' ) ] );
		createElement( document, 'div', overflowAutoStyleAttribute, [ p1, p2 ] );

		expect( findClosestScrollableAncestor( b ) ).to.equal( p1 );
	} );

	it( 'works for both `auto` and `scroll` overflow-y values', () => {
		//  SPAN
		//    |- B
		const b = createElement( document, 'b' );
		const span = createElement( document, 'span', overflowAutoStyleAttribute, [ b ] );
		expect( findClosestScrollableAncestor( b ) ).to.equal( span );

		//  SPAN
		//    |- B
		//  SPAN (2)
		//    |- B (2)
		const b2 = createElement( document, 'b' );
		const span2 = createElement( document, 'span', overflowScrollStyleAttribute, [ b2 ] );
		expect( findClosestScrollableAncestor( b2 ) ).to.equal( span2 );
	} );

	it( 'returns null in if chosen element doeasn\'t have parent', () => {
		//  B
		const b = createElement( document, 'b' );
		expect( findClosestScrollableAncestor( b ) ).to.equal( null );
	} );

	it( 'returns null in simple element tree without scrollable ancestors', () => {
		//  SPAN
		//    |- B
		const b = createElement( document, 'b' );
		createElement( document, 'span', {}, [ b ] );

		expect( findClosestScrollableAncestor( b ) ).to.equal( null );
	} );

	it( 'returns null in complex element tree without scrollable ancestors', () => {
		// DIV
		//  |- P (1)
		//  |  |- SPAN (1)
		//  |     |- B
		//  |
		//  |- P (2)
		//     |- I
		const b = createElement( document, 'b' );
		const span = createElement( document, 'span', {}, [ b ] );
		const p1 = createElement( document, 'p', {}, [ span ] );
		const p2 = createElement( document, 'p', {}, [ createElement( document, 'i' ) ] );
		createElement( document, 'div', {}, [ p1, p2 ] );

		expect( findClosestScrollableAncestor( b ) ).to.equal( null );
	} );
} );
