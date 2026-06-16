/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { EmitterMixin } from '../src/emittermixin.js';
import { KeystrokeHandler } from '../src/keystrokehandler.js';
import { keyCodes } from '../src/keyboard.js';
import { env } from '../src/env.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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
			const spy = vi.fn();
			const keyEvtData = getCtrlA();

			keystrokes.set( 'Ctrl+A', spy );
			emitter.fire( 'keydown', keyEvtData );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy ).toHaveBeenCalledWith( keyEvtData, expect.any( Function ) );
		} );
	} );

	describe( 'press()', () => {
		it( 'executes a callback', () => {
			const spy = vi.fn();
			const keyEvtData = getCtrlA();

			keystrokes.set( 'Ctrl+A', spy );

			const wasHandled = keystrokes.press( keyEvtData );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy ).toHaveBeenCalledWith( keyEvtData, expect.any( Function ) );
			expect( wasHandled ).toBe( true );
		} );

		it( 'returns false when no handler', () => {
			const keyEvtData = getCtrlA();

			const wasHandled = keystrokes.press( keyEvtData );

			expect( wasHandled ).toBe( false );
		} );
	} );

	describe( 'set()', () => {
		it( 'handles array format', () => {
			const spy = vi.fn();

			keystrokes.set( [ 'Ctrl', 'A' ], spy );

			expect( keystrokes.press( getCtrlA() ) ).toBe( true );
		} );

		it( 'aggregates multiple callbacks for the same keystroke', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();

			keystrokes.set( [ 'Ctrl', 'A' ], spy1 );
			keystrokes.set( [ 'Ctrl', 'A' ], spy2 );

			keystrokes.press( getCtrlA() );

			expect( spy1 ).toHaveBeenCalledTimes( 1 );
			expect( spy2 ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'supports priorities', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();
			const spy3 = vi.fn();
			const spy4 = vi.fn();

			keystrokes.set( [ 'Ctrl', 'A' ], spy1 );
			keystrokes.set( [ 'Ctrl', 'A' ], spy2, { priority: 'high' } );
			keystrokes.set( [ 'Ctrl', 'A' ], spy3, { priority: 'low' } );
			keystrokes.set( [ 'Ctrl', 'A' ], spy4 );

			keystrokes.press( getCtrlA() );

			expect( spy2.mock.invocationCallOrder[ 0 ] ).toBeLessThan( spy1.mock.invocationCallOrder[ 0 ] );
			expect( spy1.mock.invocationCallOrder[ 0 ] ).toBeLessThan( spy4.mock.invocationCallOrder[ 0 ] );
			expect( spy4.mock.invocationCallOrder[ 0 ] ).toBeLessThan( spy3.mock.invocationCallOrder[ 0 ] );
		} );

		it( 'provides a callback which causes preventDefault and stopPropagation in the DOM', () => {
			const keyEvtData = getCtrlA();

			keystrokes.set( 'Ctrl+A', ( data, cancel ) => {
				expect( data ).toBe( keyEvtData );

				expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
				expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();

				cancel();

				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
			} );

			emitter.fire( 'keydown', keyEvtData );
		} );

		it( 'provides a callback which stops the event and remaining callbacks in the keystroke handler', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();
			const spy3 = vi.fn();
			const spy4 = vi.fn();

			keystrokes.set( [ 'Ctrl', 'A' ], spy1 );
			keystrokes.set( [ 'Ctrl', 'A' ], spy2, { priority: 'high' } );
			keystrokes.set( [ 'Ctrl', 'A' ], spy3, { priority: 'low' } );
			keystrokes.set( [ 'Ctrl', 'A' ], ( keyEvtData, cancel ) => {
				spy4();
				cancel();
			} );

			keystrokes.press( getCtrlA() );

			expect( spy2.mock.invocationCallOrder[ 0 ] ).toBeLessThan( spy1.mock.invocationCallOrder[ 0 ] );
			expect( spy1.mock.invocationCallOrder[ 0 ] ).toBeLessThan( spy4.mock.invocationCallOrder[ 0 ] );
			expect( spy3 ).not.toHaveBeenCalled();
		} );

		it( 'should support event filtering using a callback', () => {
			const spy = vi.fn();

			const keyEvtDataFails = getCtrlA();
			const keyEvtDataPasses = getCtrlA();
			keyEvtDataPasses.foo = true;

			keystrokes.set( 'Ctrl+A', spy, {
				filter: evt => evt.foo
			} );

			emitter.fire( 'keydown', keyEvtDataFails );
			expect( spy ).not.toHaveBeenCalled();

			emitter.fire( 'keydown', keyEvtDataPasses );
			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'stopListening()', () => {
		it( 'detaches events from the given emitter', () => {
			const spy = vi.fn();
			const newEmitter = new Emitter();

			keystrokes.listenTo( newEmitter );

			keystrokes.set( 'Ctrl+A', spy );
			keystrokes.stopListening( emitter );

			emitter.fire( 'keydown', getCtrlA() );

			expect( spy ).not.toHaveBeenCalled();

			newEmitter.fire( 'keydown', getCtrlA() );

			expect( spy ).toHaveBeenCalled();
		} );

		it( 'detaches events from all emitters', () => {
			const spy = vi.fn();
			const newEmitter = new Emitter();

			keystrokes.listenTo( newEmitter );

			keystrokes.set( 'Ctrl+A', spy );
			keystrokes.stopListening();

			emitter.fire( 'keydown', getCtrlA() );
			newEmitter.fire( 'keydown', getCtrlA() );

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'detaches events from all emitters', () => {
			const spy = vi.spyOn( keystrokes, 'stopListening' );

			keystrokes.destroy();

			expect( spy ).toHaveBeenCalledWith();
		} );
	} );
} );

function getCtrlA() {
	return {
		keyCode: keyCodes.a,
		ctrlKey: true,
		preventDefault: vi.fn(),
		stopPropagation: vi.fn()
	};
}
