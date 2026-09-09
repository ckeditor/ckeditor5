/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getPositionedAncestor } from '../../src/dom/getpositionedancestor.js';

describe( 'getPositionedAncestor', () => {
	let element;

	beforeEach( () => {
		element = document.createElement( 'a' );

		document.body.appendChild( element );
	} );

	afterEach( () => {
		element.remove();
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
} );
