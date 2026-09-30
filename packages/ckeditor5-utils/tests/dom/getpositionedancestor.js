/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getPositionedAncestor } from '../../src/dom/getpositionedancestor.js';

describe( 'getPositionedAncestor', () => {
	let element;

	beforeEach( () => {
		element = document.createElement( 'a' );

		document.body.appendChild( element );
	} );

	afterEach( () => {
		element.remove();
		document.body.style.position = '';
	} );

	it( 'should return null when there is no element', () => {
		expect( getPositionedAncestor() ).toBeNull();
	} );

	it( 'should return null when there is no positioned ancestor', () => {
		expect( getPositionedAncestor( element ) ).toBeNull();
	} );

	it( 'should not consider the passed element', () => {
		element.style.position = 'relative';

		expect( getPositionedAncestor( element ) ).toBeNull();
	} );

	it( 'should find the positioned ancestor (direct parent)', () => {
		const parent = document.createElement( 'div' );

		parent.appendChild( element );
		document.body.appendChild( parent );
		parent.style.position = 'absolute';

		expect( getPositionedAncestor( element ) ).toBe( parent );

		parent.remove();
	} );

	it( 'should find the positioned ancestor (far ancestor)', () => {
		const parentA = document.createElement( 'div' );
		const parentB = document.createElement( 'div' );

		parentB.appendChild( element );
		parentA.appendChild( parentB );
		document.body.appendChild( parentA );
		parentA.style.position = 'absolute';

		expect( getPositionedAncestor( element ) ).toBe( parentA );

		parentA.remove();
	} );

	it( 'should find an ancestor that establishes a containing block without being positioned', () => {
		const parent = document.createElement( 'div' );

		// A `transform` makes a `position: static` element the containing block of its absolutely positioned
		// descendants, so their coordinates are relative to its box. `filter`, `perspective`, containment and
		// several more do the same.
		parent.style.transform = 'translateX(10px)';
		parent.appendChild( element );
		document.body.appendChild( parent );

		expect( getPositionedAncestor( element ) ).toBe( parent );

		parent.remove();
	} );

	it( 'should find <body> when it establishes a containing block itself', () => {
		// `offsetParent` names `<body>` both when the body lays the element out and when nothing above the
		// element does, so a positioned body must not be mistaken for the initial containing block.
		document.body.style.position = 'relative';

		expect( getPositionedAncestor( element ) ).toBe( document.body );
	} );

	describe( 'shadow DOM', () => {
		let host;

		beforeEach( () => {
			host = document.createElement( 'div' );
			document.body.appendChild( host );
		} );

		afterEach( () => {
			host.remove();
		} );

		for ( const mode of [ 'open', 'closed' ] ) {
			describe( `${ mode } shadow root`, () => {
				it( 'crosses the shadow boundary to a positioned ancestor in the light DOM', () => {
					// DIV (position: relative)  <- light DOM
					//  |- DIV#host
					//     |- #shadow-root
					//        |- SPAN (element)
					const positioned = document.createElement( 'div' );

					positioned.style.position = 'relative';
					positioned.appendChild( host );
					document.body.appendChild( positioned );

					const shadowElement = document.createElement( 'span' );

					host.attachShadow( { mode } ).appendChild( shadowElement );

					expect( getPositionedAncestor( shadowElement ) ).toBe( positioned );

					positioned.remove();
				} );

				it( 'prefers a positioned ancestor inside the shadow root over one outside it', () => {
					const positioned = document.createElement( 'div' );

					positioned.style.position = 'relative';
					positioned.appendChild( host );
					document.body.appendChild( positioned );

					const innerPositioned = document.createElement( 'div' );
					const shadowElement = document.createElement( 'span' );

					innerPositioned.style.position = 'absolute';
					innerPositioned.appendChild( shadowElement );
					host.attachShadow( { mode } ).appendChild( innerPositioned );

					expect( getPositionedAncestor( shadowElement ) ).toBe( innerPositioned );

					positioned.remove();
				} );

				it( 'returns the host element when the host itself is positioned', () => {
					host.style.position = 'relative';

					const shadowElement = document.createElement( 'span' );

					host.attachShadow( { mode } ).appendChild( shadowElement );

					expect( getPositionedAncestor( shadowElement ) ).toBe( host );
				} );

				it( 'returns null when the nearest ancestor across the boundary is <body>', () => {
					const shadowElement = document.createElement( 'span' );

					host.attachShadow( { mode } ).appendChild( shadowElement );

					expect( getPositionedAncestor( shadowElement ) ).toBeNull();
				} );
			} );
		}
	} );

	it( 'should return null for a position: fixed element, which is laid out against the viewport', () => {
		const parent = document.createElement( 'div' );

		parent.style.position = 'relative';
		parent.appendChild( element );
		document.body.appendChild( parent );

		element.style.position = 'fixed';

		expect( getPositionedAncestor( element ) ).toBeNull();

		parent.remove();
	} );

	describe( 'slotted content', () => {
		let host, frame;

		beforeEach( () => {
			host = document.createElement( 'div' );
			document.body.appendChild( host );

			// The container component: a positioned frame wrapping its `<slot>`, the way a scrollable container
			// component does. It establishes the containing block for whatever renders inside the slot.
			frame = document.createElement( 'div' );
			frame.style.position = 'relative';
		} );

		afterEach( () => {
			host.remove();
		} );

		it( 'finds the positioned ancestor in the shadow tree the element is assigned to', () => {
			// DIV#host
			//  |- #shadow-root
			//  |  |- DIV.frame (position: relative)
			//  |     |- SLOT           <- SPAN renders here
			//  |- SPAN (element)       <- ... while staying a child of the host in the node tree
			frame.appendChild( document.createElement( 'slot' ) );
			host.attachShadow( { mode: 'open' } ).appendChild( frame );

			const slotted = document.createElement( 'span' );

			host.appendChild( slotted );

			expect( getPositionedAncestor( slotted ) ).toBe( frame );
		} );

		it( 'steps over a plain element sitting between the slot and the positioned ancestor', () => {
			const pad = document.createElement( 'div' );

			pad.appendChild( document.createElement( 'slot' ) );
			frame.appendChild( pad );
			host.attachShadow( { mode: 'open' } ).appendChild( frame );

			const slotted = document.createElement( 'span' );

			host.appendChild( slotted );

			expect( getPositionedAncestor( slotted ) ).toBe( frame );
		} );

		for ( const mode of [ 'open', 'closed' ] ) {
			it( `walks out of the element's own shadow root and into the one holding the slot (own root: '${ mode }')`, () => {
				// The composition an integrator ships: an editor component slotted into a container component. The
				// walk leaves the component's own root through its host, which needs no `assignedSlot`, so that
				// root is free to be closed.
				frame.appendChild( document.createElement( 'slot' ) );
				host.attachShadow( { mode: 'open' } ).appendChild( frame );

				const componentHost = document.createElement( 'div' );

				host.appendChild( componentHost );

				const inner = document.createElement( 'span' );

				componentHost.attachShadow( { mode } ).appendChild( inner );

				expect( getPositionedAncestor( inner ) ).toBe( frame );
			} );
		}

		it( 'prefers a positioned ancestor in the element\'s own tree over the one it is slotted into', () => {
			frame.appendChild( document.createElement( 'slot' ) );
			host.attachShadow( { mode: 'open' } ).appendChild( frame );

			const componentHost = document.createElement( 'div' );

			host.appendChild( componentHost );

			const innerPositioned = document.createElement( 'div' );
			const inner = document.createElement( 'span' );

			innerPositioned.style.position = 'absolute';
			innerPositioned.appendChild( inner );
			componentHost.attachShadow( { mode: 'open' } ).appendChild( innerPositioned );

			expect( getPositionedAncestor( inner ) ).toBe( innerPositioned );
		} );

		it( 'falls back to the node tree when the slot is in a closed root, which does not expose it', () => {
			const lightPositioned = document.createElement( 'div' );

			lightPositioned.style.position = 'relative';
			document.body.appendChild( lightPositioned );
			lightPositioned.appendChild( host );

			frame.appendChild( document.createElement( 'slot' ) );
			host.attachShadow( { mode: 'closed' } ).appendChild( frame );

			const slotted = document.createElement( 'span' );

			host.appendChild( slotted );

			// `Element#assignedSlot` is `null` for a slot in a closed root, so the walk never enters that root
			// and answers with the node-tree ancestor instead. A known limitation, not a regression.
			expect( getPositionedAncestor( slotted ) ).toBe( lightPositioned );

			lightPositioned.remove();
		} );

		it( 'returns null for a slotted element that is position: fixed', () => {
			frame.appendChild( document.createElement( 'slot' ) );
			host.attachShadow( { mode: 'open' } ).appendChild( frame );

			const slotted = document.createElement( 'span' );

			slotted.style.position = 'fixed';
			host.appendChild( slotted );

			expect( getPositionedAncestor( slotted ) ).toBeNull();
		} );

		it( 'finds a containing block established without positioning in the tree the element is assigned to', () => {
			frame.style.position = 'static';
			frame.style.transform = 'translateX(10px)';
			frame.appendChild( document.createElement( 'slot' ) );
			host.attachShadow( { mode: 'open' } ).appendChild( frame );

			const slotted = document.createElement( 'span' );

			host.appendChild( slotted );

			expect( getPositionedAncestor( slotted ) ).toBe( frame );
		} );

		it( 'asks the browser again past the slot, so an unpositioned containing block further up is found', () => {
			// `div.pad` between the slot and the frame is static and establishes nothing, so the lookup resumes
			// from it and the browser answers for the rest of the shadow tree – which is what keeps the
			// containing blocks it knows about, and this module does not enumerate, in play.
			const pad = document.createElement( 'div' );

			frame.style.position = 'static';
			frame.style.transform = 'translateX(10px)';

			pad.appendChild( document.createElement( 'slot' ) );
			frame.appendChild( pad );
			host.attachShadow( { mode: 'open' } ).appendChild( frame );

			const slotted = document.createElement( 'span' );

			host.appendChild( slotted );

			expect( getPositionedAncestor( slotted ) ).toBe( frame );
		} );

		it( 'keeps the browser\'s answer for a slot\'s own fallback content, which is not assigned anywhere', () => {
			// Fallback content is a child of the `<slot>` in the node tree and renders in that same place, so
			// its two trees agree and nothing has to be re-anchored.
			const slot = document.createElement( 'slot' );
			const fallback = document.createElement( 'span' );

			slot.appendChild( fallback );
			frame.appendChild( slot );
			host.attachShadow( { mode: 'open' } ).appendChild( frame );

			expect( fallback.assignedSlot ).toBe( null );
			expect( getPositionedAncestor( fallback ) ).toBe( frame );
		} );

		it( 'returns the slot itself when it is styled to lay the content out', () => {
			const slot = document.createElement( 'slot' );

			// A slot only generates a box once its `display: contents` default is overridden, and then a
			// `position` of its own makes it the box the assigned content resolves against.
			slot.style.display = 'block';
			slot.style.position = 'relative';

			frame.appendChild( slot );
			host.attachShadow( { mode: 'open' } ).appendChild( frame );

			const slotted = document.createElement( 'span' );

			host.appendChild( slotted );

			expect( getPositionedAncestor( slotted ) ).toBe( slot );
		} );

		it( 'ignores a position on the slot while it has no box of its own', () => {
			const slot = document.createElement( 'slot' );

			// `position` has no effect on a `display: contents` element, so the frame still lays the content out.
			slot.style.position = 'relative';

			frame.appendChild( slot );
			host.attachShadow( { mode: 'open' } ).appendChild( frame );

			const slotted = document.createElement( 'span' );

			host.appendChild( slotted );

			expect( getPositionedAncestor( slotted ) ).toBe( frame );
		} );

		it( 'follows a slot re-projected into another component\'s slot', () => {
			// A container component passing its own `<slot>` down into an inner one, which is how a component
			// built out of other components exposes a single content area. The element that lays the content
			// out then sits two shadow trees away, and only the slot chain leads to it.
			const inner = document.createElement( 'div' );
			const outerSlot = document.createElement( 'slot' );

			inner.appendChild( outerSlot );
			host.attachShadow( { mode: 'open' } ).appendChild( inner );

			frame.appendChild( document.createElement( 'slot' ) );
			inner.attachShadow( { mode: 'open' } ).appendChild( frame );

			const slotted = document.createElement( 'span' );

			host.appendChild( slotted );

			expect( outerSlot.assignedSlot ).not.toBe( null );
			expect( getPositionedAncestor( slotted ) ).toBe( frame );
		} );

		it( 'ignores properties the browser does not support when judging the element above the slot', () => {
			// On an engine without, say, `content-visibility`, there is no computed value to compare against
			// `visible`, and a missing value must not read as one that establishes a containing block – that
			// would make every wrapper lay the content out and stop the walk one element short of the frame.
			hideStyleProperties( [ 'contentVisibility', 'translate', 'rotate', 'scale', 'backdropFilter' ] );

			const pad = document.createElement( 'div' );

			pad.appendChild( document.createElement( 'slot' ) );
			frame.appendChild( pad );
			host.attachShadow( { mode: 'open' } ).appendChild( frame );

			const slotted = document.createElement( 'span' );

			host.appendChild( slotted );

			expect( getPositionedAncestor( slotted ) ).toBe( frame );
		} );
	} );

	describe( 'in an iframe', () => {
		let iframe, iframeDocument;

		beforeEach( () => {
			iframe = document.createElement( 'iframe' );
			document.body.appendChild( iframe );

			iframeDocument = iframe.contentDocument;
		} );

		afterEach( () => {
			iframe.remove();
		} );

		it( 'should return null when the nearest ancestor is the iframe document\'s own <body>', () => {
			const inner = iframeDocument.createElement( 'div' );

			iframeDocument.body.appendChild( inner );

			// An absolutely positioned element in a static body is laid out against the initial containing
			// block, not the body's box, so there is nothing to be relative to – in any document.
			expect( getPositionedAncestor( inner ) ).toBeNull();
		} );

		it( 'should find the iframe document\'s own <body> when it establishes a containing block itself', () => {
			const inner = iframeDocument.createElement( 'div' );

			iframeDocument.body.style.position = 'relative';
			iframeDocument.body.appendChild( inner );

			expect( getPositionedAncestor( inner ) ).toBe( iframeDocument.body );
		} );

		it( 'should find a positioned ancestor inside the iframe document', () => {
			const positioned = iframeDocument.createElement( 'div' );
			const inner = iframeDocument.createElement( 'div' );

			positioned.style.position = 'relative';
			positioned.appendChild( inner );
			iframeDocument.body.appendChild( positioned );

			expect( getPositionedAncestor( inner ) ).toBe( positioned );
		} );
	} );
} );

// Makes `getComputedStyle()` answer the way an engine that does not support the given properties would: with
// no value at all for them, and the real computed value for everything else.
function hideStyleProperties( names ) {
	const getComputedStyle = window.getComputedStyle.bind( window );

	vi.stubGlobal( 'getComputedStyle', ( element, pseudoElement ) => new Proxy(
		getComputedStyle( element, pseudoElement ),
		{
			get( styles, property ) {
				if ( names.includes( property ) ) {
					return undefined;
				}

				const value = styles[ property ];

				return typeof value == 'function' ? value.bind( styles ) : value;
			}
		}
	) );
}
