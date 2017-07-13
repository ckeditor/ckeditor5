/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, Event */

import clickOutsideHandler from '../../src/bindings/clickoutsidehandler';

import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'clickOutsideHandler', () => {
	let activator, actionSpy, contextElement1, contextElement2;

	beforeEach( () => {
		activator = testUtils.sinon.stub().returns( false );
		contextElement1 = document.createElement( 'div' );
		contextElement2 = document.createElement( 'div' );
		actionSpy = testUtils.sinon.spy();

		document.body.appendChild( contextElement1 );
		document.body.appendChild( contextElement2 );

		clickOutsideHandler( {
			emitter: Object.create( DomEmitterMixin ),
			activator,
			contextElements: [ contextElement1, contextElement2 ],
			callback: actionSpy
		} );
	} );

	afterEach( () => {
		document.body.removeChild( contextElement1 );
		document.body.removeChild( contextElement2 );
	} );

	it( 'should fired callback after clicking out of context element when listener is active', () => {
		activator.returns( true );

		document.body.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

		sinon.assert.calledOnce( actionSpy );
	} );

	it( 'should not fired callback after clicking out of context element when listener is not active', () => {
		activator.returns( false );

		document.body.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

		sinon.assert.notCalled( actionSpy );
	} );

	it( 'should not fired callback after clicking on context element when listener is active', () => {
		activator.returns( true );

		contextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
		sinon.assert.notCalled( actionSpy );

		contextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
		sinon.assert.notCalled( actionSpy );
	} );

	it( 'should not fired callback after clicking on context element when listener is not active', () => {
		activator.returns( false );

		contextElement1.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
		sinon.assert.notCalled( actionSpy );

		contextElement2.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );
		sinon.assert.notCalled( actionSpy );
	} );

	it( 'should listen when model initial `ifActive` value was `true`', () => {
		const spy = testUtils.sinon.spy();

		activator.returns( true );

		clickOutsideHandler( {
			emitter: Object.create( DomEmitterMixin ),
			activator,
			contextElements: [ contextElement1 ],
			callback: spy
		} );

		document.body.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

		sinon.assert.calledOnce( spy );
	} );

	it( 'should not listen when model initial `ifActive` value was `false`', () => {
		const spy = testUtils.sinon.spy();

		activator.returns( false );

		clickOutsideHandler( {
			emitter: Object.create( DomEmitterMixin ),
			activator,
			contextElements: [ contextElement1 ],
			callback: spy
		} );

		document.body.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

		sinon.assert.notCalled( spy );
	} );

	it( 'should react on model `ifActive` property change', () => {
		activator.returns( true );

		document.body.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

		sinon.assert.calledOnce( actionSpy );

		activator.returns( false );

		document.body.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

		// Still called once, was not called second time.
		sinon.assert.calledOnce( actionSpy );

		activator.returns( true );

		document.body.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

		// Called one more time.
		sinon.assert.calledTwice( actionSpy );
	} );
} );
