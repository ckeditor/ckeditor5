/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DomEmitterMixin } from '../../src/dom/emittermixin.js';
import { DomTargetsListener } from '../../src/dom/domtargetslistener.js';

describe( 'DomTargetsListener', () => {
	let emitter, callback, targets, elementsToRemove;

	beforeEach( () => {
		emitter = new ( DomEmitterMixin() )();
		callback = vi.fn();
		targets = [];
		elementsToRemove = [];
	} );

	afterEach( () => {
		emitter.stopListening();

		for ( const element of elementsToRemove ) {
			element.remove();
		}
	} );

	function listen( options = {} ) {
		return new DomTargetsListener( () => targets, { emitter, event: 'test-event', callback, ...options } );
	}

	function createIframeDocument() {
		const iframe = document.createElement( 'iframe' );

		document.body.appendChild( iframe );
		elementsToRemove.push( iframe );

		return iframe.contentDocument;
	}

	function createShadowRoot() {
		const host = document.createElement( 'div' );

		document.body.appendChild( host );
		elementsToRemove.push( host );

		return host.attachShadow( { mode: 'open' } );
	}

	it( 'does not attach to the global document unless it is among the targets', () => {
		listen();

		document.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'attaches to every returned target right away', () => {
		const iframeDocument = createIframeDocument();
		const shadowRoot = createShadowRoot();

		targets = [ document, iframeDocument, shadowRoot ];
		listen();

		document.dispatchEvent( new Event( 'test-event' ) );
		iframeDocument.dispatchEvent( new Event( 'test-event' ) );
		shadowRoot.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'attaches to a target returned more than once only once', () => {
		targets = [ document, document ];
		listen();

		document.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledOnce();
	} );

	it( 'reads the targets again on #refresh(), attaching to new ones and detaching from the ones gone', () => {
		const iframeDocument = createIframeDocument();
		const shadowRoot = createShadowRoot();

		targets = [ iframeDocument ];

		const listener = listen();

		targets = [ shadowRoot ];
		listener.refresh();

		iframeDocument.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).not.toHaveBeenCalled();

		shadowRoot.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledOnce();
	} );

	it( 'does not attach twice to targets that are still there on #refresh()', () => {
		const iframeDocument = createIframeDocument();

		targets = [ iframeDocument ];
		listen().refresh();

		iframeDocument.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledOnce();
	} );

	it( 'detaches from every target on #destroy()', () => {
		const iframeDocument = createIframeDocument();

		targets = [ document, iframeDocument ];

		listen().destroy();

		document.dispatchEvent( new Event( 'test-event' ) );
		iframeDocument.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'does not detach other listeners of the same emitter on the same targets', () => {
		const otherCallback = vi.fn();

		emitter.listenTo( document, 'test-event', otherCallback );

		targets = [ document ];
		listen().destroy();

		document.dispatchEvent( new Event( 'test-event' ) );

		expect( otherCallback ).toHaveBeenCalledOnce();
	} );

	it( 'passes the listener options through', () => {
		const iframeDocument = createIframeDocument();

		targets = [ iframeDocument ];
		listen( { listenerOptions: { useCapture: true } } );

		// A non-bubbling event reaches a document listener only in the capture phase.
		iframeDocument.body.dispatchEvent( new Event( 'test-event', { bubbles: false } ) );

		expect( callback ).toHaveBeenCalledOnce();
	} );

	it( 'attaches to targets that are not documents or shadow roots, such as a window or a visual viewport', () => {
		targets = [ window, window.visualViewport ];
		listen();

		window.dispatchEvent( new Event( 'test-event' ) );
		window.visualViewport.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'skips `null` and `undefined` targets', () => {
		targets = [ null, document, undefined ];
		listen();

		document.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).toHaveBeenCalledOnce();
	} );

	it( 'detaches from a target that became `null` on #refresh()', () => {
		targets = [ document ];

		const listener = listen();

		targets = [ null ];
		listener.refresh();

		document.dispatchEvent( new Event( 'test-event' ) );

		expect( callback ).not.toHaveBeenCalled();
	} );
} );
