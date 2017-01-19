/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import EmitterMixin from '../src/emittermixin';
import KeystrokeHandler from '../src/keystrokehandler';
import { keyCodes } from '../src/keyboard';

describe( 'KeystrokeHandler', () => {
	let emitter, keystrokes;

	beforeEach( () => {
		emitter = Object.create( EmitterMixin );
		keystrokes = new KeystrokeHandler();

		keystrokes.listenTo( emitter );
	} );

	describe( 'listenTo()', () => {
		it( 'activates the listening on the emitter', () => {
			emitter = Object.create( EmitterMixin );
			keystrokes = new KeystrokeHandler();

			const spy = sinon.spy( keystrokes, 'press' );
			const keyEvtData = { keyCode: 1 };

			emitter.fire( 'keydown', keyEvtData );

			expect( spy.notCalled ).to.be.true;

			keystrokes.listenTo( emitter );
			emitter.fire( 'keydown', keyEvtData );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, keyEvtData );
		} );

		it( 'triggers #press on #keydown', () => {
			const spy = sinon.spy( keystrokes, 'press' );
			const keyEvtData = { keyCode: 1 };

			emitter.fire( 'keydown', keyEvtData );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, keyEvtData );
		} );
	} );

	describe( 'press()', () => {
		it( 'executes a callback', () => {
			const spy = sinon.spy();
			const keyEvtData = getCtrlA();

			keystrokes.set( 'ctrl + A', spy );

			const wasHandled = keystrokes.press( keyEvtData );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, keyEvtData, sinon.match.func );
			expect( wasHandled ).to.be.true;
		} );

		it( 'provides a callback which both preventDefault and stopPropagation', ( done ) => {
			const keyEvtData = getCtrlA();

			Object.assign( keyEvtData, {
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			keystrokes.set( 'ctrl + A', ( data, cancel ) => {
				expect( data ).to.equal( keyEvtData );

				sinon.assert.notCalled( keyEvtData.preventDefault );
				sinon.assert.notCalled( keyEvtData.stopPropagation );

				cancel();

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				done();
			} );

			emitter.fire( 'keydown', keyEvtData );
		} );

		it( 'returns false when no handler', () => {
			const keyEvtData = getCtrlA();

			const wasHandled = keystrokes.press( keyEvtData );

			expect( wasHandled ).to.be.false;
		} );
	} );

	describe( 'set()', () => {
		it( 'handles array format', () => {
			const spy = sinon.spy();

			keystrokes.set( [ 'ctrl', 'A' ], spy );

			expect( keystrokes.press( getCtrlA() ) ).to.be.true;
		} );

		it( 'aggregates multiple callbacks for the same keystroke', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			keystrokes.set( [ 'ctrl', 'A' ], spy1 );
			keystrokes.set( [ 'ctrl', 'A' ], spy2 );

			keystrokes.press( getCtrlA() );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledOnce( spy2 );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'detaches #keydown listener', () => {
			const spy = sinon.spy( keystrokes, 'press' );

			keystrokes.destroy();

			emitter.fire( 'keydown', { keyCode: 1 } );

			sinon.assert.notCalled( spy );
		} );

		it( 'removes all keystrokes', () => {
			const spy = sinon.spy();
			const keystrokeHandler = keystrokes;

			keystrokeHandler.set( 'ctrl + A', spy );

			keystrokeHandler.destroy();

			const wasHandled = keystrokeHandler.press( getCtrlA() );

			expect( wasHandled ).to.be.false;
			sinon.assert.notCalled( spy );
		} );
	} );
} );

function getCtrlA() {
	return { keyCode: keyCodes.a, ctrlKey: true };
}
