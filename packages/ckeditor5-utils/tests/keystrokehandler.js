/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import EmitterMixin from '../src/emittermixin.js';
import KeystrokeHandler from '../src/keystrokehandler.js';
import { keyCodes } from '../src/keyboard.js';
import env from '../src/env.js';

describe( 'KeystrokeHandler', () => {
	const Emitter = EmitterMixin();

	const initialEnvMac = env.isMac;
	let emitter, keystrokes;

	beforeEach( () => {
		env.isMac = false;

		emitter = new Emitter();
		keystrokes = new KeystrokeHandler();

		keystrokes.listenTo( emitter );
	} );

	afterEach( () => {
		env.isMac = initialEnvMac;
	} );

	describe( 'listenTo()', () => {
		it( 'activates the listening on the emitter', () => {
			const spy = sinon.spy();
			const keyEvtData = getCtrlA();

			keystrokes.set( 'Ctrl+A', spy );
			emitter.fire( 'keydown', keyEvtData );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, keyEvtData, sinon.match.func );
		} );
	} );

	describe( 'press()', () => {
		it( 'executes a callback', () => {
			const spy = sinon.spy();
			const keyEvtData = getCtrlA();

			keystrokes.set( 'Ctrl+A', spy );

			const wasHandled = keystrokes.press( keyEvtData );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, keyEvtData, sinon.match.func );
			expect( wasHandled ).to.be.true;
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

			keystrokes.set( [ 'Ctrl', 'A' ], spy );

			expect( keystrokes.press( getCtrlA() ) ).to.be.true;
		} );

		it( 'aggregates multiple callbacks for the same keystroke', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			keystrokes.set( [ 'Ctrl', 'A' ], spy1 );
			keystrokes.set( [ 'Ctrl', 'A' ], spy2 );

			keystrokes.press( getCtrlA() );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledOnce( spy2 );
		} );

		it( 'supports priorities', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const spy3 = sinon.spy();
			const spy4 = sinon.spy();

			keystrokes.set( [ 'Ctrl', 'A' ], spy1 );
			keystrokes.set( [ 'Ctrl', 'A' ], spy2, { priority: 'high' } );
			keystrokes.set( [ 'Ctrl', 'A' ], spy3, { priority: 'low' } );
			keystrokes.set( [ 'Ctrl', 'A' ], spy4 );

			keystrokes.press( getCtrlA() );

			sinon.assert.callOrder( spy2, spy1, spy4, spy3 );
		} );

		it( 'provides a callback which causes preventDefault and stopPropagation in the DOM', done => {
			const keyEvtData = getCtrlA();

			keystrokes.set( 'Ctrl+A', ( data, cancel ) => {
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

		it( 'provides a callback which stops the event and remaining callbacks in the keystroke handler', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const spy3 = sinon.spy();
			const spy4 = sinon.spy();

			keystrokes.set( [ 'Ctrl', 'A' ], spy1 );
			keystrokes.set( [ 'Ctrl', 'A' ], spy2, { priority: 'high' } );
			keystrokes.set( [ 'Ctrl', 'A' ], spy3, { priority: 'low' } );
			keystrokes.set( [ 'Ctrl', 'A' ], ( keyEvtData, cancel ) => {
				spy4();
				cancel();
			} );

			keystrokes.press( getCtrlA() );

			sinon.assert.callOrder( spy2, spy1, spy4 );
			sinon.assert.notCalled( spy3 );
		} );

		it( 'should support event filtering using a callback', () => {
			const spy = sinon.spy();

			const keyEvtDataFails = getCtrlA();
			const keyEvtDataPasses = getCtrlA();
			keyEvtDataPasses.foo = true;

			keystrokes.set( 'Ctrl+A', spy, {
				filter: evt => evt.foo
			} );

			emitter.fire( 'keydown', keyEvtDataFails );
			sinon.assert.notCalled( spy );

			emitter.fire( 'keydown', keyEvtDataPasses );
			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'stopListening()', () => {
		it( 'detaches events from the given emitter', () => {
			const spy = sinon.spy();
			const newEmitter = new Emitter();

			keystrokes.listenTo( newEmitter );

			keystrokes.set( 'Ctrl+A', spy );
			keystrokes.stopListening( emitter );

			emitter.fire( 'keydown', getCtrlA() );

			sinon.assert.notCalled( spy );

			newEmitter.fire( 'keydown', getCtrlA() );

			sinon.assert.called( spy );
		} );

		it( 'detaches events from all emitters', () => {
			const spy = sinon.spy();
			const newEmitter = new Emitter();

			keystrokes.listenTo( newEmitter );

			keystrokes.set( 'Ctrl+A', spy );
			keystrokes.stopListening();

			emitter.fire( 'keydown', getCtrlA() );
			newEmitter.fire( 'keydown', getCtrlA() );

			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'detaches events from all emitters', () => {
			const spy = sinon.spy( keystrokes, 'stopListening' );

			keystrokes.destroy();

			sinon.assert.calledWithExactly( spy );
		} );
	} );
} );

function getCtrlA() {
	return {
		keyCode: keyCodes.a,
		ctrlKey: true,
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy()
	};
}
