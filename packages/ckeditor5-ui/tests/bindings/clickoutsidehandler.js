/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clickOutsideHandler } from '../../src/bindings/clickoutsidehandler.js';

import { DomEmitterMixin } from '@ckeditor/ckeditor5-utils';

describe( 'clickOutsideHandler', () => {
	let activator, actionSpy, contextElement1, contextElement2, contextElementsCallback;
	let shadowRootContainer, shadowContextElement1, shadowContextElement2;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		activator = vi.fn().mockReturnValue( false );
		contextElement1 = document.createElement( 'div' );
		contextElement2 = document.createElement( 'div' );
		shadowRootContainer = document.createElement( 'div' );
		shadowRootContainer.attachShadow( { mode: 'open' } );
		shadowContextElement1 = document.createElement( 'div' );
		shadowContextElement2 = document.createElement( 'div' );
		actionSpy = vi.fn();

		document.body.appendChild( contextElement1 );
		document.body.appendChild( contextElement2 );
		shadowRootContainer.shadowRoot.appendChild( shadowContextElement1 );
		shadowRootContainer.shadowRoot.appendChild( shadowContextElement2 );
		document.body.appendChild( shadowRootContainer );
	} );

	afterEach( () => {
		document.body.removeChild( contextElement1 );
		document.body.removeChild( contextElement2 );
		document.body.removeChild( shadowRootContainer );
	} );

	describe( 'listenerOptions', () => {
		it( 'should forward listenerOptions parameter', () => {
			const listenerOptions = { passive: true };
			const emitter = new ( DomEmitterMixin() )();

			const listenToSpy = vi.spyOn( emitter, 'listenTo' );

			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ contextElement1 ],
				callback: actionSpy,
				listenerOptions
			} );

			expect( listenToSpy ).toHaveBeenCalledWith(
				document, 'mousedown', expect.any( Function ), listenerOptions
			);
		} );

		it( 'should not forward listenerOptions parameter if not provided', () => {
			const emitter = new ( DomEmitterMixin() )();

			const listenToSpy = vi.spyOn( emitter, 'listenTo' );

			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ contextElement1 ],
				callback: actionSpy
			} );

			const firstCall = listenToSpy.mock.calls[ 0 ];
			expect( firstCall[ 0 ] ).toBe( document );
			expect( firstCall[ 1 ] ).toBe( 'mousedown' );
			expect( firstCall[ 2 ] ).toBeTypeOf( 'function' );
			expect( firstCall[ 3 ] ).toBeUndefined();
		} );
	} );

	describe( 'static list of context elements', () => {
		beforeEach( () => {
			clickOutsideHandler( {
				emitter: new ( DomEmitterMixin() )(),
				activator,
				contextElements: [ contextElement1, contextElement2, shadowContextElement1, shadowContextElement2 ],
				callback: actionSpy
			} );
		} );

		it( 'should execute upon #mousedown outside of the contextElements (activator is active)', () => {
			activator.mockReturnValue( true );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should execute upon #mousedown outside of the contextElements (activator is active, unsupported shadow DOM)', () => {
			activator.mockReturnValue( true );

			const event = new Event( 'mousedown', { bubbles: true } );
			event.composedPath = undefined;

			document.body.dispatchEvent( event );

			expect( actionSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should execute upon #mousedown in the shadow root but outside the contextElements (activator is active)', () => {
			activator.mockReturnValue( true );

			shadowRootContainer.shadowRoot.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute upon #mousedown outside of the contextElements (activator is inactive)', () => {
			activator.mockReturnValue( false );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute upon #mousedown outside of the contextElements (activator is inactive, unsupported shadow DOM)', () => {
			activator.mockReturnValue( false );

			const event = new Event( 'mousedown', { bubbles: true } );
			event.composedPath = undefined;

			document.body.dispatchEvent( event );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute upon #mousedown in the shadow root but outside of the contextElements (activator is inactive)', () => {
			activator.mockReturnValue( false );

			shadowRootContainer.shadowRoot.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute upon #mousedown from one of the contextElements (activator is active)', () => {
			activator.mockReturnValue( true );

			contextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();

			contextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();

			shadowContextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();

			shadowContextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute upon #mousedown from one of the contextElements (activator is inactive)', () => {
			activator.mockReturnValue( false );

			contextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();

			contextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();

			shadowContextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();

			shadowContextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should execute if the activator function returns `true`', () => {
			const spy = vi.fn();

			activator.mockReturnValue( true );

			clickOutsideHandler( {
				emitter: new ( DomEmitterMixin() )(),
				activator,
				contextElements: [ contextElement1 ],
				callback: spy
			} );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not execute if the activator function returns `false`', () => {
			const spy = vi.fn();

			activator.mockReturnValue( false );

			clickOutsideHandler( {
				emitter: new ( DomEmitterMixin() )(),
				activator,
				contextElements: [ contextElement1 ],
				callback: spy
			} );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should react to the activator\'s return value change', () => {
			activator.mockReturnValue( true );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).toHaveBeenCalledOnce();

			activator.mockReturnValue( false );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			// Still called once, was not called second time.
			expect( actionSpy ).toHaveBeenCalledOnce();

			activator.mockReturnValue( true );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			// Called one more time.
			expect( actionSpy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should not execute if one of contextElements contains the DOM event target', () => {
			const target = document.createElement( 'div' );
			activator.mockReturnValue( true );

			contextElement2.appendChild( target );
			target.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute if one of contextElements in the shadow root contains the DOM event target', () => {
			const target = document.createElement( 'div' );
			activator.mockReturnValue( true );

			shadowContextElement1.appendChild( target );
			target.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute if one of contextElements in the shadow root is the DOM event target', () => {
			const target = document.createElement( 'div' );
			activator.mockReturnValue( true );

			shadowRootContainer.shadowRoot.appendChild( target );
			target.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'dynamic list of context elements', () => {
		beforeEach( () => {
			contextElementsCallback = vi.fn().mockReturnValue(
				[ contextElement1, contextElement2, shadowContextElement1, shadowContextElement2 ]
			);

			clickOutsideHandler( {
				emitter: new ( DomEmitterMixin() )(),
				activator,
				contextElements: contextElementsCallback,
				callback: actionSpy
			} );
		} );

		it( 'should execute upon #mousedown outside of the contextElements (activator is active)', () => {
			activator.mockReturnValue( true );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).toHaveBeenCalledOnce();
			expect( contextElementsCallback ).toHaveBeenCalledOnce();
		} );

		it( 'should execute upon #mousedown outside of the contextElements (activator is active, unsupported shadow DOM)', () => {
			activator.mockReturnValue( true );

			const event = new Event( 'mousedown', { bubbles: true } );
			event.composedPath = undefined;

			document.body.dispatchEvent( event );

			expect( actionSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should execute upon #mousedown in the shadow root but outside the contextElements (activator is active)', () => {
			activator.mockReturnValue( true );

			shadowRootContainer.shadowRoot.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute upon #mousedown outside of the contextElements (activator is inactive)', () => {
			activator.mockReturnValue( false );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute upon #mousedown outside of the contextElements (activator is inactive, unsupported shadow DOM)', () => {
			activator.mockReturnValue( false );

			const event = new Event( 'mousedown', { bubbles: true } );
			event.composedPath = undefined;

			document.body.dispatchEvent( event );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute upon #mousedown in the shadow root but outside of the contextElements (activator is inactive)', () => {
			activator.mockReturnValue( false );

			shadowRootContainer.shadowRoot.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute upon #mousedown from one of the contextElements (activator is active)', () => {
			activator.mockReturnValue( true );

			contextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();

			contextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();

			shadowContextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();

			shadowContextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute upon #mousedown from one of the contextElements (activator is inactive)', () => {
			activator.mockReturnValue( false );

			contextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();

			contextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();

			shadowContextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();

			shadowContextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should execute if the activator function returns `true`', () => {
			const spy = vi.fn();

			activator.mockReturnValue( true );

			clickOutsideHandler( {
				emitter: new ( DomEmitterMixin() )(),
				activator,
				contextElements: [ contextElement1 ],
				callback: spy
			} );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not execute if the activator function returns `false`', () => {
			const spy = vi.fn();

			activator.mockReturnValue( false );

			clickOutsideHandler( {
				emitter: new ( DomEmitterMixin() )(),
				activator,
				contextElements: [ contextElement1 ],
				callback: spy
			} );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should react to the activator\'s return value change', () => {
			activator.mockReturnValue( true );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).toHaveBeenCalledOnce();

			activator.mockReturnValue( false );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			// Still called once, was not called second time.
			expect( actionSpy ).toHaveBeenCalledOnce();

			activator.mockReturnValue( true );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			// Called one more time.
			expect( actionSpy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should not execute if one of contextElements contains the DOM event target', () => {
			const target = document.createElement( 'div' );
			activator.mockReturnValue( true );

			contextElement2.appendChild( target );
			target.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute if one of contextElements in the shadow root contains the DOM event target', () => {
			const target = document.createElement( 'div' );
			activator.mockReturnValue( true );

			shadowContextElement1.appendChild( target );
			target.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute if one of contextElements in the shadow root is the DOM event target', () => {
			const target = document.createElement( 'div' );
			activator.mockReturnValue( true );

			shadowRootContainer.shadowRoot.appendChild( target );
			target.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );
	} );
} );
