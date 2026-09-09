/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, afterEach } from 'vitest';

import { whenElementConnected } from '../../src/dom/whenelementconnected.js';

describe( 'whenElementConnected()', () => {
	let element, container, cancel;

	afterEach( () => {
		if ( cancel ) {
			cancel();
			cancel = null;
		}

		if ( element ) {
			element.remove();
			element = null;
		}

		if ( container ) {
			container.remove();
			container = null;
		}
	} );

	it( 'should call the callback synchronously for an element that is already connected', () => {
		const callback = vi.fn();

		element = document.body.appendChild( createElement() );

		cancel = whenElementConnected( element, callback );

		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not call the callback while the element is detached', async () => {
		const callback = vi.fn();

		element = createElement();

		cancel = whenElementConnected( element, callback );

		await settle();

		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'should call the callback once the element is connected to the document', async () => {
		const callback = vi.fn();

		element = createElement();

		cancel = whenElementConnected( element, callback );

		document.body.append( element );

		await vi.waitFor( () => {
			expect( callback ).toHaveBeenCalledTimes( 1 );
		}, { timeout: 3000 } );
	} );

	it( 'should call the callback for an element connected inside a shadow root', async () => {
		const callback = vi.fn();

		container = document.body.appendChild( document.createElement( 'div' ) );
		element = createElement();

		cancel = whenElementConnected( element, callback );

		container.attachShadow( { mode: 'open' } ).append( element );

		await vi.waitFor( () => {
			expect( callback ).toHaveBeenCalledTimes( 1 );
		}, { timeout: 3000 } );
	} );

	it( 'should call the callback for an element with no size of its own', async () => {
		const callback = vi.fn();

		// An empty editable is a zero-height box, so the notification must not depend on the element having one.
		element = document.createElement( 'div' );

		cancel = whenElementConnected( element, callback );

		document.body.append( element );

		await vi.waitFor( () => {
			expect( callback ).toHaveBeenCalledTimes( 1 );
		}, { timeout: 3000 } );
	} );

	it( 'should call the callback at most once', async () => {
		const callback = vi.fn();

		element = createElement();

		cancel = whenElementConnected( element, callback );

		document.body.append( element );

		await vi.waitFor( () => {
			expect( callback ).toHaveBeenCalledTimes( 1 );
		}, { timeout: 3000 } );

		// Resizing the connected element must not be reported again.
		element.style.width = '123px';

		await settle();

		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not call the callback when the waiting was cancelled before the element was connected', async () => {
		const callback = vi.fn();

		element = createElement();

		cancel = whenElementConnected( element, callback );

		cancel();

		document.body.append( element );

		await settle();

		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'should do nothing when cancelled after the callback was called', async () => {
		const callback = vi.fn();

		element = createElement();

		cancel = whenElementConnected( element, callback );

		document.body.append( element );

		await vi.waitFor( () => {
			expect( callback ).toHaveBeenCalledTimes( 1 );
		}, { timeout: 3000 } );

		cancel();
		cancel();

		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should return a function that does nothing for an already connected element', () => {
		const callback = vi.fn();

		element = document.body.appendChild( createElement() );

		cancel = whenElementConnected( element, callback );

		cancel();
		cancel();

		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should call the callback exactly once for an element mounted hidden and then shown', async () => {
		const callback = vi.fn();

		container = document.body.appendChild( document.createElement( 'div' ) );
		container.style.display = 'none';

		element = createElement();

		cancel = whenElementConnected( element, callback );

		container.append( element );

		await settle();

		// Whether the callback already ran at this point depends on the timing of the observer's first delivery,
		// so the guarantee being checked here is the one that always holds: it runs, and it runs only once.
		container.style.display = '';

		await vi.waitFor( () => {
			expect( callback ).toHaveBeenCalledTimes( 1 );
		}, { timeout: 3000 } );

		await settle();

		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	function createElement() {
		const element = document.createElement( 'div' );

		element.textContent = 'whenElementConnected';

		return element;
	}

	function settle() {
		return new Promise( resolve => setTimeout( resolve, 250 ) );
	}
} );
