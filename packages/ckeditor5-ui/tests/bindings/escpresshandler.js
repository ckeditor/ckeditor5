/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import escPressHandler from '../../src/bindings/escpresshandler';

import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'escPressHandler', () => {
	let emitter, actionSpy, activator;

	beforeEach( () => {
		activator = testUtils.sinon.stub().returns( false );
		actionSpy = testUtils.sinon.spy();
		emitter = Object.create( DomEmitterMixin );

		escPressHandler( {
			emitter,
			activator,
			callback: actionSpy
		} );
	} );

	afterEach( () => {
		emitter.stopListening();
	} );

	it( 'should fired callback after pressing `Esc` when listener is active', () => {
		activator.returns( true );

		dispatchKeyboardEvent( document, 'keydown', keyCodes.esc );

		sinon.assert.calledOnce( actionSpy );
	} );

	it( 'should not fired callback after pressing a key different than `Esc`', () => {
		activator.returns( true );

		dispatchKeyboardEvent( document, 'keydown', keyCodes.ctrlKey );

		sinon.assert.notCalled( actionSpy );
	} );

	it( 'should not fired callback after pressing Esc when listener is not active', () => {
		activator.returns( false );

		dispatchKeyboardEvent( document, 'keydown', keyCodes.enter );

		sinon.assert.notCalled( actionSpy );
	} );

	it( 'should not fired callback after pressing other than Esc key when listener is active', () => {
		activator.returns( false );

		dispatchKeyboardEvent( document, 'keydown', keyCodes.esc );

		sinon.assert.notCalled( actionSpy );
	} );

	it( 'should listen when model initial `ifActive` value was `true`', () => {
		const spy = testUtils.sinon.spy();

		activator.returns( true );

		emitter = Object.create( DomEmitterMixin );

		escPressHandler( {
			emitter,
			activator,
			callback: spy
		} );

		dispatchKeyboardEvent( document, 'keydown', keyCodes.esc );

		sinon.assert.calledOnce( spy );
	} );

	it( 'should not listen when model initial `ifActive` value was `false`', () => {
		const spy = testUtils.sinon.spy();

		activator.returns( false );

		emitter = Object.create( DomEmitterMixin );

		escPressHandler( {
			emitter,
			activator,
			callback: spy
		} );

		dispatchKeyboardEvent( document, 'keydown', keyCodes.esc );

		sinon.assert.notCalled( spy );
	} );

	it( 'should react on model `ifActive` property change', () => {
		activator.returns( true );

		dispatchKeyboardEvent( document, 'keydown', keyCodes.esc );

		sinon.assert.calledOnce( actionSpy );

		activator.returns( false );

		dispatchKeyboardEvent( document, 'keydown', keyCodes.esc );

		// Still called once, was not called second time.
		sinon.assert.calledOnce( actionSpy );

		activator.returns( true );

		dispatchKeyboardEvent( document, 'keydown', keyCodes.esc );

		// Called one more time.
		sinon.assert.calledTwice( actionSpy );
	} );
} );

// Creates and dispatches keyboard event with specified keyCode.
//
// @private
// @param {EventTarget} eventTarget
// @param {String} eventName
// @param {Number} keyCode
function dispatchKeyboardEvent( eventTarget, eventName, keyCode ) {
	const event = document.createEvent( 'Events' );

	event.initEvent( eventName, true, true );
	event.which = keyCode;
	event.keyCode = keyCode;

	eventTarget.dispatchEvent( event );
}
