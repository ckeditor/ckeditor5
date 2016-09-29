/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */
/* bender-tags: dom, browser-only */

import getAncestors from '/ckeditor5/utils/dom/getancestors.js';
import createElement from '/ckeditor5/utils/dom/createelement.js';

describe( 'getParents', () => {
	it( 'should return all parents of given node and the node itself, starting from top-most parent', () => {
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
		const div = createElement( document, 'div', {}, [ p1, p2 ] );

		expect( getAncestors( b ) ).to.deep.equal( [ div, p1, span, b ] );
	} );
} );
