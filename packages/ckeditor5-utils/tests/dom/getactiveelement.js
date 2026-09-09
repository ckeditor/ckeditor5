/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { getActiveElement } from '../../src/dom/getactiveelement.js';

describe( 'getActiveElement()', () => {
	let host;

	beforeEach( () => {
		host = document.createElement( 'div' );
		document.body.appendChild( host );
	} );

	afterEach( () => {
		host.remove();
	} );

	describe( 'light DOM', () => {
		it( 'returns the focused element, not the node passed in', () => {
			const focusable = document.createElement( 'div' );
			const child = document.createElement( 'span' );

			focusable.tabIndex = -1;
			focusable.appendChild( child );
			host.appendChild( focusable );

			focusable.focus();

			expect( document.activeElement ).toBe( focusable );

			// Resolving a nested node returns the focused ancestor, not the node itself.
			expect( getActiveElement( child ) ).toBe( focusable );
		} );

		it( 'mirrors document.activeElement for a light-DOM node', () => {
			const input = document.createElement( 'input' );

			host.appendChild( input );
			input.focus();
			input.blur();

			expect( getActiveElement( host ) ).toBe( document.activeElement );
		} );

		it( 'returns null for a detached node whose root has no activeElement', () => {
			const detached = document.createElement( 'div' );
			const child = document.createElement( 'span' );

			detached.appendChild( child );

			expect( getActiveElement( child ) ).toBe( null );
		} );
	} );

	for ( const mode of [ 'open', 'closed' ] ) {
		describe( `${ mode } shadow root`, () => {
			it( 'resolves the focused element inside the shadow root, not its host or the node passed in', () => {
				const root = host.attachShadow( { mode } );
				const focusable = document.createElement( 'div' );
				const child = document.createElement( 'span' );

				focusable.tabIndex = -1;
				focusable.appendChild( child );
				root.appendChild( focusable );

				focusable.focus();

				// The document retargets the active element to the shadow host.
				expect( document.activeElement ).toBe( host );

				// The helper resolves the focused ancestor inside the shadow root, not the node itself.
				expect( getActiveElement( child ) ).toBe( focusable );
				expect( root.activeElement ).toBe( focusable );
			} );
		} );
	}
} );
