/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DomEmitterMixin } from '../../src/dom/emittermixin.js';

import {
	ShadowRootRegistry,
	listenToShadowRoots,
	listenToEventRoots
} from '../../src/dom/shadowrootregistry.js';

describe( 'ShadowRootRegistry', () => {
	let registry, elementsToRemove;

	beforeEach( () => {
		registry = new ShadowRootRegistry();
		elementsToRemove = [];
	} );

	afterEach( () => {
		for ( const element of elementsToRemove ) {
			element.remove();
		}
	} );

	// Creates a shadow host connected to `document.body` (removed automatically in `afterEach`), attaches a
	// shadow root to it, and appends `node` (a fresh `<div>` by default) directly into that root.
	function createConnectedShadowNode( { mode = 'open', node = document.createElement( 'div' ) } = {} ) {
		const host = document.createElement( 'div' );
		const shadowRoot = host.attachShadow( { mode } );

		shadowRoot.appendChild( node );
		document.body.appendChild( host );

		elementsToRemove.push( host );

		return { host, shadowRoot, node };
	}

	describe( 'getShadowRoots()', () => {
		it( 'returns an empty set when nothing is registered', () => {
			expect( registry.getShadowRoots().size ).toBe( 0 );
		} );

		it( 'returns a fresh snapshot, so mutating it does not affect the registry', () => {
			const { shadowRoot, node } = createConnectedShadowNode();

			registry.registerNode( node );

			const snapshot = registry.getShadowRoots();

			snapshot.clear();

			expect( registry.getShadowRoots() ).toEqual( new Set( [ shadowRoot ] ) );
		} );
	} );

	describe( 'getEventRoots()', () => {
		// Creates an iframe connected to `document.body` (removed automatically in `afterEach`) and returns its document.
		function createIframeDocument() {
			const iframe = document.createElement( 'iframe' );

			document.body.appendChild( iframe );
			elementsToRemove.push( iframe );

			return iframe.contentDocument;
		}

		it( 'returns an empty set when nothing is registered', () => {
			expect( registry.getEventRoots().size ).toBe( 0 );
		} );

		it( 'returns the global document for a registered node in the light DOM', () => {
			const element = document.createElement( 'div' );

			document.body.appendChild( element );
			elementsToRemove.push( element );

			registry.registerNode( element );

			expect( registry.getEventRoots() ).toEqual( new Set( [ document ] ) );
		} );

		it( 'returns the shadow root and the global document for a registered node in a shadow root', () => {
			const { shadowRoot, node } = createConnectedShadowNode();

			registry.registerNode( node );

			expect( registry.getEventRoots() ).toEqual( new Set( [ shadowRoot, document ] ) );
		} );

		it( 'returns the iframe document, but not the global one, for a registered node in an iframe', () => {
			const iframeDocument = createIframeDocument();
			const element = document.createElement( 'div' );

			iframeDocument.body.appendChild( element );
			registry.registerNode( element );

			expect( registry.getEventRoots() ).toEqual( new Set( [ iframeDocument ] ) );
		} );

		it( 'returns the union of the event roots of nodes living in different documents', () => {
			const iframeDocument = createIframeDocument();
			const iframeElement = document.createElement( 'div' );
			const { shadowRoot, node } = createConnectedShadowNode();

			iframeDocument.body.appendChild( iframeElement );
			registry.registerNode( iframeElement );
			registry.registerNode( node );

			expect( registry.getEventRoots() ).toEqual( new Set( [ iframeDocument, shadowRoot, document ] ) );
		} );

		it( 'returns nothing for a registered node that is detached', () => {
			const host = document.createElement( 'div' );
			const shadowRoot = host.attachShadow( { mode: 'open' } );
			const node = document.createElement( 'div' );

			shadowRoot.appendChild( node );
			registry.registerNode( node );

			expect( registry.getEventRoots().size ).toBe( 0 );
		} );

		it( 'does not include documents in #getShadowRoots()', () => {
			const iframeDocument = createIframeDocument();
			const element = document.createElement( 'div' );
			const { shadowRoot, node } = createConnectedShadowNode();

			iframeDocument.body.appendChild( element );
			registry.registerNode( element );
			registry.registerNode( node );

			expect( registry.getShadowRoots() ).toEqual( new Set( [ shadowRoot ] ) );
		} );

		it( 'returns a fresh snapshot, so mutating it does not affect the registry', () => {
			const { shadowRoot, node } = createConnectedShadowNode();

			registry.registerNode( node );
			registry.getEventRoots().clear();

			expect( registry.getEventRoots() ).toEqual( new Set( [ shadowRoot, document ] ) );
		} );
	} );

	describe( 'changeEventRoots event', () => {
		let changeSpy;

		beforeEach( () => {
			changeSpy = vi.fn();
			registry.on( 'changeEventRoots', changeSpy );
		} );

		function createIframeDocument() {
			const iframe = document.createElement( 'iframe' );

			document.body.appendChild( iframe );
			elementsToRemove.push( iframe );

			return iframe.contentDocument;
		}

		it( 'is fired once when a node in an iframe is registered, without firing "add" for the iframe document', () => {
			const iframeDocument = createIframeDocument();
			const element = document.createElement( 'div' );
			const addSpy = vi.fn();

			iframeDocument.body.appendChild( element );
			registry.on( 'add', addSpy );
			registry.registerNode( element );

			expect( changeSpy ).toHaveBeenCalledOnce();
			expect( addSpy ).not.toHaveBeenCalled();
		} );

		it( 'is fired once, after "add", when a node in a shadow root is registered', () => {
			const { node } = createConnectedShadowNode();
			const events = [];

			registry.on( 'add', () => events.push( 'add' ) );
			registry.on( 'changeEventRoots', () => events.push( 'changeEventRoots' ) );
			registry.registerNode( node );

			expect( events ).toEqual( [ 'add', 'changeEventRoots' ] );
		} );

		it( 'is not fired when a registered node adds no new event root', () => {
			const { shadowRoot, node } = createConnectedShadowNode();
			const otherNode = document.createElement( 'div' );

			shadowRoot.appendChild( otherNode );
			registry.registerNode( node );
			changeSpy.mockClear();

			registry.registerNode( otherNode );

			expect( changeSpy ).not.toHaveBeenCalled();
		} );

		it( 'is not fired when a detached node is registered', () => {
			registry.registerNode( document.createElement( 'div' ) );

			expect( changeSpy ).not.toHaveBeenCalled();
		} );

		it( 'is fired once, without firing "remove" for the iframe document, when the only node in an iframe is unregistered', () => {
			const iframeDocument = createIframeDocument();
			const element = document.createElement( 'div' );
			const removeSpy = vi.fn();

			iframeDocument.body.appendChild( element );
			registry.registerNode( element );
			changeSpy.mockClear();

			registry.on( 'remove', removeSpy );
			registry.unregisterNode( element );

			expect( changeSpy ).toHaveBeenCalledOnce();
			expect( removeSpy ).not.toHaveBeenCalled();
			expect( registry.getEventRoots().size ).toBe( 0 );
		} );

		it( 'is fired once by #refresh() when a registered node moved from the global document into an iframe', () => {
			const iframeDocument = createIframeDocument();
			const element = document.createElement( 'div' );

			document.body.appendChild( element );
			elementsToRemove.push( element );
			registry.registerNode( element );
			changeSpy.mockClear();

			iframeDocument.body.appendChild( element );
			registry.refresh();

			expect( changeSpy ).toHaveBeenCalledOnce();
			expect( registry.getEventRoots() ).toEqual( new Set( [ iframeDocument ] ) );
		} );

		it( 'is not fired by #refresh() when no registered node moved', () => {
			const { node } = createConnectedShadowNode();

			registry.registerNode( node );
			changeSpy.mockClear();

			registry.refresh();

			expect( changeSpy ).not.toHaveBeenCalled();
		} );

		it( 'is fired once by #destroy() when event roots were tracked', () => {
			const iframeDocument = createIframeDocument();
			const element = document.createElement( 'div' );
			const { node } = createConnectedShadowNode();

			iframeDocument.body.appendChild( element );
			registry.registerNode( element );
			registry.registerNode( node );
			changeSpy.mockClear();

			registry.destroy();

			expect( changeSpy ).toHaveBeenCalledOnce();
		} );

		it( 'is not fired by #destroy() when nothing was tracked', () => {
			registry.destroy();

			expect( changeSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'registerNode()', () => {
		it( 'does not add anything for a node that lives in the light DOM', () => {
			const addSpy = vi.fn();
			const element = document.createElement( 'div' );

			document.body.appendChild( element );
			elementsToRemove.push( element );

			registry.on( 'add', addSpy );
			registry.registerNode( element );

			expect( registry.getShadowRoots().size ).toBe( 0 );
			expect( addSpy ).not.toHaveBeenCalled();
		} );

		it( 'adds the shadow root of a connected node immediately and fires "add"', () => {
			const { shadowRoot, node } = createConnectedShadowNode();
			const addSpy = vi.fn();

			registry.on( 'add', addSpy );
			registry.registerNode( node );

			expect( registry.getShadowRoots() ).toEqual( new Set( [ shadowRoot ] ) );
			expect( addSpy ).toHaveBeenCalledTimes( 1 );
			expect( addSpy.mock.calls[ 0 ][ 1 ] ).toBe( shadowRoot );
		} );

		it( 'adds every shadow root a nested node lives in, innermost and outermost alike', () => {
			const innerHost = document.createElement( 'div' );
			const innerShadowRoot = innerHost.attachShadow( { mode: 'open' } );
			const node = document.createElement( 'div' );

			innerShadowRoot.appendChild( node );

			const { shadowRoot: outerShadowRoot } = createConnectedShadowNode( { node: innerHost } );

			registry.registerNode( node );

			expect( registry.getShadowRoots() ).toEqual( new Set( [ innerShadowRoot, outerShadowRoot ] ) );
		} );

		it( 'works the same for a closed shadow root', () => {
			const { shadowRoot, node } = createConnectedShadowNode( { mode: 'closed' } );

			registry.registerNode( node );

			expect( registry.getShadowRoots() ).toEqual( new Set( [ shadowRoot ] ) );
		} );

		it( 'queues a node whose shadow tree is not attached to the document, adding nothing yet', () => {
			const host = document.createElement( 'div' );
			const shadowRoot = host.attachShadow( { mode: 'open' } );
			const node = document.createElement( 'div' );

			shadowRoot.appendChild( node );

			const addSpy = vi.fn();

			registry.on( 'add', addSpy );
			registry.registerNode( node );

			expect( registry.getShadowRoots().size ).toBe( 0 );
			expect( addSpy ).not.toHaveBeenCalled();
		} );

		it( 'resolves a previously queued node once #refresh() is called after it gets attached', () => {
			const host = document.createElement( 'div' );
			const shadowRoot = host.attachShadow( { mode: 'open' } );
			const node = document.createElement( 'div' );

			shadowRoot.appendChild( node );
			registry.registerNode( node );

			document.body.appendChild( host );
			elementsToRemove.push( host );

			const addSpy = vi.fn();

			registry.on( 'add', addSpy );
			registry.refresh();

			expect( registry.getShadowRoots() ).toEqual( new Set( [ shadowRoot ] ) );
			expect( addSpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does not fire "add" again for a root two different nodes are both hosted in', () => {
			const { shadowRoot, node: firstNode } = createConnectedShadowNode();
			const secondNode = document.createElement( 'div' );

			shadowRoot.appendChild( secondNode );

			registry.registerNode( firstNode );

			const addSpy = vi.fn();

			registry.on( 'add', addSpy );
			registry.registerNode( secondNode );

			expect( addSpy ).not.toHaveBeenCalled();
			expect( registry.getShadowRoots() ).toEqual( new Set( [ shadowRoot ] ) );
		} );

		it( 'is a no-op when called again for an already resolved node, even if it moved to another shadow root', () => {
			const { shadowRoot: firstShadowRoot, node } = createConnectedShadowNode();
			const { shadowRoot: secondShadowRoot } = createConnectedShadowNode();

			registry.registerNode( node );

			secondShadowRoot.appendChild( node );
			registry.registerNode( node );

			expect( registry.getShadowRoots() ).toEqual( new Set( [ firstShadowRoot ] ) );
		} );
	} );

	describe( 'unregisterNode()', () => {
		it( 'removes the shadow root and fires "remove" when it was the only node hosted in it', () => {
			const { shadowRoot, node } = createConnectedShadowNode();

			registry.registerNode( node );

			const removeSpy = vi.fn();

			registry.on( 'remove', removeSpy );
			registry.unregisterNode( node );

			expect( registry.getShadowRoots().size ).toBe( 0 );
			expect( removeSpy ).toHaveBeenCalledTimes( 1 );
			expect( removeSpy.mock.calls[ 0 ][ 1 ] ).toBe( shadowRoot );
		} );

		it( 'keeps the shadow root listed as long as another node is still hosted in it', () => {
			const { shadowRoot, node: firstNode } = createConnectedShadowNode();
			const secondNode = document.createElement( 'div' );

			shadowRoot.appendChild( secondNode );

			registry.registerNode( firstNode );
			registry.registerNode( secondNode );

			const removeSpy = vi.fn();

			registry.on( 'remove', removeSpy );
			registry.unregisterNode( firstNode );

			expect( removeSpy ).not.toHaveBeenCalled();
			expect( registry.getShadowRoots() ).toEqual( new Set( [ shadowRoot ] ) );

			registry.unregisterNode( secondNode );

			expect( removeSpy ).toHaveBeenCalledTimes( 1 );
			expect( registry.getShadowRoots().size ).toBe( 0 );
		} );

		it( 'silently drops a still-queued node without ever resolving or firing "remove" for it', () => {
			const host = document.createElement( 'div' );
			const shadowRoot = host.attachShadow( { mode: 'open' } );
			const node = document.createElement( 'div' );

			shadowRoot.appendChild( node );
			registry.registerNode( node );
			registry.unregisterNode( node );

			document.body.appendChild( host );
			elementsToRemove.push( host );

			const addSpy = vi.fn();

			registry.on( 'add', addSpy );
			registry.refresh();

			expect( addSpy ).not.toHaveBeenCalled();
			expect( registry.getShadowRoots().size ).toBe( 0 );
		} );

		it( 'does not throw for a node that was never registered', () => {
			const element = document.createElement( 'div' );

			expect( () => registry.unregisterNode( element ) ).not.toThrow();
		} );
	} );

	describe( 'refresh()', () => {
		it( 'does nothing and does not throw when there are no queued nodes', () => {
			const addSpy = vi.fn();

			registry.on( 'add', addSpy );

			expect( () => registry.refresh() ).not.toThrow();
			expect( addSpy ).not.toHaveBeenCalled();
		} );

		it( 'leaves a node queued if it is still detached', () => {
			const host = document.createElement( 'div' );
			const shadowRoot = host.attachShadow( { mode: 'open' } );
			const node = document.createElement( 'div' );

			shadowRoot.appendChild( node );
			registry.registerNode( node );
			registry.refresh();

			expect( registry.getShadowRoots().size ).toBe( 0 );

			// The node resolves on a later refresh, once actually attached — proving it was only skipped
			// above, not dropped.
			document.body.appendChild( host );
			elementsToRemove.push( host );
			registry.refresh();

			expect( registry.getShadowRoots() ).toEqual( new Set( [ shadowRoot ] ) );
		} );

		it( 'fires "add" only once for a root shared by several queued nodes resolved in the same call', () => {
			const host = document.createElement( 'div' );
			const shadowRoot = host.attachShadow( { mode: 'open' } );
			const firstNode = document.createElement( 'div' );
			const secondNode = document.createElement( 'div' );

			shadowRoot.appendChild( firstNode );
			shadowRoot.appendChild( secondNode );

			registry.registerNode( firstNode );
			registry.registerNode( secondNode );

			document.body.appendChild( host );
			elementsToRemove.push( host );

			const addSpy = vi.fn();

			registry.on( 'add', addSpy );
			registry.refresh();

			expect( addSpy ).toHaveBeenCalledTimes( 1 );
			expect( registry.getShadowRoots() ).toEqual( new Set( [ shadowRoot ] ) );
		} );

		it( 'follows a resolved node that moved from one shadow root to another', () => {
			const { shadowRoot: firstShadowRoot, node } = createConnectedShadowNode();
			const { shadowRoot: secondShadowRoot } = createConnectedShadowNode();

			registry.registerNode( node );

			const addSpy = vi.fn();
			const removeSpy = vi.fn();

			registry.on( 'add', addSpy );
			registry.on( 'remove', removeSpy );

			secondShadowRoot.appendChild( node );
			registry.refresh();

			expect( registry.getShadowRoots() ).toEqual( new Set( [ secondShadowRoot ] ) );
			expect( removeSpy ).toHaveBeenCalledTimes( 1 );
			expect( removeSpy.mock.calls[ 0 ][ 1 ] ).toBe( firstShadowRoot );
			expect( addSpy ).toHaveBeenCalledTimes( 1 );
			expect( addSpy.mock.calls[ 0 ][ 1 ] ).toBe( secondShadowRoot );
		} );

		it( 'picks up a resolved node that moved from the light DOM into a shadow root', () => {
			const node = document.body.appendChild( document.createElement( 'div' ) );

			elementsToRemove.push( node );
			registry.registerNode( node );

			expect( registry.getShadowRoots().size ).toBe( 0 );

			const addSpy = vi.fn();

			registry.on( 'add', addSpy );

			const { shadowRoot } = createConnectedShadowNode( { node } );

			registry.refresh();

			expect( registry.getShadowRoots() ).toEqual( new Set( [ shadowRoot ] ) );
			expect( addSpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'drops a resolved node that moved out of its shadow root into the light DOM', () => {
			const { shadowRoot, node } = createConnectedShadowNode();

			registry.registerNode( node );

			const removeSpy = vi.fn();

			registry.on( 'remove', removeSpy );

			document.body.appendChild( node );
			elementsToRemove.push( node );
			registry.refresh();

			expect( registry.getShadowRoots().size ).toBe( 0 );
			expect( removeSpy ).toHaveBeenCalledTimes( 1 );
			expect( removeSpy.mock.calls[ 0 ][ 1 ] ).toBe( shadowRoot );
		} );

		it( 'drops a resolved node that has been detached since', () => {
			const { node } = createConnectedShadowNode();

			registry.registerNode( node );

			const removeSpy = vi.fn();

			registry.on( 'remove', removeSpy );

			node.remove();
			registry.refresh();

			expect( registry.getShadowRoots().size ).toBe( 0 );
			expect( removeSpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'keeps the shadow root and fires nothing when no registered node moved', () => {
			const { shadowRoot, node } = createConnectedShadowNode();

			registry.registerNode( node );

			const addSpy = vi.fn();
			const removeSpy = vi.fn();

			registry.on( 'add', addSpy );
			registry.on( 'remove', removeSpy );

			registry.refresh();
			registry.refresh();

			expect( registry.getShadowRoots() ).toEqual( new Set( [ shadowRoot ] ) );
			expect( addSpy ).not.toHaveBeenCalled();
			expect( removeSpy ).not.toHaveBeenCalled();
		} );

		it( 'keeps a shadow root that another registered node is still hosted in when one moves out', () => {
			const { shadowRoot, node: stayingNode } = createConnectedShadowNode();
			const movingNode = shadowRoot.appendChild( document.createElement( 'div' ) );

			registry.registerNode( stayingNode );
			registry.registerNode( movingNode );

			const removeSpy = vi.fn();

			registry.on( 'remove', removeSpy );

			document.body.appendChild( movingNode );
			elementsToRemove.push( movingNode );
			registry.refresh();

			expect( registry.getShadowRoots() ).toEqual( new Set( [ shadowRoot ] ) );
			expect( removeSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'does nothing and does not throw on a registry with nothing registered', () => {
			const removeSpy = vi.fn();

			registry.on( 'remove', removeSpy );

			expect( () => registry.destroy() ).not.toThrow();

			expect( removeSpy ).not.toHaveBeenCalled();
			expect( registry.getShadowRoots().size ).toBe( 0 );
		} );

		it( 'clears every tracked root and fires "remove" for each', () => {
			const { shadowRoot: firstShadowRoot, node: firstNode } = createConnectedShadowNode();
			const { shadowRoot: secondShadowRoot, node: secondNode } = createConnectedShadowNode();

			registry.registerNode( firstNode );
			registry.registerNode( secondNode );

			const removeSpy = vi.fn();

			registry.on( 'remove', removeSpy );
			registry.destroy();

			expect( registry.getShadowRoots().size ).toBe( 0 );
			expect( removeSpy ).toHaveBeenCalledTimes( 2 );

			const removedRoots = removeSpy.mock.calls.map( call => call[ 1 ] );
			expect( removedRoots ).toEqual( expect.arrayContaining( [ firstShadowRoot, secondShadowRoot ] ) );
		} );

		it( 'fires "remove" only once for a root shared by several registered nodes', () => {
			const { shadowRoot, node: firstNode } = createConnectedShadowNode();
			const secondNode = document.createElement( 'div' );

			shadowRoot.appendChild( secondNode );

			registry.registerNode( firstNode );
			registry.registerNode( secondNode );

			const removeSpy = vi.fn();

			registry.on( 'remove', removeSpy );
			registry.destroy();

			expect( removeSpy ).toHaveBeenCalledTimes( 1 );
			expect( removeSpy.mock.calls[ 0 ][ 1 ] ).toBe( shadowRoot );
		} );

		it( 'does not throw when a still-queued (detached) node is registered', () => {
			const host = document.createElement( 'div' );
			const shadowRoot = host.attachShadow( { mode: 'open' } );
			const node = document.createElement( 'div' );

			shadowRoot.appendChild( node );
			registry.registerNode( node );

			const removeSpy = vi.fn();

			registry.on( 'remove', removeSpy );

			expect( () => registry.destroy() ).not.toThrow();

			// Nothing to remove: the node was never resolved, so its root was never a part of #getShadowRoots.
			expect( removeSpy ).not.toHaveBeenCalled();
		} );

		it( 'drops queued nodes too, so a #refresh() call afterwards resolves nothing', () => {
			const host = document.createElement( 'div' );
			const shadowRoot = host.attachShadow( { mode: 'open' } );
			const node = document.createElement( 'div' );

			shadowRoot.appendChild( node );
			registry.registerNode( node );
			registry.destroy();

			document.body.appendChild( host );
			elementsToRemove.push( host );

			const addSpy = vi.fn();

			registry.on( 'add', addSpy );
			registry.refresh();

			expect( addSpy ).not.toHaveBeenCalled();
			expect( registry.getShadowRoots().size ).toBe( 0 );
		} );
	} );
} );

describe( 'listenToShadowRoots()', () => {
	let registry, emitter, elementsToRemove;

	beforeEach( () => {
		registry = new ShadowRootRegistry();
		emitter = new ( DomEmitterMixin() )();
		elementsToRemove = [];
	} );

	afterEach( () => {
		for ( const element of elementsToRemove ) {
			element.remove();
		}
	} );

	function createConnectedShadowNode( { mode = 'open' } = {} ) {
		const host = document.createElement( 'div' );
		const shadowRoot = host.attachShadow( { mode } );
		const node = document.createElement( 'div' );

		shadowRoot.appendChild( node );
		document.body.appendChild( host );

		elementsToRemove.push( host );

		return { host, shadowRoot, node };
	}

	it( 'attaches to a shadow root that is already tracked by the registry when called', () => {
		const { shadowRoot, node } = createConnectedShadowNode();

		registry.registerNode( node );

		const callback = vi.fn();

		listenToShadowRoots( registry, { emitter, event: 'test-event', callback } );

		shadowRoot.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'attaches to a shadow root added to the registry afterwards', () => {
		const callback = vi.fn();

		listenToShadowRoots( registry, { emitter, event: 'test-event', callback } );

		const { shadowRoot, node } = createConnectedShadowNode();

		registry.registerNode( node );

		shadowRoot.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'leaves an already-attached root alone while attaching a second one added in the same sync', () => {
		const { shadowRoot: firstShadowRoot, node: firstNode } = createConnectedShadowNode();

		registry.registerNode( firstNode );

		const callback = vi.fn();

		listenToShadowRoots( registry, { emitter, event: 'test-event', callback } );

		// `firstShadowRoot` is already attached at this point. Registering a second node — hosted in a
		// different root — triggers another `sync()` in which `firstShadowRoot` is neither newly attached nor
		// removed, only `secondShadowRoot` is: the one case the two tests above do not exercise, since each of
		// them only ever sees a single root change starting from an otherwise empty state.
		const { shadowRoot: secondShadowRoot, node: secondNode } = createConnectedShadowNode();

		registry.registerNode( secondNode );

		firstShadowRoot.dispatchEvent( new Event( 'test-event' ) );
		secondShadowRoot.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'detaches from a shadow root once the registry drops it', () => {
		const { shadowRoot, node } = createConnectedShadowNode();

		registry.registerNode( node );

		const callback = vi.fn();

		listenToShadowRoots( registry, { emitter, event: 'test-event', callback } );

		registry.unregisterNode( node );

		shadowRoot.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'stops reacting to registry changes and detaches from every root once the returned teardown is called', () => {
		const { shadowRoot: firstShadowRoot, node: firstNode } = createConnectedShadowNode();

		registry.registerNode( firstNode );

		const callback = vi.fn();
		const stopListening = listenToShadowRoots( registry, { emitter, event: 'test-event', callback } );

		stopListening();

		// Already-attached root: the listener must be gone.
		firstShadowRoot.dispatchEvent( new Event( 'test-event' ) );

		// A root that only appears after teardown: must never be attached to begin with.
		const { shadowRoot: secondShadowRoot, node: secondNode } = createConnectedShadowNode();

		registry.registerNode( secondNode );

		secondShadowRoot.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'keeps two independent subscriptions from interfering with each other', () => {
		const { shadowRoot, node } = createConnectedShadowNode();

		registry.registerNode( node );

		const firstCallback = vi.fn();
		const secondCallback = vi.fn();
		const otherListener = new ( DomEmitterMixin() )();

		const stopFirst = listenToShadowRoots( registry, { emitter, event: 'test-event', callback: firstCallback } );

		listenToShadowRoots( registry, { emitter: otherListener, event: 'test-event', callback: secondCallback } );

		stopFirst();

		shadowRoot.dispatchEvent( new Event( 'test-event' ) );

		expect( firstCallback ).not.toHaveBeenCalled();
		expect( secondCallback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'follows a registered node moved to another shadow root once the registry is refreshed', () => {
		const { shadowRoot: firstShadowRoot, node } = createConnectedShadowNode();
		const { shadowRoot: secondShadowRoot } = createConnectedShadowNode();

		registry.registerNode( node );

		const callback = vi.fn();

		listenToShadowRoots( registry, { emitter, event: 'test-event', callback } );

		secondShadowRoot.appendChild( node );
		registry.refresh();

		// The tree the node left must no longer be listened to...
		firstShadowRoot.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).not.toHaveBeenCalled();

		// ...and the one it moved into must be. A non-composed event such as `scroll` never leaves this root,
		// so a listener that stayed behind would never see it.
		secondShadowRoot.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );
} );

describe( 'listenToEventRoots()', () => {
	let registry, emitter, elementsToRemove;

	beforeEach( () => {
		registry = new ShadowRootRegistry();
		emitter = new ( DomEmitterMixin() )();
		elementsToRemove = [];
	} );

	afterEach( () => {
		emitter.stopListening();

		for ( const element of elementsToRemove ) {
			element.remove();
		}
	} );

	function createConnectedShadowNode() {
		const host = document.createElement( 'div' );
		const shadowRoot = host.attachShadow( { mode: 'open' } );
		const node = document.createElement( 'div' );

		shadowRoot.appendChild( node );
		document.body.appendChild( host );

		elementsToRemove.push( host );

		return { host, shadowRoot, node };
	}

	function createIframeNode() {
		const iframe = document.createElement( 'iframe' );

		document.body.appendChild( iframe );
		elementsToRemove.push( iframe );

		const iframeDocument = iframe.contentDocument;
		const node = document.createElement( 'div' );

		iframeDocument.body.appendChild( node );

		return { iframeDocument, node };
	}

	it( 'attaches to the global document even when nothing is registered', () => {
		const callback = vi.fn();

		listenToEventRoots( registry, { emitter, event: 'test-event', callback } );

		document.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledOnce();
	} );

	it( 'attaches to the global document only once when a registered node lives in it too', () => {
		const element = document.createElement( 'div' );

		document.body.appendChild( element );
		elementsToRemove.push( element );
		registry.registerNode( element );

		const callback = vi.fn();

		listenToEventRoots( registry, { emitter, event: 'test-event', callback } );

		document.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledOnce();
	} );

	it( 'attaches to an iframe document that is already tracked by the registry when called', () => {
		const { iframeDocument, node } = createIframeNode();

		registry.registerNode( node );

		const callback = vi.fn();

		listenToEventRoots( registry, { emitter, event: 'test-event', callback } );

		iframeDocument.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledOnce();
	} );

	it( 'attaches to an iframe document added to the registry afterwards', () => {
		const callback = vi.fn();

		listenToEventRoots( registry, { emitter, event: 'test-event', callback } );

		const { iframeDocument, node } = createIframeNode();

		registry.registerNode( node );

		iframeDocument.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledOnce();
	} );

	it( 'attaches to a shadow root tracked by the registry', () => {
		const { shadowRoot, node } = createConnectedShadowNode();

		registry.registerNode( node );

		const callback = vi.fn();

		listenToEventRoots( registry, { emitter, event: 'test-event', callback } );

		shadowRoot.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledOnce();
	} );

	it( 'detaches from an iframe document once the registry drops it, but keeps listening to the global document', () => {
		const { iframeDocument, node } = createIframeNode();

		registry.registerNode( node );

		const callback = vi.fn();

		listenToEventRoots( registry, { emitter, event: 'test-event', callback } );

		registry.unregisterNode( node );

		iframeDocument.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).not.toHaveBeenCalled();

		document.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledOnce();
	} );

	it( 'keeps listening to the global document when the only registered node living in it is unregistered', () => {
		const element = document.createElement( 'div' );

		document.body.appendChild( element );
		elementsToRemove.push( element );
		registry.registerNode( element );

		const callback = vi.fn();

		listenToEventRoots( registry, { emitter, event: 'test-event', callback } );

		registry.unregisterNode( element );

		document.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledOnce();
	} );

	it( 'follows a registered node moved from the global document into an iframe once the registry is refreshed', () => {
		const { iframeDocument } = createIframeNode();
		const element = document.createElement( 'div' );

		document.body.appendChild( element );
		elementsToRemove.push( element );
		registry.registerNode( element );

		const callback = vi.fn();

		listenToEventRoots( registry, { emitter, event: 'test-event', callback } );

		iframeDocument.body.appendChild( element );
		registry.refresh();

		iframeDocument.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledOnce();
	} );

	it( 'stops reacting to registry changes and detaches from every root, the global document too, once torn down', () => {
		const { iframeDocument: firstIframeDocument, node: firstNode } = createIframeNode();

		registry.registerNode( firstNode );

		const callback = vi.fn();
		const stopListening = listenToEventRoots( registry, { emitter, event: 'test-event', callback } );

		stopListening();

		document.dispatchEvent( new Event( 'test-event' ) );
		firstIframeDocument.dispatchEvent( new Event( 'test-event' ) );

		// A root that only appears after teardown: must never be attached to begin with.
		const { iframeDocument: secondIframeDocument, node: secondNode } = createIframeNode();

		registry.registerNode( secondNode );

		secondIframeDocument.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'keeps a listener on the global document attached by the same emitter for another callback', () => {
		const otherCallback = vi.fn();

		emitter.listenTo( document, 'test-event', otherCallback );

		const stopListening = listenToEventRoots( registry, { emitter, event: 'test-event', callback: vi.fn() } );

		stopListening();

		document.dispatchEvent( new Event( 'test-event' ) );

		expect( otherCallback ).toHaveBeenCalledOnce();
	} );
} );
