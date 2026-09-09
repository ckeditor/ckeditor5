/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getElementFromPoint } from '../../src/dom/getelementfrompoint.js';
import { createSyntheticShadowRoot } from '../_utils/syntheticshadowroot.js';

describe( 'getElementFromPoint()', () => {
	const attachedNodes = [];
	const savedDescriptors = {};

	afterEach( () => {
		while ( attachedNodes.length ) {
			attachedNodes.pop().remove();
		}

		restoreDocumentMethod( 'caretPositionFromPoint' );
		restoreDocumentMethod( 'elementFromPoint' );
	} );

	describe( 'Document#elementFromPoint() path', () => {
		it( 'should resolve the element the point lands on', () => {
			const element = createElement( 'p' );

			stubDocumentMethod( 'elementFromPoint', () => element );

			expect( getElementFromPoint( 10, 11 ) ).toBe( element );
		} );

		it( 'should not consult the caret position when the hit test resolves', () => {
			const hitElement = createElement( 'p' );
			const caretPositionFromPoint = stubDocumentMethod(
				'caretPositionFromPoint',
				() => ( { offsetNode: createElement( 'section' ), offset: 0 } )
			);

			stubDocumentMethod( 'elementFromPoint', () => hitElement );

			expect( getElementFromPoint( 10, 11 ) ).toBe( hitElement );
			expect( caretPositionFromPoint ).not.toHaveBeenCalled();
		} );

		it( 'should return the resolved element as-is, without filtering it', () => {
			const element = createElement( 'section' );

			stubDocumentMethod( 'elementFromPoint', () => element );

			// The helper resolves the element the point lands on; narrowing the result is the caller's job.
			expect( getElementFromPoint( 10, 11 ) ).toBe( element );
		} );

		it( 'should hit-test the shadow roots before the document', () => {
			const shadowRoot = createShadowRoot();
			const elementInShadowRoot = createElement( 'p' );
			const elementInDocument = createElement( 'p' );

			shadowRoot.appendChild( elementInShadowRoot );

			const documentElementFromPoint = stubDocumentMethod( 'elementFromPoint', () => elementInDocument );
			vi.spyOn( shadowRoot, 'elementFromPoint' ).mockReturnValue( elementInShadowRoot );

			expect( getElementFromPoint( 10, 11, [ shadowRoot ] ) ).toBe( elementInShadowRoot );
			expect( documentElementFromPoint ).not.toHaveBeenCalled();
		} );

		it( 'should hit-test the document when the shadow roots resolve nothing', () => {
			const shadowRoot = createShadowRoot();
			const elementInDocument = createElement( 'p' );

			stubDocumentMethod( 'elementFromPoint', () => elementInDocument );
			vi.spyOn( shadowRoot, 'elementFromPoint' ).mockReturnValue( null );

			expect( getElementFromPoint( 10, 11, [ shadowRoot ] ) ).toBe( elementInDocument );
		} );

		it( 'should fall back to the caret position when such a root and the document both miss', () => {
			const shadowRoot = createShadowRoot();
			const caretElement = createElement( 'p' );

			shadowRoot.appendChild( caretElement );
			stubDocumentMethod( 'elementFromPoint', () => null );
			stubDocumentMethod( 'caretPositionFromPoint', () => ( { offsetNode: caretElement, offset: 0 } ) );

			const restoreShadowRoots = removeShadowRootElementFromPoint();

			try {
				expect( getElementFromPoint( 10, 11, [ shadowRoot ] ) ).toBe( caretElement );
			} finally {
				restoreShadowRoots();
			}
		} );

		it( 'should fall back to the caret position when the document only retargets to a skipped root host', () => {
			const shadowRoot = createShadowRoot();
			const caretElement = createElement( 'p' );

			shadowRoot.appendChild( caretElement );

			// The document cannot see into a shadow root: it reports a point that landed inside one as that
			// root's host. For a root that could not be hit tested itself, such a host says nothing about what
			// the point landed on inside it, so the caret position – which does pierce – gets to answer.
			stubDocumentMethod( 'elementFromPoint', () => shadowRoot.host );
			stubDocumentMethod( 'caretPositionFromPoint', () => ( { offsetNode: caretElement, offset: 0 } ) );

			const restoreShadowRoots = removeShadowRootElementFromPoint();

			try {
				expect( getElementFromPoint( 10, 11, [ shadowRoot ] ) ).toBe( caretElement );
			} finally {
				restoreShadowRoots();
			}
		} );

		it( 'should answer with the host of a root that was hit tested and did not claim the point', () => {
			const shadowRoot = createShadowRoot();
			const caretPositionFromPoint = stubDocumentMethod(
				'caretPositionFromPoint',
				() => ( { offsetNode: createElement( 'p' ), offset: 0 } )
			);

			// The root was hit tested and resolved nothing, so its host is the topmost element at the point –
			// the point landed on the host itself, beside the root's content – and the caret is not consulted.
			vi.spyOn( shadowRoot, 'elementFromPoint' ).mockReturnValue( null );
			stubDocumentMethod( 'elementFromPoint', () => shadowRoot.host );

			expect( getElementFromPoint( 10, 11, [ shadowRoot ] ) ).toBe( shadowRoot.host );
			expect( caretPositionFromPoint ).not.toHaveBeenCalled();
		} );

		it( 'should skip a root that retargets the hit to a node living outside it and try the next root', () => {
			const missRoot = createShadowRoot();
			const hitRoot = createShadowRoot();
			const elementInHitRoot = createElement( 'p' );

			hitRoot.appendChild( elementInHitRoot );

			// The point lands in `hitRoot`, but the earlier `missRoot` retargets it to a light-DOM node (its
			// host) instead of resolving nothing – as a real `ShadowRoot#elementFromPoint()` does. That stolen
			// hit must be discarded so the lookup continues to the root the element actually lives in.
			vi.spyOn( missRoot, 'elementFromPoint' ).mockReturnValue( missRoot.host );
			vi.spyOn( hitRoot, 'elementFromPoint' ).mockReturnValue( elementInHitRoot );

			expect( getElementFromPoint( 10, 11, [ missRoot, hitRoot ] ) ).toBe( elementInHitRoot );
		} );
	} );

	describe( 'Document#caretPositionFromPoint() substitute', () => {
		// The caret position stands in for the root hit test on an engine without the spec-orphaned
		// `ShadowRoot#elementFromPoint()`, so every test here removes it and supplies a root to pierce. The
		// document hit test is stubbed empty so that a caret result is not shadowed by a light-DOM hit.
		let shadowRoot, restoreShadowRoots;

		beforeEach( () => {
			stubDocumentMethod( 'elementFromPoint', () => null );

			shadowRoot = createShadowRoot();
			restoreShadowRoots = removeShadowRootElementFromPoint();
		} );

		afterEach( () => {
			restoreShadowRoots();
		} );

		it( 'should resolve an element offset node returned at the point', () => {
			const element = createElement( 'p' );

			shadowRoot.appendChild( element );
			stubDocumentMethod( 'caretPositionFromPoint', () => ( { offsetNode: element, offset: 0 } ) );

			expect( getElementFromPoint( 10, 11, [ shadowRoot ] ) ).toBe( element );
		} );

		it( 'should resolve a text offset node to its parent element', () => {
			const element = createElement( 'p' );
			const text = document.createTextNode( 'foo' );

			element.appendChild( text );
			shadowRoot.appendChild( element );
			stubDocumentMethod( 'caretPositionFromPoint', () => ( { offsetNode: text, offset: 1 } ) );

			expect( getElementFromPoint( 10, 11, [ shadowRoot ] ) ).toBe( element );
		} );

		it( 'should pass the shadow roots it is allowed to pierce into', () => {
			const caretPositionFromPoint = stubDocumentMethod(
				'caretPositionFromPoint',
				() => ( { offsetNode: createElement( 'p' ), offset: 0 } )
			);

			getElementFromPoint( 10, 11, [ shadowRoot ] );

			expect( caretPositionFromPoint ).toHaveBeenCalledWith( 10, 11, { shadowRoots: [ shadowRoot ] } );
		} );

		it( 'should not be consulted for a point in the light DOM, which needs no piercing', () => {
			const caretPositionFromPoint = stubDocumentMethod(
				'caretPositionFromPoint',
				() => ( { offsetNode: createElement( 'p' ), offset: 0 } )
			);

			expect( getElementFromPoint( 10, 11 ) ).toBeNull();
			expect( caretPositionFromPoint ).not.toHaveBeenCalled();
		} );

		it( 'should discard a caret retargeted to a supplied shadow host', () => {
			// An engine ignoring the shadowRoots option retargets the point to the host instead of piercing.
			// Such a hit says nothing about what is inside the root, so it must not be returned.
			stubDocumentMethod( 'caretPositionFromPoint', () => ( { offsetNode: shadowRoot.host, offset: 0 } ) );

			expect( getElementFromPoint( 10, 11, [ shadowRoot ] ) ).toBeNull();
		} );

		it( 'should discard a caret resolved to a non-element node', () => {
			// A shadow root as the offset node is a document fragment, not an element.
			stubDocumentMethod( 'caretPositionFromPoint', () => ( { offsetNode: shadowRoot, offset: 0 } ) );

			expect( getElementFromPoint( 10, 11, [ shadowRoot ] ) ).toBeNull();
		} );

		it( 'should return null when caretPositionFromPoint() is unavailable', () => {
			stubDocumentMethod( 'caretPositionFromPoint', undefined );

			expect( getElementFromPoint( 10, 11, [ shadowRoot ] ) ).toBeNull();
		} );

		it( 'should return null when nothing is found at the point', () => {
			stubDocumentMethod( 'caretPositionFromPoint', () => null );

			expect( getElementFromPoint( 10, 11, [ shadowRoot ] ) ).toBeNull();
		} );
	} );

	describe( 'light DOM (real browser hit-testing)', () => {
		it( 'should resolve an element at a point in the light DOM with no shadow roots', () => {
			const paragraph = createElement( 'p', 'plain light DOM text' );

			paragraph.style.cssText = 'position: absolute; top: 50px; left: 20px; font-size: 24px;';
			document.body.appendChild( paragraph );
			attachedNodes.push( paragraph );

			const rect = paragraph.getBoundingClientRect();
			const target = getElementFromPoint( Math.round( rect.left + 10 ), Math.round( rect.top + rect.height / 2 ) );

			expect( target ).toBe( paragraph );
		} );
	} );

	describe( 'nested shadow DOM (real browser hit-testing)', () => {
		for ( const mode of [ 'open', 'closed' ] ) {
			it( `should fall back to the caret position for a nested ${ mode } root that cannot be hit tested`, () => {
				const { innerRoot, element } = createNestedShadowElement( mode );
				const rect = element.getBoundingClientRect();
				const x = Math.round( rect.left + 8 );
				const y = Math.round( rect.top + rect.height / 2 );

				// Without `ShadowRoot#elementFromPoint()` the document is the only hit test left, and it
				// retargets a point inside nested roots out to the *outermost* host – not to the passed root's
				// own host. Such a hit must still be recognized as blind to the root, so that the caret
				// position, which pierces, gets to answer.
				const restoreShadowRoots = removeShadowRootElementFromPoint();

				try {
					expect( getElementFromPoint( x, y, [ innerRoot ] ) ).toBe( element );
				} finally {
					restoreShadowRoots();
				}
			} );

			it( `should resolve an element in a nested ${ mode } shadow tree when passed only the closest root`, () => {
				const { innerRoot, element } = createNestedShadowElement( mode );
				const rect = element.getBoundingClientRect();
				const x = Math.round( rect.left + 8 );
				const y = Math.round( rect.top + rect.height / 2 );

				// Regression guard for the future: only the innermost (closest) shadow root is passed — the
				// ancestor roots are intentionally omitted. Both lookups retarget outwards no further than the
				// nearest listed root, so this is enough. If a browser ever needs every ancestor root listed,
				// this fails and points back here.
				const target = getElementFromPoint( x, y, [ innerRoot ] );

				expect( target ).toBe( element );
				expect( target.getRootNode() ).toBe( innerRoot );
			} );
		}
	} );

	describe( 'sibling shadow DOM (real browser hit-testing)', () => {
		for ( const mode of [ 'open', 'closed' ] ) {
			it( `should resolve an element in a later ${ mode } root, not steal the hit with an earlier one`, () => {
				// Two sibling shadow trees, one per editable, as in a multi-root editor. The point lands in the
				// second root, but its root is passed after the first. A real `ShadowRoot#elementFromPoint()` on
				// the first root retargets that point to a light-DOM node (the second root's host) rather than
				// resolving nothing, so a first-non-null-wins lookup would return that host and miss the element.
				const first = createSiblingShadowElement( mode, 60 );
				const second = createSiblingShadowElement( mode, 160 );
				const rect = second.element.getBoundingClientRect();
				const x = Math.round( rect.left + 8 );
				const y = Math.round( rect.top + rect.height / 2 );

				// The retargeting hazard lives in the hit test, which resolves the point first anyway. The caret
				// fallback is stubbed out so that a regression surfaces here instead of being papered over by it.
				stubDocumentMethod( 'caretPositionFromPoint', () => null );

				const target = getElementFromPoint( x, y, [ first.root, second.root ] );

				expect( target ).toBe( second.element );
				expect( target.getRootNode() ).toBe( second.root );
			} );
		}
	} );

	// Simulates an engine without the spec-orphaned `ShadowRoot#elementFromPoint()`. Returns a function that
	// puts it back. The method is an own property of `ShadowRoot.prototype` – WebIDL flattens the members of the
	// `DocumentOrShadowRoot` mixin onto every interface including it – so deleting it there leaves the roots
	// without it. Should an engine ever place it elsewhere, the deletion is a no-op and the tests using this
	// fail on their assertions rather than silently passing.
	function removeShadowRootElementFromPoint() {
		const descriptor = Object.getOwnPropertyDescriptor( ShadowRoot.prototype, 'elementFromPoint' );

		delete ShadowRoot.prototype.elementFromPoint;

		return () => {
			if ( descriptor ) {
				Object.defineProperty( ShadowRoot.prototype, 'elementFromPoint', descriptor );
			}
		};
	}

	function stubDocumentMethod( name, implementation ) {
		if ( !( name in savedDescriptors ) ) {
			savedDescriptors[ name ] = Object.getOwnPropertyDescriptor( document, name ) || null;
		}

		const value = implementation === undefined ? undefined : vi.fn( implementation );

		Object.defineProperty( document, name, { value, configurable: true, writable: true } );

		return value;
	}

	function restoreDocumentMethod( name ) {
		if ( !( name in savedDescriptors ) ) {
			return;
		}

		const descriptor = savedDescriptors[ name ];

		if ( descriptor ) {
			Object.defineProperty( document, name, descriptor );
		} else {
			delete document[ name ];
		}

		delete savedDescriptors[ name ];
	}

	function createShadowRoot( mode = 'open' ) {
		const host = createElement( 'div' );

		document.body.appendChild( host );
		attachedNodes.push( host );

		return host.attachShadow( { mode } );
	}

	function createNestedShadowElement( mode ) {
		const outerHost = createElement( 'div' );

		document.body.appendChild( outerHost );
		attachedNodes.push( outerHost );

		const innerHost = createElement( 'div' );

		outerHost.attachShadow( { mode } ).appendChild( innerHost );

		const innerRoot = innerHost.attachShadow( { mode } );
		const element = createElement( 'div', 'nested shadow text' );

		element.style.cssText = 'position: absolute; top: 80px; left: 20px; font-size: 24px; white-space: nowrap;';
		innerRoot.appendChild( element );

		return { innerRoot, element };
	}

	function createSiblingShadowElement( mode, top ) {
		const host = createElement( 'div' );

		host.style.cssText = `position: absolute; left: 20px; top: ${ top }px; width: 200px; height: 40px;`;
		document.body.appendChild( host );
		attachedNodes.push( host );

		const root = host.attachShadow( { mode } );
		const element = createElement( 'div', 'sibling shadow text' );

		element.style.cssText = 'width: 100%; height: 100%; font-size: 20px; white-space: nowrap;';
		root.appendChild( element );

		return { root, element };
	}

	function createElement( name, text ) {
		const element = document.createElement( name );

		if ( text ) {
			element.textContent = text;
		}

		return element;
	}
} );

describe( 'getElementFromPoint() with a synthetic shadow root', () => {
	let host, paragraph;

	beforeEach( () => {
		host = document.createElement( 'div' );
		paragraph = document.createElement( 'p' );

		paragraph.textContent = 'foobar';
		host.appendChild( paragraph );
		document.body.appendChild( host );
	} );

	afterEach( () => {
		host.remove();
	} );

	it( 'resolves the point through the document instead of piercing the root', () => {
		const syntheticRoot = createSyntheticShadowRoot( host );
		const rect = paragraph.getBoundingClientRect();

		const element = getElementFromPoint(
			Math.round( rect.left + 4 ),
			Math.round( rect.top + rect.height / 2 ),
			[ syntheticRoot ]
		);

		expect( element ).toBe( paragraph );
	} );
} );
