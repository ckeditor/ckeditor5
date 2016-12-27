/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, Event */

import clickOutsideHandler from 'ckeditor5-ui/src/bindings/clickoutsidehandler';

import DomEmitterMixin from 'ckeditor5-utils/src/dom/emittermixin';

import testUtils from 'ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'clickOutsideHandler', () => {
	let activator, actionSpy, contextElement;

	beforeEach( () => {
		activator = testUtils.sinon.stub().returns( false );
		contextElement = document.createElement( 'div' );
		actionSpy = testUtils.sinon.spy();

		document.body.appendChild( contextElement );

		clickOutsideHandler( {
			emitter: Object.create( DomEmitterMixin ),
			activator: activator,
			contextElement: contextElement,
			callback: actionSpy
		} );
	} );

	afterEach( () => {
		document.body.removeChild( contextElement );
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

		contextElement.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

		sinon.assert.notCalled( actionSpy );
	} );

	it( 'should not fired callback after clicking on context element when listener is not active', () => {
		activator.returns( false );

		contextElement.dispatchEvent( new Event( 'mouseup', { bubbles: true } ) );

		sinon.assert.notCalled( actionSpy );
	} );

	it( 'should listen when model initial `ifActive` value was `true`', () => {
		const spy = testUtils.sinon.spy();

		activator.returns( true );

		clickOutsideHandler( {
			emitter: Object.create( DomEmitterMixin ),
			activator: activator,
			contextElement: contextElement,
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
			activator: activator,
			contextElement: contextElement,
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
