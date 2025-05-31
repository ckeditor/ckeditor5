/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import clickOutsideHandler from '../../src/bindings/clickoutsidehandler.js';

import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'clickOutsideHandler', () => {
	let activator, actionSpy, contextElement1, contextElement2, contextElementsCallback;
	let shadowRootContainer, shadowContextElement1, shadowContextElement2;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		activator = testUtils.sinon.stub().returns( false );
		contextElement1 = document.createElement( 'div' );
		contextElement2 = document.createElement( 'div' );
		shadowRootContainer = document.createElement( 'div' );
		shadowRootContainer.attachShadow( { mode: 'open' } );
		shadowContextElement1 = document.createElement( 'div' );
		shadowContextElement2 = document.createElement( 'div' );
		actionSpy = testUtils.sinon.spy();

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

			const listenToSpy = sinon.spy( emitter, 'listenTo' );

			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ contextElement1 ],
				callback: actionSpy,
				listenerOptions
			} );

			sinon.assert.calledWithMatch( listenToSpy.firstCall, document, 'mousedown', sinon.match.func, listenerOptions );
		} );

		it( 'should not forward listenerOptions parameter if not provided', () => {
			const emitter = new ( DomEmitterMixin() )();

			const listenToSpy = sinon.spy( emitter, 'listenTo' );

			clickOutsideHandler( {
				emitter,
				activator,
				contextElements: [ contextElement1 ],
				callback: actionSpy
			} );

			sinon.assert.calledWithMatch( listenToSpy.firstCall, document, 'mousedown', sinon.match.func );
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
			activator.returns( true );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledOnce( actionSpy );
		} );

		it( 'should execute upon #mousedown outside of the contextElements (activator is active, unsupported shadow DOM)', () => {
			activator.returns( true );

			const event = new Event( 'mousedown', { bubbles: true } );
			event.composedPath = undefined;

			document.body.dispatchEvent( event );

			sinon.assert.calledOnce( actionSpy );
		} );

		it( 'should execute upon #mousedown in the shadow root but outside the contextElements (activator is active)', () => {
			activator.returns( true );

			shadowRootContainer.shadowRoot.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should not execute upon #mousedown outside of the contextElements (activator is inactive)', () => {
			activator.returns( false );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should not execute upon #mousedown outside of the contextElements (activator is inactive, unsupported shadow DOM)', () => {
			activator.returns( false );

			const event = new Event( 'mousedown', { bubbles: true } );
			event.composedPath = undefined;

			document.body.dispatchEvent( event );

			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should not execute upon #mousedown in the shadow root but outside of the contextElements (activator is inactive)', () => {
			activator.returns( false );

			shadowRootContainer.shadowRoot.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should not execute upon #mousedown from one of the contextElements (activator is active)', () => {
			activator.returns( true );

			contextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );

			contextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );

			shadowContextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );

			shadowContextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should not execute upon #mousedown from one of the contextElements (activator is inactive)', () => {
			activator.returns( false );

			contextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );

			contextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );

			shadowContextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );

			shadowContextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should execute if the activator function returns `true`', () => {
			const spy = testUtils.sinon.spy();

			activator.returns( true );

			clickOutsideHandler( {
				emitter: new ( DomEmitterMixin() )(),
				activator,
				contextElements: [ contextElement1 ],
				callback: spy
			} );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should not execute if the activator function returns `false`', () => {
			const spy = testUtils.sinon.spy();

			activator.returns( false );

			clickOutsideHandler( {
				emitter: new ( DomEmitterMixin() )(),
				activator,
				contextElements: [ contextElement1 ],
				callback: spy
			} );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( spy );
		} );

		it( 'should react to the activator\'s return value change', () => {
			activator.returns( true );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledOnce( actionSpy );

			activator.returns( false );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			// Still called once, was not called second time.
			sinon.assert.calledOnce( actionSpy );

			activator.returns( true );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			// Called one more time.
			sinon.assert.calledTwice( actionSpy );
		} );

		it( 'should not execute if one of contextElements contains the DOM event target', () => {
			const target = document.createElement( 'div' );
			activator.returns( true );

			contextElement2.appendChild( target );
			target.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should not execute if one of contextElements in the shadow root contains the DOM event target', () => {
			const target = document.createElement( 'div' );
			activator.returns( true );

			shadowContextElement1.appendChild( target );
			target.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should not execute if one of contextElements in the shadow root is the DOM event target', () => {
			const target = document.createElement( 'div' );
			activator.returns( true );

			shadowRootContainer.shadowRoot.appendChild( target );
			target.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( actionSpy );
		} );
	} );

	describe( 'dynamic list of context elements', () => {
		beforeEach( () => {
			contextElementsCallback = testUtils.sinon.stub().returns(
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
			activator.returns( true );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledOnce( actionSpy );
			sinon.assert.calledOnce( contextElementsCallback );
		} );

		it( 'should execute upon #mousedown outside of the contextElements (activator is active, unsupported shadow DOM)', () => {
			activator.returns( true );

			const event = new Event( 'mousedown', { bubbles: true } );
			event.composedPath = undefined;

			document.body.dispatchEvent( event );

			sinon.assert.calledOnce( actionSpy );
		} );

		it( 'should execute upon #mousedown in the shadow root but outside the contextElements (activator is active)', () => {
			activator.returns( true );

			shadowRootContainer.shadowRoot.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should not execute upon #mousedown outside of the contextElements (activator is inactive)', () => {
			activator.returns( false );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should not execute upon #mousedown outside of the contextElements (activator is inactive, unsupported shadow DOM)', () => {
			activator.returns( false );

			const event = new Event( 'mousedown', { bubbles: true } );
			event.composedPath = undefined;

			document.body.dispatchEvent( event );

			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should not execute upon #mousedown in the shadow root but outside of the contextElements (activator is inactive)', () => {
			activator.returns( false );

			shadowRootContainer.shadowRoot.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should not execute upon #mousedown from one of the contextElements (activator is active)', () => {
			activator.returns( true );

			contextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );

			contextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );

			shadowContextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );

			shadowContextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should not execute upon #mousedown from one of the contextElements (activator is inactive)', () => {
			activator.returns( false );

			contextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );

			contextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );

			shadowContextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );

			shadowContextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should execute if the activator function returns `true`', () => {
			const spy = testUtils.sinon.spy();

			activator.returns( true );

			clickOutsideHandler( {
				emitter: new ( DomEmitterMixin() )(),
				activator,
				contextElements: [ contextElement1 ],
				callback: spy
			} );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should not execute if the activator function returns `false`', () => {
			const spy = testUtils.sinon.spy();

			activator.returns( false );

			clickOutsideHandler( {
				emitter: new ( DomEmitterMixin() )(),
				activator,
				contextElements: [ contextElement1 ],
				callback: spy
			} );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( spy );
		} );

		it( 'should react to the activator\'s return value change', () => {
			activator.returns( true );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledOnce( actionSpy );

			activator.returns( false );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			// Still called once, was not called second time.
			sinon.assert.calledOnce( actionSpy );

			activator.returns( true );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			// Called one more time.
			sinon.assert.calledTwice( actionSpy );
		} );

		it( 'should not execute if one of contextElements contains the DOM event target', () => {
			const target = document.createElement( 'div' );
			activator.returns( true );

			contextElement2.appendChild( target );
			target.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should not execute if one of contextElements in the shadow root contains the DOM event target', () => {
			const target = document.createElement( 'div' );
			activator.returns( true );

			shadowContextElement1.appendChild( target );
			target.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( actionSpy );
		} );

		it( 'should not execute if one of contextElements in the shadow root is the DOM event target', () => {
			const target = document.createElement( 'div' );
			activator.returns( true );

			shadowRootContainer.shadowRoot.appendChild( target );
			target.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( actionSpy );
		} );
	} );
} );
