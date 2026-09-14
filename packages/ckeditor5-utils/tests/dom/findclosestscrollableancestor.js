/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { findClosestScrollableAncestor } from '../../src/dom/findclosestscrollableancestor.js';
import { createElement } from '../../src/dom/createelement.js';

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

		expect( findClosestScrollableAncestor( b ) ).toBe( span );
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

		expect( findClosestScrollableAncestor( b ) ).toBe( p1 );
	} );

	it( 'works for both `auto` and `scroll` overflow-y values', () => {
		//  SPAN
		//    |- B
		const b = createElement( document, 'b' );
		const span = createElement( document, 'span', overflowAutoStyleAttribute, [ b ] );
		expect( findClosestScrollableAncestor( b ) ).toBe( span );

		//  SPAN
		//    |- B
		//  SPAN (2)
		//    |- B (2)
		const b2 = createElement( document, 'b' );
		const span2 = createElement( document, 'span', overflowScrollStyleAttribute, [ b2 ] );
		expect( findClosestScrollableAncestor( b2 ) ).toBe( span2 );
	} );

	it( 'returns null in if chosen element doeasn\'t have parent', () => {
		//  B
		const b = createElement( document, 'b' );
		expect( findClosestScrollableAncestor( b ) ).toBeNull();
	} );

	it( 'returns null in simple element tree without scrollable ancestors', () => {
		//  SPAN
		//    |- B
		const b = createElement( document, 'b' );
		createElement( document, 'span', {}, [ b ] );

		expect( findClosestScrollableAncestor( b ) ).toBeNull();
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

		expect( findClosestScrollableAncestor( b ) ).toBeNull();
	} );

	describe( 'shadow DOM', () => {
		for ( const mode of [ 'open', 'closed' ] ) {
			it( `finds a scrollable ancestor across one shadow boundary (mode: '${ mode }')`, () => {
				// DIV (overflow: auto)
				//  |- HOST
				//       (shadow root, mode: '${mode}')
				//         |- SPAN
				//             |- B
				const b = createElement( document, 'b' );
				const span = createElement( document, 'span', {}, [ b ] );
				const host = createElement( document, 'div' );
				const shadowRoot = host.attachShadow( { mode } );

				shadowRoot.appendChild( span );
				createElement( document, 'div', overflowAutoStyleAttribute, [ host ] );

				expect( findClosestScrollableAncestor( b ) ).toBe( host.parentElement );
			} );
		}

		it( 'finds a scrollable ancestor inside the same shadow root, without needing to cross out', () => {
			// HOST
			//   (shadow root)
			//     |- SPAN (overflow: auto)
			//         |- B
			const b = createElement( document, 'b' );
			const span = createElement( document, 'span', overflowAutoStyleAttribute, [ b ] );
			const host = createElement( document, 'div' );
			const shadowRoot = host.attachShadow( { mode: 'open' } );

			shadowRoot.appendChild( span );

			expect( findClosestScrollableAncestor( b ) ).toBe( span );
		} );

		it( 'crosses two nested shadow boundaries to find a scrollable ancestor', () => {
			// DIV (overflow: auto)
			//  |- OUTER-HOST
			//       (outer shadow root)
			//         |- INNER-HOST
			//              (inner shadow root)
			//                |- B
			const b = createElement( document, 'b' );
			const innerHost = createElement( document, 'div' );
			const innerShadowRoot = innerHost.attachShadow( { mode: 'open' } );

			innerShadowRoot.appendChild( b );

			const outerHost = createElement( document, 'div' );
			const outerShadowRoot = outerHost.attachShadow( { mode: 'open' } );

			outerShadowRoot.appendChild( innerHost );
			createElement( document, 'div', overflowAutoStyleAttribute, [ outerHost ] );

			expect( findClosestScrollableAncestor( b ) ).toBe( outerHost.parentElement );
		} );

		it( 'returns null when there is no scrollable ancestor even across shadow boundaries', () => {
			// DIV
			//  |- HOST
			//       (shadow root)
			//         |- SPAN
			//             |- B
			const b = createElement( document, 'b' );
			const span = createElement( document, 'span', {}, [ b ] );
			const host = createElement( document, 'div' );
			const shadowRoot = host.attachShadow( { mode: 'open' } );

			shadowRoot.appendChild( span );
			createElement( document, 'div', {}, [ host ] );

			expect( findClosestScrollableAncestor( b ) ).toBeNull();
		} );

		it( 'reaches the real <body> across a shadow boundary when nothing scrollable is found before it', () => {
			// <body>
			//  |- HOST
			//       (shadow root)
			//         |- B
			//
			// Mirrors the light-DOM behaviour of this function (walking up to a real `<body>` without finding
			// an `overflow: auto`/`scroll` ancestor returns `<body>` itself, per the loop condition below),
			// just reached this time via a shadow boundary instead of a plain `parentElement` chain.
			const b = createElement( document, 'b' );
			const host = createElement( document, 'div' );
			const shadowRoot = host.attachShadow( { mode: 'open' } );

			shadowRoot.appendChild( b );
			document.body.appendChild( host );

			try {
				expect( findClosestScrollableAncestor( b ) ).toBe( document.body );
			} finally {
				host.remove();
			}
		} );
	} );

	describe( 'slotted content', () => {
		it( 'finds the scrollable element of the shadow tree a slotted node renders in', () => {
			// HOST
			//  |- B                        (light DOM child, assigned to the slot below)
			//  |    (shadow root)
			//  |      |- DIV (overflow: auto)
			//  |          |- SLOT
			const b = createElement( document, 'b' );
			const host = createElement( document, 'div', {}, [ b ] );
			const frame = createElement( document, 'div', overflowAutoStyleAttribute, [
				createElement( document, 'slot' )
			] );

			host.attachShadow( { mode: 'open' } ).appendChild( frame );

			expect( findClosestScrollableAncestor( b ) ).toBe( frame );
		} );

		it( 'prefers the scrollable element the node renders in over one further out in the light DOM', () => {
			// DIV (overflow: auto)          <- further away in the flattened tree
			//  |- HOST
			//      |- B
			//         (shadow root)
			//           |- DIV (overflow: auto)   <- the answer
			//               |- SLOT
			const b = createElement( document, 'b' );
			const host = createElement( document, 'div', {}, [ b ] );
			const frame = createElement( document, 'div', overflowAutoStyleAttribute, [
				createElement( document, 'slot' )
			] );

			host.attachShadow( { mode: 'open' } ).appendChild( frame );
			createElement( document, 'div', overflowAutoStyleAttribute, [ host ] );

			expect( findClosestScrollableAncestor( b ) ).toBe( frame );
		} );

		it( 'walks through a plain element between the slot and the scrollable one', () => {
			const b = createElement( document, 'b' );
			const host = createElement( document, 'div', {}, [ b ] );
			const pad = createElement( document, 'div', {}, [ createElement( document, 'slot' ) ] );
			const frame = createElement( document, 'div', overflowAutoStyleAttribute, [ pad ] );

			host.attachShadow( { mode: 'open' } ).appendChild( frame );

			expect( findClosestScrollableAncestor( b ) ).toBe( frame );
		} );

		it( 'walks through a plain element between the assigned element and the node', () => {
			// The wrapper is what the slot assigns, so `assignedSlot` is null on the node itself and the walk
			// has to reach the wrapper before it can step into the shadow tree.
			const b = createElement( document, 'b' );
			const wrapper = createElement( document, 'div', {}, [ b ] );
			const host = createElement( document, 'div', {}, [ wrapper ] );
			const frame = createElement( document, 'div', overflowAutoStyleAttribute, [
				createElement( document, 'slot' )
			] );

			host.attachShadow( { mode: 'open' } ).appendChild( frame );

			expect( b.assignedSlot ).toBeNull();
			expect( findClosestScrollableAncestor( b ) ).toBe( frame );
		} );

		it( 'follows a slot assigned to an outer slot', () => {
			// OUTER-HOST
			//  |- MIDDLE-HOST
			//  |   |- B
			//  |      (middle shadow root)
			//  |        |- INNER-SLOT
			//     (outer shadow root)
			//       |- DIV (overflow: auto)
			//           |- OUTER-SLOT
			const b = createElement( document, 'b' );
			const middleHost = createElement( document, 'div', {}, [ b ] );
			const innerSlot = createElement( document, 'slot' );

			middleHost.attachShadow( { mode: 'open' } ).appendChild( innerSlot );

			const outerHost = createElement( document, 'div', {}, [ middleHost ] );
			const frame = createElement( document, 'div', overflowAutoStyleAttribute, [
				createElement( document, 'slot' )
			] );

			outerHost.attachShadow( { mode: 'open' } ).appendChild( frame );

			expect( findClosestScrollableAncestor( b ) ).toBe( frame );
		} );

		it( 'falls back to the node tree when the slot is in a closed root, which does not expose it', () => {
			// The scrollable element inside the closed root cannot be reached, so the light-DOM one answers.
			const b = createElement( document, 'b' );
			const host = createElement( document, 'div', {}, [ b ] );
			const frame = createElement( document, 'div', overflowAutoStyleAttribute, [
				createElement( document, 'slot' )
			] );

			host.attachShadow( { mode: 'closed' } ).appendChild( frame );

			const lightDomScrollable = createElement( document, 'div', overflowAutoStyleAttribute, [ host ] );

			expect( b.assignedSlot ).toBeNull();
			expect( findClosestScrollableAncestor( b ) ).toBe( lightDomScrollable );
		} );

		it( 'returns null when neither tree has a scrollable ancestor', () => {
			const b = createElement( document, 'b' );
			const host = createElement( document, 'div', {}, [ b ] );

			host.attachShadow( { mode: 'open' } ).appendChild(
				createElement( document, 'div', {}, [ createElement( document, 'slot' ) ] )
			);
			createElement( document, 'div', {}, [ host ] );

			expect( findClosestScrollableAncestor( b ) ).toBeNull();
		} );
	} );
} );
