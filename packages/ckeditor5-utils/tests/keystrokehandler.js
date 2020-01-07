/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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

			keystrokeHandler.set( 'Ctrl+A', spy );

			keystrokeHandler.destroy();

			const wasHandled = keystrokeHandler.press( getCtrlA() );

			expect( wasHandled ).to.be.false;
			sinon.assert.notCalled( spy );
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
