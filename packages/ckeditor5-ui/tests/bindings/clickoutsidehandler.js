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
			expect( contextElementsCallback ).toHaveBeenCalledTimes( 2 );
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

	// Synthetic events in the tests above are not `composed`, so they never leave the shadow tree and never
	// reach the `document` listener. These tests dispatch `composed` events, the way the browser does, so the
	// retargeting of `event.target` and the truncation of `composedPath()` actually come into play.
	describe( 'shadow DOM', () => {
		let emitter, closedHost, closedRoot, closedContextElement, closedOtherElement;

		beforeEach( () => {
			emitter = new ( DomEmitterMixin() )();

			closedHost = document.createElement( 'div' );
			closedRoot = closedHost.attachShadow( { mode: 'closed' } );

			closedContextElement = document.createElement( 'div' );
			closedOtherElement = document.createElement( 'div' );

			closedRoot.appendChild( closedContextElement );
			closedRoot.appendChild( closedOtherElement );

			document.body.appendChild( closedHost );
		} );

		afterEach( () => {
			document.body.removeChild( closedHost );
		} );

		function dispatchMouseDown( target ) {
			target.dispatchEvent( new Event( 'mousedown', { bubbles: true, composed: true } ) );
		}

		it( 'should not execute upon #mousedown on a context element in a closed shadow root', () => {
			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ closedContextElement ],
				callback: actionSpy
			} );

			activator.mockReturnValue( true );

			dispatchMouseDown( closedContextElement );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute upon #mousedown inside a context element in a closed shadow root', () => {
			const target = document.createElement( 'div' );

			closedContextElement.appendChild( target );

			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ closedContextElement ],
				callback: actionSpy
			} );

			activator.mockReturnValue( true );

			dispatchMouseDown( target );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should execute upon #mousedown in a closed shadow root but outside the context elements', () => {
			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ closedContextElement ],
				callback: actionSpy
			} );

			activator.mockReturnValue( true );

			dispatchMouseDown( closedOtherElement );

			expect( actionSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should not execute upon #mousedown in a closed shadow root when the activator is inactive', () => {
			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ closedContextElement ],
				callback: actionSpy
			} );

			activator.mockReturnValue( false );

			dispatchMouseDown( closedOtherElement );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not execute upon #mousedown on a context element in an open shadow root', () => {
			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ shadowContextElement1 ],
				callback: actionSpy
			} );

			activator.mockReturnValue( true );

			dispatchMouseDown( shadowContextElement1 );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should execute upon #mousedown in an open shadow root but outside the context elements', () => {
			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ shadowContextElement1 ],
				callback: actionSpy
			} );

			activator.mockReturnValue( true );

			dispatchMouseDown( shadowContextElement2 );

			expect( actionSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should support context elements spread across several shadow roots', () => {
			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ closedContextElement, shadowContextElement1, contextElement1 ],
				callback: actionSpy
			} );

			activator.mockReturnValue( true );

			dispatchMouseDown( closedContextElement );
			expect( actionSpy ).not.toHaveBeenCalled();

			dispatchMouseDown( shadowContextElement1 );
			expect( actionSpy ).not.toHaveBeenCalled();

			dispatchMouseDown( contextElement1 );
			expect( actionSpy ).not.toHaveBeenCalled();

			dispatchMouseDown( closedOtherElement );
			expect( actionSpy ).toHaveBeenCalledOnce();
		} );

		// The shadow root listener is added while the very same event is still travelling down the capture
		// phase, so it is in place by the time the event bubbles back up through that root.
		it( 'should recognize the first #mousedown inside a context element attached after the handler was created', () => {
			const lateContextElement = document.createElement( 'div' );

			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: () => [ lateContextElement ],
				callback: actionSpy
			} );

			activator.mockReturnValue( true );

			closedRoot.appendChild( lateContextElement );

			dispatchMouseDown( lateContextElement );

			expect( actionSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not attach shadow root listeners before the first #mousedown', () => {
			const listenToSpy = vi.spyOn( emitter, 'listenTo' );

			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ closedContextElement ],
				callback: actionSpy
			} );

			expect( listenToSpy.mock.calls.some( call => call[ 0 ] === closedRoot ) ).toBe( false );
		} );

		it( 'should attach a listener to the shadow root a context element lives in', () => {
			const listenToSpy = vi.spyOn( emitter, 'listenTo' );

			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ closedContextElement ],
				callback: actionSpy
			} );

			activator.mockReturnValue( true );

			dispatchMouseDown( closedContextElement );

			expect( listenToSpy ).toHaveBeenCalledWith( closedRoot, 'mousedown', expect.any( Function ) );
		} );

		it( 'should attach only one listener per shadow root, no matter how many events or elements', () => {
			const listenToSpy = vi.spyOn( emitter, 'listenTo' );

			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ closedContextElement, closedOtherElement ],
				callback: actionSpy
			} );

			activator.mockReturnValue( true );

			dispatchMouseDown( closedContextElement );
			dispatchMouseDown( closedContextElement );

			const rootCalls = listenToSpy.mock.calls.filter( call => call[ 0 ] === closedRoot );

			expect( rootCalls ).toHaveLength( 1 );
		} );

		it( 'should invoke the contextElements callback in every listener the event reaches', () => {
			const callbackSpy = vi.fn().mockReturnValue( [ closedContextElement ] );

			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: callbackSpy,
				callback: actionSpy
			} );

			activator.mockReturnValue( true );

			dispatchMouseDown( closedOtherElement );

			expect( callbackSpy ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'should consult the activator in every listener the event reaches', () => {
			activator.mockReturnValue( true );

			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ closedContextElement ],
				callback: actionSpy
			} );

			dispatchMouseDown( closedOtherElement );

			expect( activator ).toHaveBeenCalledTimes( 3 );
			expect( actionSpy ).toHaveBeenCalledOnce();
		} );
	} );
} );
