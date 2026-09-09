/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Locale } from '@ckeditor/ckeditor5-utils';

import { BodyCollection } from '../../src/editorui/bodycollection.js';
import { View } from '../../src/view.js';

describe( 'BodyCollection', () => {
	let locale, shadowHosts;

	beforeEach( () => {
		locale = new Locale();
		shadowHosts = [];
	} );

	afterEach( () => {
		const wrappers = Array.from( document.querySelectorAll( '.ck-body-wrapper' ) );

		for ( const wrapper of wrappers ) {
			wrapper.remove();
		}

		// Shadow roots are torn down together with their hosts.
		for ( const host of shadowHosts ) {
			host.remove();
		}

		BodyCollection._bodyWrappers.clear();
	} );

	// Creates a shadow host attached to the document and returns its (open or closed) shadow root.
	function createShadowRoot( mode = 'open' ) {
		const host = document.createElement( 'div' );

		document.body.appendChild( host );
		shadowHosts.push( host );

		return host.attachShadow( { mode } );
	}

	function fooView() {
		const view = new View();

		view.setTemplate( { tag: 'div', attributes: { class: [ 'foo' ] } } );

		return view;
	}

	describe( 'constructor', () => {
		it( 'assigns locale', () => {
			const instance = new BodyCollection( locale );

			expect( instance.locale ).toBe( locale );
		} );

		it( 'stores pre-initialized collection', () => {
			const collectionItems = [ new View(), new View() ];
			const instance = new BodyCollection( locale, collectionItems );

			expect( instance ).toHaveLength( 2 );
			expect( instance.get( 0 ) ).toBe( collectionItems[ 0 ] );
			expect( instance.get( 1 ) ).toBe( collectionItems[ 1 ] );
		} );
	} );

	describe( 'bodyCollectionContainer', () => {
		it( 'is created on demand and available before the collection is attached to the DOM', () => {
			const body = new BodyCollection( locale );

			const container = body.bodyCollectionContainer;

			expect( container ).toBeInstanceOf( HTMLElement );

			// Accessing it creates the element but does not attach it anywhere.
			expect( container.parentNode ).toBe( null );
			expect( body.mountTarget ).toBeUndefined();
		} );

		it( 'returns the same element on repeated access', () => {
			const body = new BodyCollection( locale );

			expect( body.bodyCollectionContainer ).toBe( body.bodyCollectionContainer );
		} );

		it( 'reuses the on-demand container when the collection is later attached', () => {
			const body = new BodyCollection( locale );

			const container = body.bodyCollectionContainer;

			body.attachToDom();

			expect( body.bodyCollectionContainer ).toBe( container );
			expect( container.parentNode ).toBe( BodyCollection._bodyWrappers.get( document.body ) );

			body.destroy();
		} );
	} );

	describe( 'attachToDom', () => {
		it( 'should create wrapper and put the collection in that wrapper', () => {
			const body = new BodyCollection( locale );

			body.attachToDom();

			const wrappers = Array.from( document.querySelectorAll( '.ck-body-wrapper' ) );

			expect( wrappers.length ).toBe( 1 );
			expect( wrappers[ 0 ].parentNode ).toBe( document.body );
			expect( BodyCollection._bodyWrappers.get( document.body ) ).toBe( wrappers[ 0 ] );

			const el = body.bodyCollectionContainer;

			expect( el.parentNode ).toBe( wrappers[ 0 ] );
			expect( el.classList.contains( 'ck' ) ).toBe( true );
			expect( el.classList.contains( 'ck-body' ) ).toBe( true );
			expect( el.classList.contains( 'ck-rounded-corners' ) ).toBe( true );
			expect( el.classList.contains( 'ck-reset_all' ) ).toBe( true );
		} );

		it( 'sets the role attirbute', () => {
			const body = new BodyCollection( locale );

			body.attachToDom();

			const el = body.bodyCollectionContainer;

			expect( el.getAttribute( 'role' ) ).toBe( 'application' );
		} );

		it( 'sets the right dir attribute to the body region (LTR)', () => {
			const body = new BodyCollection( locale );

			body.attachToDom();

			const el = body.bodyCollectionContainer;

			expect( el.getAttribute( 'dir' ) ).toBe( 'ltr' );
		} );

		it( 'sets the right dir attribute to the body region (RTL)', () => {
			const locale = new Locale( { uiLanguage: 'ar' } );
			const body = new BodyCollection( locale );

			body.attachToDom();

			const el = body.bodyCollectionContainer;

			expect( el.getAttribute( 'dir' ) ).toBe( 'rtl' );
		} );

		it( 'should put all body elements to the same wrapper', () => {
			const body1 = new BodyCollection( locale );
			body1.attachToDom();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 1 );
			expect( document.querySelectorAll( '.ck-body' ).length ).toBe( 1 );

			const body2 = new BodyCollection( locale );
			body2.attachToDom();

			const bodyElements = document.querySelectorAll( '.ck-body' );

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 1 );
			expect( bodyElements.length ).toBe( 2 );
			expect( bodyElements[ 0 ].parentNode ).toBe( bodyElements[ 1 ].parentNode );
			expect( BodyCollection._bodyWrappers.get( document.body ) ).toBe( bodyElements[ 0 ].parentNode );
		} );

		it( 'should create another wrapper if the previous one got disconnected from DOM', () => {
			const body1 = new BodyCollection( locale );
			body1.attachToDom();

			let wrappers, bodyContainers;

			wrappers = document.querySelectorAll( '.ck-body-wrapper' );
			bodyContainers = document.querySelectorAll( '.ck-body' );

			expect( wrappers.length ).toBe( 1 );
			expect( bodyContainers.length ).toBe( 1 );

			// Some external code breaks the wrapper.
			wrappers[ 0 ].remove();

			const body2 = new BodyCollection( locale );
			body2.attachToDom();

			wrappers = document.querySelectorAll( '.ck-body-wrapper' );
			bodyContainers = document.querySelectorAll( '.ck-body' );

			expect( wrappers.length ).toBe( 1 );
			expect( bodyContainers.length ).toBe( 1 );
			expect( bodyContainers[ 0 ] ).toBe( body2.bodyCollectionContainer );
			expect( body2.bodyCollectionContainer.parentElement ).toBe( wrappers[ 0 ] );

			body1.destroy();

			wrappers = document.querySelectorAll( '.ck-body-wrapper' );
			bodyContainers = document.querySelectorAll( '.ck-body' );

			expect( wrappers.length ).toBe( 1 );
			expect( bodyContainers.length ).toBe( 1 );
			expect( bodyContainers[ 0 ] ).toBe( body2.bodyCollectionContainer );
			expect( body2.bodyCollectionContainer.parentElement ).toBe( wrappers[ 0 ] );

			body2.destroy();

			wrappers = document.querySelectorAll( '.ck-body-wrapper' );
			bodyContainers = document.querySelectorAll( '.ck-body' );

			expect( wrappers.length ).toBe( 0 );
			expect( bodyContainers.length ).toBe( 0 );
		} );

		it( 'should render views in proper body collections', () => {
			const body1 = new BodyCollection( locale );

			const view1 = new View();
			view1.setTemplate( {
				tag: 'div',
				attributes: {
					class: [ 'foo' ]
				}
			} );

			// Should work if body is attached before the view is added...
			body1.attachToDom();
			body1.add( view1 );

			const body2 = new BodyCollection( locale );

			const view2 = new View();
			view2.setTemplate( {
				tag: 'div',
				attributes: {
					class: [ 'bar' ]
				}
			} );

			// ...and it should work if body is attached after the view is added.
			body2.add( view2 );
			body2.attachToDom();

			const wrappers = Array.from( document.querySelectorAll( '.ck-body-wrapper' ) );

			expect( wrappers.length ).toBe( 1 );

			const wrapper = wrappers[ 0 ];
			const body1Element = body1.bodyCollectionContainer;
			const body2Element = body2.bodyCollectionContainer;

			expect( body1Element.parentNode ).toBe( wrapper );
			expect( body1Element.childNodes.length ).toBe( 1 );
			expect( body1Element.childNodes[ 0 ].classList.contains( 'foo' ) ).toBe( true );

			expect( body2Element.parentNode ).toBe( wrapper );
			expect( body2Element.childNodes.length ).toBe( 1 );
			expect( body2Element.childNodes[ 0 ].classList.contains( 'bar' ) ).toBe( true );
		} );

		describe( 'with a target', () => {
			it( 'should mount the collection in a passed element', () => {
				const target = document.createElement( 'div' );
				document.body.appendChild( target );

				const body = new BodyCollection( locale );
				body.attachToDom( target );

				const wrapper = target.querySelector( '.ck-body-wrapper' );

				expect( wrapper ).not.toBe( null );
				expect( body.bodyCollectionContainer.parentNode ).toBe( wrapper );
				expect( document.body.querySelector( ':scope > .ck-body-wrapper' ) ).toBe( null );

				body.destroy();
				target.remove();
			} );

			it( 'should mount the collection in an open shadow root', () => {
				const shadowRoot = createShadowRoot( 'open' );

				const body = new BodyCollection( locale );
				body.attachToDom( shadowRoot );

				const wrapper = shadowRoot.querySelector( '.ck-body-wrapper' );

				expect( wrapper ).not.toBe( null );
				expect( BodyCollection._bodyWrappers.get( shadowRoot ) ).toBe( wrapper );
				expect( body.bodyCollectionContainer.parentNode ).toBe( wrapper );
				expect( document.querySelector( '.ck-body-wrapper' ) ).toBe( null );
			} );

			it( 'should mount the collection in a closed shadow root', () => {
				const shadowRoot = createShadowRoot( 'closed' );

				const body = new BodyCollection( locale );
				body.attachToDom( shadowRoot );

				const wrapper = shadowRoot.querySelector( '.ck-body-wrapper' );

				expect( wrapper ).not.toBe( null );
				expect( body.bodyCollectionContainer.parentNode ).toBe( wrapper );
			} );

			it( 'should mount the collection in a target belonging to another document (iframe)', () => {
				const iframe = document.createElement( 'iframe' );
				document.body.appendChild( iframe );

				const iframeDocument = iframe.contentDocument;
				const target = iframeDocument.createElement( 'div' );
				iframeDocument.body.appendChild( target );

				const body = new BodyCollection( locale );
				body.attachToDom( target );

				const wrapper = target.querySelector( '.ck-body-wrapper' );

				expect( wrapper ).not.toBe( null );
				expect( body.bodyCollectionContainer.parentNode ).toBe( wrapper );

				// The wrapper must belong to the target's own document, not this module's global one.
				expect( wrapper.ownerDocument ).toBe( iframeDocument );
				expect( wrapper.ownerDocument ).not.toBe( document );

				body.destroy();
				iframe.remove();
			} );

			it( 'should share a wrapper between collections mounted in the same shadow root', () => {
				const shadowRoot = createShadowRoot( 'open' );

				const body1 = new BodyCollection( locale );
				const body2 = new BodyCollection( locale );

				body1.attachToDom( shadowRoot );
				body2.attachToDom( shadowRoot );

				expect( shadowRoot.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 1 );
				expect( body1.bodyCollectionContainer.parentNode ).toBe( body2.bodyCollectionContainer.parentNode );
			} );

			it( 'should keep separate wrappers for collections mounted in different roots', () => {
				const shadowRoot = createShadowRoot( 'open' );

				const lightBody = new BodyCollection( locale );
				const shadowBody = new BodyCollection( locale );

				lightBody.attachToDom();
				shadowBody.attachToDom( shadowRoot );

				expect( document.body.querySelector( ':scope > .ck-body-wrapper' ) ).not.toBe( null );
				expect( shadowRoot.querySelector( '.ck-body-wrapper' ) ).not.toBe( null );
				expect( lightBody.bodyCollectionContainer.parentNode )
					.not.toBe( shadowBody.bodyCollectionContainer.parentNode );
			} );

			it( 'should share a single wrapper between collections mounted in a target detached from the document', () => {
				// A configured `ui.overlayContainer` may still be detached from the document when body collections
				// mount into it (it is inserted later). Its wrapper is never connected, but it must not be duplicated.
				const detachedTarget = document.createElement( 'div' );

				const body1 = new BodyCollection( locale );
				const body2 = new BodyCollection( locale );

				body1.attachToDom( detachedTarget );
				body2.attachToDom( detachedTarget );

				expect( detachedTarget.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 1 );
				expect( body1.bodyCollectionContainer.parentNode ).toBe( body2.bodyCollectionContainer.parentNode );

				body1.destroy();
				body2.destroy();

				// Nothing is left behind in the target once the last collection detaches.
				expect( detachedTarget.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 0 );
			} );

			it( 'should rebuild the shared wrapper when it was removed from the target externally', () => {
				const target = document.createElement( 'div' );
				document.body.appendChild( target );

				const body1 = new BodyCollection( locale );
				body1.attachToDom( target );

				const firstWrapper = BodyCollection._bodyWrappers.get( target );
				firstWrapper.remove();

				const body2 = new BodyCollection( locale );
				body2.attachToDom( target );

				const secondWrapper = BodyCollection._bodyWrappers.get( target );

				expect( secondWrapper ).not.toBe( firstWrapper );
				expect( target.querySelector( ':scope > .ck-body-wrapper' ) ).toBe( secondWrapper );

				body1.destroy();
				body2.destroy();
				target.remove();
			} );
		} );

		describe( 're-mounting', () => {
			it( 'should move the collection (and its rendered views) into a new root', () => {
				const shadowRoot = createShadowRoot( 'open' );

				const body = new BodyCollection( locale );
				const view = fooView();

				body.attachToDom();
				body.add( view );

				const container = body.bodyCollectionContainer;

				expect( container.parentNode.parentNode ).toBe( document.body );

				body.attachToDom( shadowRoot );

				// The same container instance is reused and moved together with its view.
				expect( body.bodyCollectionContainer ).toBe( container );
				expect( container.parentNode ).toBe( shadowRoot.querySelector( '.ck-body-wrapper' ) );
				expect( container.querySelector( '.foo' ) ).toBe( view.element );
			} );

			it( 'should remove the previous wrapper when it becomes empty after a re-mount', () => {
				const shadowRoot = createShadowRoot( 'open' );

				const body = new BodyCollection( locale );

				body.attachToDom();

				expect( document.body.querySelector( ':scope > .ck-body-wrapper' ) ).not.toBe( null );

				body.attachToDom( shadowRoot );

				expect( document.body.querySelector( ':scope > .ck-body-wrapper' ) ).toBe( null );
				expect( BodyCollection._bodyWrappers.has( document.body ) ).toBe( false );
				expect( shadowRoot.querySelector( '.ck-body-wrapper' ) ).not.toBe( null );
			} );

			it( 'should keep a shared previous wrapper populated by another collection after a re-mount', () => {
				const shadowRoot = createShadowRoot( 'open' );

				const stay = new BodyCollection( locale );
				const move = new BodyCollection( locale );

				stay.attachToDom();
				move.attachToDom();

				move.attachToDom( shadowRoot );

				expect( document.body.querySelector( ':scope > .ck-body-wrapper' ) ).not.toBe( null );
				expect( stay.bodyCollectionContainer.parentNode ).toBe(
					document.body.querySelector( ':scope > .ck-body-wrapper' )
				);
			} );
		} );
	} );

	describe( 'syncMountTarget', () => {
		it( 'mounts an unmounted collection into the given target', () => {
			const shadowRoot = createShadowRoot( 'open' );
			const body = new BodyCollection( locale );

			body.syncMountTarget( shadowRoot );

			expect( body.mountTarget ).toBe( shadowRoot );
			expect( body.bodyCollectionContainer.parentNode ).toBe( shadowRoot.querySelector( '.ck-body-wrapper' ) );
		} );

		it( 're-mounts the collection (with its rendered views) when the target changes', () => {
			const shadowRoot = createShadowRoot( 'open' );
			const body = new BodyCollection( locale );
			const view = fooView();

			body.syncMountTarget( document.body );
			body.add( view );

			body.syncMountTarget( shadowRoot );

			expect( body.mountTarget ).toBe( shadowRoot );
			expect( body.bodyCollectionContainer.parentNode ).toBe( shadowRoot.querySelector( '.ck-body-wrapper' ) );
			expect( body.bodyCollectionContainer.querySelector( '.foo' ) ).toBe( view.element );
		} );

		it( 'does not touch the DOM when the collection already sits in the given target', () => {
			const first = new BodyCollection( locale );
			const second = new BodyCollection( locale );

			first.attachToDom();
			second.attachToDom();

			const wrapper = document.body.querySelector( ':scope > .ck-body-wrapper' );

			expect( Array.from( wrapper.children ) ).toEqual(
				[ first.bodyCollectionContainer, second.bodyCollectionContainer ]
			);

			first.syncMountTarget( document.body );

			// `attachToDom()` would re-append the container, moving it to the end of the wrapper.
			expect( Array.from( wrapper.children ) ).toEqual(
				[ first.bodyCollectionContainer, second.bodyCollectionContainer ]
			);
		} );

		it( 'unmounts the collection on a null target, keeping its views for a later re-mount', () => {
			const body = new BodyCollection( locale );
			const view = fooView();

			body.attachToDom();
			body.add( view );

			body.syncMountTarget( null );

			expect( body.mountTarget ).toBeUndefined();
			expect( body.bodyCollectionContainer.parentNode ).toBe( null );
			expect( body.bodyCollectionContainer.querySelector( '.foo' ) ).toBe( view.element );
		} );

		it( 'does nothing on a null target when the collection is not mounted', () => {
			const body = new BodyCollection( locale );
			const remountSpy = vi.fn();

			body.on( 'remount', remountSpy );

			expect( () => body.syncMountTarget( null ) ).not.toThrow();
			expect( remountSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'unmountFromDom', () => {
		it( 'removes the collection from the DOM without destroying its views and allows re-attaching', () => {
			const body = new BodyCollection( locale );
			const view = fooView();

			body.attachToDom();
			body.add( view );

			const container = body.bodyCollectionContainer;

			expect( container.parentNode ).not.toBe( null );

			body.unmountFromDom();

			// The container is detached and the shared wrapper removed, but the view is preserved.
			expect( container.parentNode ).toBe( null );
			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 0 );
			expect( body.mountTarget ).toBeUndefined();
			expect( container.querySelector( '.foo' ) ).toBe( view.element );

			// Re-attaching reuses the same container and its view.
			body.attachToDom();

			expect( body.bodyCollectionContainer ).toBe( container );
			expect( container.querySelector( '.foo' ) ).toBe( view.element );
			expect( container.parentNode.classList.contains( 'ck-body-wrapper' ) ).toBe( true );

			body.destroy();
		} );

		it( 'should not throw when called without a prior attachToDom', () => {
			const body = new BodyCollection( locale );

			expect( () => body.unmountFromDom() ).not.toThrow();
		} );
	} );

	describe( 'destroy', () => {
		it( 'removes the body collection from DOM', () => {
			const body = new BodyCollection( locale );

			body.attachToDom();
			body.destroy();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 0 );
			expect( document.querySelectorAll( '.ck-body' ).length ).toBe( 0 );
		} );

		it( 'removes the multiple body collections from dom and remove the wrapper when the last is removed', () => {
			const body1 = new BodyCollection( locale );
			body1.attachToDom();

			const body2 = new BodyCollection( locale );
			body2.attachToDom();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 1 );
			expect( document.querySelectorAll( '.ck-body' ).length ).toBe( 2 );

			body1.destroy();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 1 );
			expect( document.querySelectorAll( '.ck-body' ).length ).toBe( 1 );

			body2.destroy();

			expect( document.querySelectorAll( '.ck-body-wrapper' ).length ).toBe( 0 );
			expect( document.querySelectorAll( '.ck-body' ).length ).toBe( 0 );
		} );

		it( 'removes a shadow-mounted collection without removing the shadow host', () => {
			const shadowRoot = createShadowRoot( 'open' );

			const body = new BodyCollection( locale );
			body.attachToDom( shadowRoot );
			body.destroy();

			expect( shadowRoot.querySelector( '.ck-body-wrapper' ) ).toBe( null );
			expect( BodyCollection._bodyWrappers.has( shadowRoot ) ).toBe( false );
			// The host stays in the DOM – only the wrapper inside the shadow root is removed.
			expect( shadowRoot.host.isConnected ).toBe( true );
		} );

		it( 'should not throw when be called multiple times', () => {
			const body = new BodyCollection( locale );
			body.attachToDom();

			expect( () => {
				body.destroy();
				body.destroy();
			} ).not.toThrow();
		} );

		it( 'should not throw if attachToDom was not called before', () => {
			const body = new BodyCollection( locale );

			expect( () => {
				body.destroy();
			} ).not.toThrow();
		} );
	} );
} );
