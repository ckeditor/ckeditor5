/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { getSelection, ShadowSelection } from '../../src/dom/getselection.js';
import { createSyntheticShadowRoot, reportRootNode } from '../_utils/syntheticshadowroot.js';

describe( 'getSelection()', () => {
	let host;

	beforeEach( () => {
		host = document.createElement( 'div' );
		document.body.appendChild( host );

		window.getSelection().removeAllRanges();

		// Reset the engine-global `getComposedRanges()` signature cache between tests, since they
		// simulate different engines.
		ShadowSelection._useLegacyComposedRanges = false;
	} );

	afterEach( () => {
		window.getSelection().removeAllRanges();
		host.remove();
	} );

	describe( 'light DOM', () => {
		it( 'returns the document selection', () => {
			const p = document.createElement( 'p' );
			const text = document.createTextNode( 'foobar' );

			p.appendChild( text );
			host.appendChild( p );

			const selection = window.getSelection();

			selection.setBaseAndExtent( text, 1, text, 4 );

			const result = getSelection( text );

			expect( result ).toBe( selection );
			expect( result.anchorNode ).toBe( text );
			expect( result.anchorOffset ).toBe( 1 );
			expect( result.focusNode ).toBe( text );
			expect( result.focusOffset ).toBe( 4 );
			expect( result.rangeCount ).toBe( 1 );
			expect( result.getRangeAt( 0 ).toString() ).toBe( 'oob' );
		} );

		it( 'returns null when given no nodes', () => {
			// Nothing to resolve the selection against – an editor with no editing root attached yet.
			expect( getSelection( [] ) ).toBe( null );
		} );

		it( 'returns null for a fully detached node', () => {
			// A detached node is not inside any document tree, so its root node is a plain element with no
			// browsing context and there is no selection to resolve.
			const detached = document.createElement( 'div' );

			expect( getSelection( detached ) ).toBe( null );
		} );

		it( 'returns null for a light-DOM node in a document with no browsing context', () => {
			// `createHTMLDocument()` has no window, so there is no selection to resolve.
			const detachedDocument = document.implementation.createHTMLDocument( 'test' );
			const text = detachedDocument.createTextNode( 'foobar' );

			detachedDocument.body.appendChild( text );

			expect( detachedDocument.defaultView ).toBe( null );
			expect( getSelection( text ) ).toBe( null );
		} );

		it( 'resolves from a later node when an earlier one is detached, rather than returning null', () => {
			// Regression guard: a disconnected first editing root must not poison resolution of the
			// still-attached roots (https://github.com/ckeditor/ckeditor5-commercial/pull/11359).
			const detached = document.createElement( 'div' );
			const attached = document.createTextNode( 'foobar' );

			document.body.appendChild( attached );
			window.getSelection().setBaseAndExtent( attached, 1, attached, 4 );

			const result = getSelection( [ detached, attached ] );

			expect( result ).toBe( window.getSelection() );
			expect( result.anchorNode ).toBe( attached );

			attached.remove();
		} );

		it( 'skips a node whose document has no browsing context and resolves from a later attached node', () => {
			// The first node belongs to a window-less document, so it yields no selection; resolution
			// continues to the next node instead of stopping at null.
			const detachedDocument = document.implementation.createHTMLDocument( 'test' );
			const noView = detachedDocument.createTextNode( 'foo' );
			const attached = document.createTextNode( 'foobar' );

			document.body.appendChild( attached );
			window.getSelection().setBaseAndExtent( attached, 1, attached, 4 );

			const result = getSelection( [ noView, attached ] );

			expect( result ).toBe( window.getSelection() );
			expect( result.anchorNode ).toBe( attached );

			attached.remove();
		} );

		it( 'returns null for a shadow root in a document with no browsing context', () => {
			// `createHTMLDocument()` has no window, so there is no selection to resolve.
			const detachedDocument = document.implementation.createHTMLDocument( 'test' );
			const detachedHost = detachedDocument.createElement( 'div' );

			detachedDocument.body.appendChild( detachedHost );

			const root = detachedHost.attachShadow( { mode: 'open' } );
			const text = detachedDocument.createTextNode( 'foobar' );

			root.appendChild( text );

			expect( detachedDocument.defaultView ).toBe( null );
			expect( getSelection( text ) ).toBe( null );
		} );
	} );

	// Resolving a selection made inside a shadow tree, open or closed – the reference to the root comes
	// from the node itself, so both work the same.
	for ( const mode of [ 'open', 'closed' ] ) {
		describe( `${ mode } shadow root`, () => {
			let root, text;

			beforeEach( () => {
				root = host.attachShadow( { mode } );

				const p = document.createElement( 'p' );

				text = document.createTextNode( 'foobar' );
				p.appendChild( text );
				root.appendChild( p );
			} );

			it( 'resolves selection endpoints inside the shadow tree, not the host', () => {
				window.getSelection().setBaseAndExtent( text, 1, text, 4 );

				const result = getSelection( text );

				expect( result.anchorNode ).toBe( text );
				expect( result.anchorOffset ).toBe( 1 );
				expect( result.focusNode ).toBe( text );
				expect( result.focusOffset ).toBe( 4 );
				expect( result.rangeCount ).toBe( 1 );
			} );

			it( 'builds a range that pierces into the shadow tree', () => {
				window.getSelection().setBaseAndExtent( text, 1, text, 4 );

				const range = getSelection( text ).getRangeAt( 0 );

				expect( range.startContainer ).toBe( text );
				expect( range.startOffset ).toBe( 1 );
				expect( range.toString() ).toBe( 'oob' );
			} );

			it( 'reports a backward selection', () => {
				window.getSelection().setBaseAndExtent( text, 4, text, 1 );

				const result = getSelection( text );

				expect( result.anchorNode ).toBe( text );
				expect( result.anchorOffset ).toBe( 4 );
				expect( result.focusNode ).toBe( text );
				expect( result.focusOffset ).toBe( 1 );
			} );
		} );
	}

	// The `getComposedRanges()` wrapper, which every current engine goes through.
	describe( 'getComposedRanges() view', () => {
		let root, text;

		beforeEach( () => {
			root = host.attachShadow( { mode: 'open' } );

			const p = document.createElement( 'p' );

			text = document.createTextNode( 'foobar' );
			p.appendChild( text );
			root.appendChild( p );

			// Keep the direction coming from the document selection alone, so that these tests do not
			// depend on what Blink's shadow-scoped selection reports (see the precedence tests below).
			root.getSelection = undefined;
		} );

		it( 'resolves selection endpoints inside the shadow tree', () => {
			window.getSelection().setBaseAndExtent( text, 1, text, 4 );

			const result = getSelection( text );

			expect( result.anchorNode ).toBe( text );
			expect( result.anchorOffset ).toBe( 1 );
			expect( result.focusNode ).toBe( text );
			expect( result.focusOffset ).toBe( 4 );
			expect( result.rangeCount ).toBe( 1 );
			expect( result.getRangeAt( 0 ).toString() ).toBe( 'oob' );
		} );

		it( 'reports a selection made outside the shadow tree, in the light DOM', () => {
			// The document is on the path out of the shadow root, so a selection in it is visible from the
			// given node. This is what lets an editing root in the light DOM be resolved next to one living
			// in a shadow tree.
			const outside = document.createTextNode( 'outside' );

			document.body.appendChild( outside );
			window.getSelection().setBaseAndExtent( outside, 0, outside, 3 );

			const result = getSelection( text );

			expect( result.rangeCount ).toBe( 1 );
			expect( result.anchorNode ).toBe( outside );
			expect( result.anchorOffset ).toBe( 0 );
			expect( result.focusOffset ).toBe( 3 );

			outside.remove();
		} );

		it( 'surfaces a light-DOM selection when resolving a mix of light-DOM and shadow nodes', () => {
			// Regression guard: with one node in a shadow tree and one in the light DOM, a caret in the
			// light-DOM node must still resolve. Dropping it here regressed selection in mixed multiroot
			// editors (https://github.com/ckeditor/ckeditor5-commercial/pull/11359).
			const outside = document.createTextNode( 'outside' );

			document.body.appendChild( outside );
			window.getSelection().setBaseAndExtent( outside, 0, outside, 3 );

			const result = getSelection( [ outside, text ] );

			expect( result.rangeCount ).toBe( 1 );
			expect( result.anchorNode ).toBe( outside );
			expect( result.anchorOffset ).toBe( 0 );
			expect( result.focusOffset ).toBe( 3 );

			outside.remove();
		} );

		it( 'drops a range that crosses the shadow boundary', () => {
			const outside = document.createTextNode( 'outside' );

			document.body.appendChild( outside );
			// Anchor in the light DOM, focus inside the shadow tree.
			window.getSelection().setBaseAndExtent( outside, 0, text, 3 );

			const result = getSelection( text );

			expect( result.rangeCount ).toBe( 0 );
			expect( result.anchorNode ).toBe( null );

			outside.remove();
		} );

		it( 'swaps anchor and focus for a backward selection (direction reported)', () => {
			// A programmatic `setBaseAndExtent()` reports `direction: 'backward'` (unlike a mouse
			// selection, which browsers report as `'none'` inside a shadow root).
			window.getSelection().setBaseAndExtent( text, 4, text, 1 );

			const result = getSelection( text );

			expect( result.anchorNode ).toBe( text );
			expect( result.anchorOffset ).toBe( 4 );
			expect( result.focusNode ).toBe( text );
			expect( result.focusOffset ).toBe( 1 );
		} );

		it( 'reports empty endpoints when there is no selection', () => {
			window.getSelection().removeAllRanges();

			const result = getSelection( text );

			expect( result.rangeCount ).toBe( 0 );
			expect( result.anchorNode ).toBe( null );
			expect( result.anchorOffset ).toBe( 0 );
			expect( result.focusNode ).toBe( null );
			expect( result.focusOffset ).toBe( 0 );
			expect( result.isCollapsed ).toBe( true );
		} );

		it( 'reports isCollapsed for a collapsed and a non-collapsed selection', () => {
			window.getSelection().setBaseAndExtent( text, 2, text, 2 );
			expect( getSelection( text ).isCollapsed ).toBe( true );

			window.getSelection().setBaseAndExtent( text, 1, text, 4 );
			expect( getSelection( text ).isCollapsed ).toBe( false );
		} );

		it( 'clears the selection via removeAllRanges()', () => {
			window.getSelection().setBaseAndExtent( text, 1, text, 4 );

			const result = getSelection( text );

			result.removeAllRanges();

			expect( result.rangeCount ).toBe( 0 );
			expect( window.getSelection().rangeCount ).toBe( 0 );
		} );

		it( 'sets the selection via setBaseAndExtent()', () => {
			getSelection( text ).setBaseAndExtent( text, 1, text, 4 );

			const result = getSelection( text );

			expect( result.anchorNode ).toBe( text );
			expect( result.anchorOffset ).toBe( 1 );
			expect( result.focusOffset ).toBe( 4 );
		} );

		it( 'collapses the selection via collapse()', () => {
			getSelection( text ).collapse( text, 2 );

			const result = getSelection( text );

			expect( result.rangeCount ).toBe( 1 );
			expect( result.anchorNode ).toBe( text );
			expect( result.anchorOffset ).toBe( 2 );
			expect( result.focusOffset ).toBe( 2 );
		} );

		it( 'grows the selection via extend()', () => {
			const result = getSelection( text );

			result.collapse( text, 1 );
			result.extend( text, 4 );

			expect( getSelection( text ).anchorOffset ).toBe( 1 );
			expect( getSelection( text ).focusNode ).toBe( text );
			expect( getSelection( text ).focusOffset ).toBe( 4 );
		} );

		it( 'adds a range via addRange()', () => {
			window.getSelection().removeAllRanges();

			const range = document.createRange();

			range.setStart( text, 1 );
			range.setEnd( text, 4 );

			getSelection( text ).addRange( range );

			const result = getSelection( text );

			expect( result.rangeCount ).toBe( 1 );
			expect( result.anchorNode ).toBe( text );
			expect( result.anchorOffset ).toBe( 1 );
			expect( result.focusOffset ).toBe( 4 );
		} );

		it( 'throws for an out-of-range getRangeAt() index, like the native selection', () => {
			window.getSelection().setBaseAndExtent( text, 1, text, 4 );

			expect( () => getSelection( text ).getRangeAt( 5 ) ).toThrowError( /out of range/ );
		} );

		it( 'treats the selection as forward when Selection#direction is unavailable', () => {
			// Browsers report `direction: 'none'` for a mouse selection inside a shadow root (and a future
			// engine could omit `direction` entirely); without a usable direction the orientation cannot
			// be recovered, so it defaults to forward (anchor = range start, focus = range end).
			const staticRange = { startContainer: text, startOffset: 1, endContainer: text, endOffset: 4, collapsed: false };
			const composedSelection = {
				// No `direction` property.
				removeAllRanges() {},
				getComposedRanges: () => [ staticRange ]
			};

			vi.stubGlobal( 'getSelection', () => composedSelection );

			const result = getSelection( text );

			expect( result.anchorNode ).toBe( text );
			expect( result.anchorOffset ).toBe( 1 );
			expect( result.focusNode ).toBe( text );
			expect( result.focusOffset ).toBe( 4 );
		} );

		it( 'calls getComposedRanges() with the legacy rest-parameter form when the dictionary form throws', () => {
			// Older Safari accepts only a `ShadowRoot` argument and throws a `TypeError` on the options
			// dictionary that the current spec uses.
			const staticRange = { startContainer: text, startOffset: 1, endContainer: text, endOffset: 4, collapsed: false };
			const composedSelection = {
				direction: 'forward',
				removeAllRanges() {},
				getComposedRanges( arg ) {
					if ( !( arg instanceof ShadowRoot ) ) {
						throw new TypeError( 'Argument is not a ShadowRoot.' );
					}

					return [ staticRange ];
				}
			};

			vi.stubGlobal( 'getSelection', () => composedSelection );

			const result = getSelection( text );

			expect( result.anchorNode ).toBe( text );
			expect( result.anchorOffset ).toBe( 1 );
			expect( result.focusNode ).toBe( text );
			expect( result.focusOffset ).toBe( 4 );
		} );

		it( 'probes the throwing dictionary form only once across repeated reads (legacy engine)', () => {
			// The rest-parameter signature is detected on the first read and reused, so the dictionary
			// form (which throws on such an engine) is not attempted again on every subsequent access.
			const staticRange = { startContainer: text, startOffset: 1, endContainer: text, endOffset: 4, collapsed: false };
			let dictionaryAttempts = 0;
			const composedSelection = {
				direction: 'forward',
				removeAllRanges() {},
				getComposedRanges( arg ) {
					if ( !( arg instanceof ShadowRoot ) ) {
						dictionaryAttempts++;

						throw new TypeError( 'Argument is not a ShadowRoot.' );
					}

					return [ staticRange ];
				}
			};

			vi.stubGlobal( 'getSelection', () => composedSelection );

			const result = getSelection( text );

			// Several reads on the same view instance.
			expect( result.anchorNode ).toBe( text );
			expect( result.focusNode ).toBe( text );
			expect( result.rangeCount ).toBe( 1 );
			expect( result.getRangeAt( 0 ).toString() ).toBe( 'oob' );

			expect( dictionaryAttempts ).toBe( 1 );
		} );
	} );

	// Regression guard for the future: a selection made inside a nested shadow tree is resolved by passing
	// only the innermost (closest) root — the node's own `getRootNode()`. The ancestor roots are
	// intentionally not collected. `getComposedRanges()` leaves the endpoints untouched because they already
	// live in the listed root, so this is enough. If a browser ever needs every ancestor root listed, these
	// fail and point back here.
	describe( 'nested shadow DOM (real browser)', () => {
		for ( const mode of [ 'open', 'closed' ] ) {
			it( `resolves a selection inside a nested ${ mode } shadow tree from the closest root only`, () => {
				const outerRoot = host.attachShadow( { mode } );
				const innerHost = document.createElement( 'div' );

				outerRoot.appendChild( innerHost );

				const innerRoot = innerHost.attachShadow( { mode } );
				const p = document.createElement( 'p' );
				const text = document.createTextNode( 'foobar' );

				p.appendChild( text );
				innerRoot.appendChild( p );

				window.getSelection().setBaseAndExtent( text, 1, text, 4 );

				const result = getSelection( text );

				expect( result.anchorNode ).toBe( text );
				expect( result.anchorOffset ).toBe( 1 );
				expect( result.focusNode ).toBe( text );
				expect( result.focusOffset ).toBe( 4 );
				expect( result.rangeCount ).toBe( 1 );
				expect( result.getRangeAt( 0 ).toString() ).toBe( 'oob' );

				// The endpoints pierce into the innermost tree, not any ancestor root or the host.
				expect( result.anchorNode.getRootNode() ).toBe( innerRoot );
			} );
		}
	} );

	// The shadow-tree branch is chosen purely by feature detection: `Selection#getComposedRanges()` when
	// available, otherwise Blink's shadow-scoped `ShadowRoot#getSelection()`, otherwise the document
	// selection. When the composed ranges are available, `ShadowRoot#getSelection()` is consulted only for
	// the selection direction (it covers a single tree, so it cannot pierce nesting).
	describe( 'shadow-tree API precedence (feature detection)', () => {
		let root, text;

		beforeEach( () => {
			root = host.attachShadow( { mode: 'open' } );

			const p = document.createElement( 'p' );

			text = document.createTextNode( 'foobar' );
			p.appendChild( text );
			root.appendChild( p );
		} );

		it( 'prefers Selection#getComposedRanges() over ShadowRoot#getSelection() when both exist', () => {
			// Chromium exposes both. The composed ranges win because they pierce every boundary between the
			// node and the document at once, while the shadow-scoped selection covers a single tree.
			root.getSelection = () => ( { label: 'shadow-root selection' } );

			window.getSelection().setBaseAndExtent( text, 1, text, 4 );

			const result = getSelection( text );

			expect( result ).toBeInstanceOf( ShadowSelection );
			expect( result.anchorNode ).toBe( text );
			expect( result.getRangeAt( 0 ).toString() ).toBe( 'oob' );
		} );

		it( 'uses Selection#getComposedRanges() when ShadowRoot#getSelection() is absent (Safari/Firefox)', () => {
			root.getSelection = undefined;

			window.getSelection().setBaseAndExtent( text, 1, text, 4 );

			const result = getSelection( text );

			// Resolved through the composed-ranges wrapper (pierces the shadow tree).
			expect( result.anchorNode ).toBe( text );
			expect( result.getRangeAt( 0 ).toString() ).toBe( 'oob' );
		} );

		it( 'takes the direction from ShadowRoot#getSelection() when the document selection reports none', () => {
			// Blink retargets a mouse selection made inside a shadow root to the host and reports the
			// document selection's direction as `'none'`; its shadow-scoped selection still knows it.
			const staticRange = { startContainer: text, startOffset: 1, endContainer: text, endOffset: 4, collapsed: false };

			root.getSelection = () => ( { direction: 'backward' } );

			vi.stubGlobal( 'getSelection', () => ( {
				direction: 'none',
				removeAllRanges() {},
				getComposedRanges: () => [ staticRange ]
			} ) );

			const result = getSelection( text );

			// Backward: the anchor is the end of the range and the focus is its start.
			expect( result.anchorNode ).toBe( text );
			expect( result.anchorOffset ).toBe( 4 );
			expect( result.focusNode ).toBe( text );
			expect( result.focusOffset ).toBe( 1 );
		} );

		it( 'recovers the direction geometrically when ShadowRoot#getSelection() reports none', () => {
			// A shadow-scoped selection can report `direction: 'none'` (a mouse selection inside a shadow
			// root) while still exposing shadow-piercing anchor and focus nodes. The orientation is then
			// derived from those positions instead of the unusable direction.
			const staticRange = { startContainer: text, startOffset: 1, endContainer: text, endOffset: 4, collapsed: false };

			root.getSelection = () => ( {
				direction: 'none',
				isCollapsed: false,
				anchorNode: text,
				anchorOffset: 4,
				focusNode: text,
				focusOffset: 1
			} );

			vi.stubGlobal( 'getSelection', () => ( {
				direction: 'none',
				removeAllRanges() {},
				getComposedRanges: () => [ staticRange ]
			} ) );

			const result = getSelection( text );

			// Backward: the anchor is the end of the range and the focus is its start.
			expect( result.anchorNode ).toBe( text );
			expect( result.anchorOffset ).toBe( 4 );
			expect( result.focusNode ).toBe( text );
			expect( result.focusOffset ).toBe( 1 );
		} );

		it( 'uses ShadowRoot#getSelection() when getComposedRanges() is unavailable (older Blink)', () => {
			// An older Blink exposed no `Selection#getComposedRanges()`, but its `ShadowRoot#getSelection()`
			// returns a shadow-scoped selection with shadow-piercing anchor and focus nodes, so it is used
			// directly.
			const shadowSelection = { anchorNode: text, anchorOffset: 1, focusNode: text, focusOffset: 4 };

			root.getSelection = () => shadowSelection;

			// The document selection exposes no `getComposedRanges()`.
			vi.stubGlobal( 'getSelection', () => ( { removeAllRanges() {} } ) );

			expect( getSelection( text ) ).toBe( shadowSelection );
		} );

		it( 'ignores an unanchored ShadowRoot#getSelection() and falls back to the document selection', () => {
			// A shadow-scoped selection with no `anchorNode` carries no usable position, so it is skipped in
			// favor of the document selection.
			const documentSelection = { label: 'document selection', removeAllRanges() {} };

			root.getSelection = () => ( { anchorNode: null } );
			vi.stubGlobal( 'getSelection', () => documentSelection );

			expect( getSelection( text ) ).toBe( documentSelection );
		} );

		it( 'falls back to the document selection when neither API is available (older Firefox)', () => {
			const documentSelection = { label: 'document selection', removeAllRanges() {} };

			expect( documentSelection.getComposedRanges ).toBeUndefined();

			root.getSelection = undefined;
			vi.stubGlobal( 'getSelection', () => documentSelection );

			expect( getSelection( text ) ).toBe( documentSelection );
		} );
	} );

	// The direction is resolved once to orient the endpoints and exposed as a getter, so consumers (for
	// example `DomConverter#isDomSelectionBackward()`) can read it instead of re-deriving it geometrically.
	describe( 'ShadowSelection#direction', () => {
		let root, text;

		beforeEach( () => {
			root = host.attachShadow( { mode: 'open' } );

			const p = document.createElement( 'p' );

			text = document.createTextNode( 'foobar' );
			p.appendChild( text );
			root.appendChild( p );

			// Keep the direction coming from the document selection alone unless a test opts in.
			root.getSelection = undefined;
		} );

		it( 'reports the direction of the underlying selection', () => {
			const staticRange = { startContainer: text, startOffset: 1, endContainer: text, endOffset: 4, collapsed: false };

			vi.stubGlobal( 'getSelection', () => ( {
				direction: 'backward',
				removeAllRanges() {},
				getComposedRanges: () => [ staticRange ]
			} ) );

			expect( getSelection( text ).direction ).toBe( 'backward' );
		} );

		it( 'reports none when there is no range in the shadow tree', () => {
			vi.stubGlobal( 'getSelection', () => ( {
				direction: 'forward',
				removeAllRanges() {},
				getComposedRanges: () => []
			} ) );

			expect( getSelection( text ).direction ).toBe( 'none' );
		} );

		it( 'recovers the direction geometrically when the shadow-scoped selection reports none', () => {
			const staticRange = { startContainer: text, startOffset: 1, endContainer: text, endOffset: 4, collapsed: false };

			root.getSelection = () => ( {
				direction: 'none',
				isCollapsed: false,
				anchorNode: text,
				anchorOffset: 4,
				focusNode: text,
				focusOffset: 1
			} );

			vi.stubGlobal( 'getSelection', () => ( {
				direction: 'none',
				removeAllRanges() {},
				getComposedRanges: () => [ staticRange ]
			} ) );

			expect( getSelection( text ).direction ).toBe( 'backward' );
		} );

		it( 'recovers a forward direction geometrically when the shadow-scoped selection reports none', () => {
			const staticRange = { startContainer: text, startOffset: 1, endContainer: text, endOffset: 4, collapsed: false };

			root.getSelection = () => ( {
				direction: 'none',
				isCollapsed: false,
				anchorNode: text,
				anchorOffset: 1,
				focusNode: text,
				focusOffset: 4
			} );

			vi.stubGlobal( 'getSelection', () => ( {
				direction: 'none',
				removeAllRanges() {},
				getComposedRanges: () => [ staticRange ]
			} ) );

			expect( getSelection( text ).direction ).toBe( 'forward' );
		} );
	} );
} );

describe( 'getSelection() in a synthetic shadow root', () => {
	let host, text;

	beforeEach( () => {
		const paragraph = document.createElement( 'p' );

		host = document.createElement( 'div' );
		text = document.createTextNode( 'foobar' );

		paragraph.appendChild( text );
		host.appendChild( paragraph );
		document.body.appendChild( host );

		window.getSelection().removeAllRanges();
		ShadowSelection._useLegacyComposedRanges = false;
	} );

	afterEach( () => {
		window.getSelection().removeAllRanges();
		host.remove();
	} );

	it( 'returns the document selection, which reads the real nodes for such a root', () => {
		reportRootNode( text, createSyntheticShadowRoot( host ) );

		window.getSelection().setBaseAndExtent( text, 1, text, 4 );

		const result = getSelection( text );

		expect( result ).toBe( window.getSelection() );
		expect( result.anchorNode ).toBe( text );
		expect( result.anchorOffset ).toBe( 1 );
		expect( result.focusNode ).toBe( text );
		expect( result.focusOffset ).toBe( 4 );
		expect( result.getRangeAt( 0 ).toString() ).toBe( 'oob' );
	} );

	it( 'does not wrap the selection in a ShadowSelection', () => {
		reportRootNode( text, createSyntheticShadowRoot( host ) );

		expect( getSelection( text ) ).not.toBeInstanceOf( ShadowSelection );
	} );

	it( 'ignores the synthetic root among real ones rather than failing for all of them', () => {
		const realHost = document.createElement( 'div' );
		const realRoot = realHost.attachShadow( { mode: 'closed' } );
		const realText = document.createTextNode( 'barbaz' );

		realRoot.appendChild( realText );
		host.appendChild( realHost );

		reportRootNode( text, createSyntheticShadowRoot( host ) );

		window.getSelection().setBaseAndExtent( realText, 0, realText, 3 );

		const result = getSelection( [ text, realText ] );

		expect( result ).toBeInstanceOf( ShadowSelection );
		expect( result.anchorNode ).toBe( realText );
		expect( result.focusOffset ).toBe( 3 );
	} );
} );
