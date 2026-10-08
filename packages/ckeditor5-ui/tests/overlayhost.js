/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EmitterMixin, Locale, ShadowRootRegistry } from '@ckeditor/ckeditor5-utils';

import { OverlayHost } from '../src/overlayhost.js';
import { BodyCollection } from '../src/editorui/bodycollection.js';
import { TooltipManager } from '../src/tooltipmanager.js';
import { View } from '../src/view.js';

describe( 'OverlayHost', () => {
	let locale, hosts, shadowHosts;

	beforeEach( () => {
		// TooltipManager is a singleton shared across editor instances. If any other test file left a lingering
		// instance (for example an undestroyed editor), tear it down so the refcount-sensitive assertions below
		// start from a clean slate.
		if ( TooltipManager._instance ) {
			TooltipManager._instance.stopListening();
		}

		TooltipManager._instance = null;
		TooltipManager._registrations = new Map();

		locale = new Locale();
		hosts = [];
		shadowHosts = [];
	} );

	afterEach( () => {
		for ( const host of hosts ) {
			host.destroy();
		}

		for ( const shadowHost of shadowHosts ) {
			shadowHost.remove();
		}

		for ( const wrapper of Array.from( document.querySelectorAll( '.ck-body-wrapper' ) ) ) {
			wrapper.remove();
		}

		BodyCollection._bodyWrappers.clear();
	} );

	function createHost( options = {} ) {
		const host = new OverlayHost( locale, {
			resolveMountTarget: () => null,
			...options
		} );

		hosts.push( host );

		return host;
	}

	function fooView() {
		const view = new View();

		view.setTemplate( { tag: 'div', attributes: { class: [ 'foo' ] } } );

		return view;
	}

	// Creates a shadow host attached to the document and returns its (open or closed) shadow root.
	function createShadowRoot( mode = 'open' ) {
		const shadowHost = document.createElement( 'div' );

		document.body.appendChild( shadowHost );
		shadowHosts.push( shadowHost );

		return shadowHost.attachShadow( { mode } );
	}

	describe( 'constructor()', () => {
		it( 'creates a body collection with the given locale, not mounted in the DOM yet', () => {
			const host = createHost();

			expect( host.bodyCollection ).toBeInstanceOf( BodyCollection );
			expect( host.bodyCollection.locale ).toBe( locale );
			expect( host.bodyCollection.mountTarget ).toBeUndefined();
		} );

		it( 'registers the body collection with the shared tooltip manager', () => {
			const host = createHost();

			expect( TooltipManager._registrations.has( host.bodyCollection ) ).toBe( true );
		} );

		it( 'hosts a borrowed body collection instead of creating one', () => {
			const bodyCollection = new BodyCollection( locale );
			const host = createHost( { bodyCollection } );

			expect( host.bodyCollection ).toBe( bodyCollection );
			expect( TooltipManager._registrations.has( bodyCollection ) ).toBe( true );
		} );

		it( 'uses a borrowed shadow root registry instead of creating one', () => {
			const shadowRootRegistry = new ShadowRootRegistry();
			const host = createHost( { shadowRootRegistry } );

			expect( host.shadowRootRegistry ).toBe( shadowRootRegistry );
		} );

		it( 'registers with a borrowed tooltip manager reference instead of acquiring its own', () => {
			const tooltipManager = TooltipManager.for( locale );
			const host = new OverlayHost( locale, {
				resolveMountTarget: () => null,
				tooltipManager
			} );

			expect( TooltipManager._registrations.has( host.bodyCollection ) ).toBe( true );

			host.destroy();

			// The host unregistered its collection but did not release the borrowed reference.
			expect( TooltipManager._registrations.has( host.bodyCollection ) ).toBe( false );
			expect( TooltipManager._instance ).toBe( tooltipManager );

			tooltipManager.release();
			expect( TooltipManager._instance ).toBe( null );
		} );

		it( 'forwards the update emitter to the tooltip manager registration', () => {
			const updateEmitter = new ( EmitterMixin() )();
			const host = createHost( { updateEmitter } );

			expect( TooltipManager._registrations.get( host.bodyCollection ).updateEmitter ).toBe( updateEmitter );
		} );
	} );

	describe( 'sync()', () => {
		it( 'mounts the body collection into the resolved target', () => {
			const shadowRoot = createShadowRoot();
			const host = createHost( { resolveMountTarget: () => shadowRoot } );

			host.sync();

			expect( host.bodyCollection.mountTarget ).toBe( shadowRoot );
		} );

		it( 'keeps the collection unmounted while the target resolves to null, then mounts once it resolves', () => {
			let target = null;
			const host = createHost( { resolveMountTarget: () => target } );

			host.sync();

			expect( host.bodyCollection.mountTarget ).toBeUndefined();

			target = document.body;
			host.sync();

			expect( host.bodyCollection.mountTarget ).toBe( document.body );
		} );

		it( 'unmounts the collection when the target resolves back to null', () => {
			let target = document.body;
			const host = createHost( { resolveMountTarget: () => target } );

			host.sync();
			expect( host.bodyCollection.mountTarget ).toBe( document.body );

			target = null;
			host.sync();

			expect( host.bodyCollection.mountTarget ).toBeUndefined();
		} );

		it( 'makes the tooltip manager observe the shadow root of the resolved inline container', () => {
			const shadowRoot = createShadowRoot();
			const container = document.createElement( 'div' );

			shadowRoot.appendChild( container );

			const host = createHost( { resolveInlineContainer: () => container } );

			host.sync();

			expect( TooltipManager._instance._shadowRoots.has( shadowRoot ) ).toBe( true );
		} );

		it( 'stops observing the previous inline container root when the resolved container changes', () => {
			const firstShadowRoot = createShadowRoot();
			const firstContainer = document.createElement( 'div' );

			firstShadowRoot.appendChild( firstContainer );

			const secondShadowRoot = createShadowRoot();
			const secondContainer = document.createElement( 'div' );

			secondShadowRoot.appendChild( secondContainer );

			let container = firstContainer;
			const host = createHost( { resolveInlineContainer: () => container } );

			host.sync();
			expect( TooltipManager._instance._shadowRoots.has( firstShadowRoot ) ).toBe( true );

			container = secondContainer;
			host.sync();

			expect( TooltipManager._instance._shadowRoots.has( firstShadowRoot ) ).toBe( false );
			expect( TooltipManager._instance._shadowRoots.has( secondShadowRoot ) ).toBe( true );
		} );

		it( 'runs automatically when a view is added to the body collection', () => {
			let target = null;
			const host = createHost( { resolveMountTarget: () => target } );

			host.sync();
			expect( host.bodyCollection.mountTarget ).toBeUndefined();

			// The mount target became resolvable in the meantime (e.g. a container got connected); adding the
			// first floating view must trigger a re-resolve without an explicit sync() call.
			target = document.body;

			const view = new View();

			view.setTemplate( { tag: 'div' } );
			host.bodyCollection.add( view );

			expect( host.bodyCollection.mountTarget ).toBe( document.body );
		} );

		it( 'runs automatically on every update event of the configured update emitter', () => {
			let target = null;
			const updateEmitter = new ( EmitterMixin() )();
			const host = createHost( { resolveMountTarget: () => target, updateEmitter } );

			updateEmitter.fire( 'update' );
			expect( host.bodyCollection.mountTarget ).toBeUndefined();

			target = document.body;
			updateEmitter.fire( 'update' );

			expect( host.bodyCollection.mountTarget ).toBe( document.body );
		} );

		it( 'stops tracking the inline container when it no longer resolves (the feature lost its container)', () => {
			const shadowRoot = createShadowRoot();
			const container = document.createElement( 'div' );

			shadowRoot.appendChild( container );

			let currentContainer = container;
			const host = createHost( { resolveInlineContainer: () => currentContainer } );

			host.sync();
			expect( TooltipManager._instance._shadowRoots.has( shadowRoot ) ).toBe( true );

			currentContainer = null;
			host.sync();

			expect( TooltipManager._instance._shadowRoots.has( shadowRoot ) ).toBe( false );
		} );

		it( 're-resolves a detached inline container once it becomes connected', () => {
			const container = document.createElement( 'div' );
			const host = createHost( { resolveInlineContainer: () => container } );

			host.sync();

			const shadowRoot = createShadowRoot();

			shadowRoot.appendChild( container );
			expect( TooltipManager._instance._shadowRoots.has( shadowRoot ) ).toBe( false );

			host.sync();

			expect( TooltipManager._instance._shadowRoots.has( shadowRoot ) ).toBe( true );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'destroys the body collection and the shared tooltip manager with the last holder', () => {
			const host = createHost( { resolveMountTarget: () => document.body } );
			const bodyCollection = host.bodyCollection;

			host.sync();
			expect( TooltipManager._instance ).not.toBe( null );

			host.destroy();

			expect( bodyCollection.mountTarget ).toBeUndefined();
			expect( TooltipManager._instance ).toBe( null );
		} );

		it( 'keeps the shared tooltip manager alive while other holders exist', () => {
			const first = createHost();
			const second = createHost();

			first.destroy();

			expect( TooltipManager._instance ).not.toBe( null );
			expect( TooltipManager._registrations.has( first.bodyCollection ) ).toBe( false );
			expect( TooltipManager._registrations.has( second.bodyCollection ) ).toBe( true );

			second.destroy();

			expect( TooltipManager._instance ).toBe( null );
		} );

		it( 'does not destroy a borrowed body collection, leaving it to its owner', () => {
			const bodyCollection = new BodyCollection( locale );
			const view = fooView();

			bodyCollection.attachToDom();
			bodyCollection.add( view );

			const host = createHost( { bodyCollection } );

			host.destroy();

			// The collection is unregistered from the tooltip manager but stays intact and mounted.
			expect( TooltipManager._instance ).toBe( null );
			expect( bodyCollection.mountTarget ).toBe( document.body );
			expect( bodyCollection.has( view ) ).toBe( true );
			expect( view.element.parentNode ).not.toBe( null );

			bodyCollection.destroy();
		} );

		it( 'does not destroy a borrowed shadow root registry, leaving it to its owner', () => {
			const shadowRootRegistry = new ShadowRootRegistry();
			const shadowRoot = createShadowRoot();
			const node = document.createElement( 'div' );

			shadowRoot.appendChild( node );
			shadowRootRegistry.registerNode( node );
			shadowRootRegistry.refresh();

			const host = createHost( { shadowRootRegistry } );

			host.destroy();

			// The registry still tracks its roots; only a registry created by the host is destroyed with it.
			expect( shadowRootRegistry.getShadowRoots().has( shadowRoot ) ).toBe( true );

			shadowRootRegistry.destroy();
		} );

		it( 'stops re-syncing on the update emitter once destroyed', () => {
			let target = null;
			const updateEmitter = new ( EmitterMixin() )();
			const host = createHost( { resolveMountTarget: () => target, updateEmitter } );

			host.destroy();

			target = document.body;

			expect( () => updateEmitter.fire( 'update' ) ).not.toThrow();
			expect( host.bodyCollection.mountTarget ).toBeUndefined();
		} );

		it( 'is safe to call more than once (does not release the tooltip manager on behalf of another holder)', () => {
			const first = createHost();
			const second = createHost();

			first.destroy();
			first.destroy();

			// A second destroy must not steal the remaining holder's reference.
			expect( TooltipManager._instance ).not.toBe( null );
			expect( TooltipManager._registrations.has( second.bodyCollection ) ).toBe( true );

			second.destroy();

			expect( TooltipManager._instance ).toBe( null );
		} );
	} );
} );
