/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualTestEditor } from '../tests/_utils/virtualtesteditor.js';
import { EditingKeystrokeHandler } from '../src/editingkeystrokehandler.js';
import { keyCodes, env } from '@ckeditor/ckeditor5-utils';

describe( 'EditingKeystrokeHandler', () => {
	let editor, keystrokes, executeSpy;

	beforeEach( () => {
		return VirtualTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				keystrokes = new EditingKeystrokeHandler( editor );
				executeSpy = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
			} );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	describe( 'set()', () => {
		describe( 'with a command', () => {
			it( 'prevents default when the keystroke was handled', () => {
				const keyEvtData = getCtrlA();

				keystrokes.set( 'Ctrl+A', 'foo' );
				keystrokes.press( keyEvtData );

				expect( executeSpy ).toHaveBeenCalledExactlyOnceWith( 'foo' );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
			} );

			it( 'does not prevent default when the keystroke was not handled', () => {
				const keyEvtData = getCtrlA();

				keystrokes.press( keyEvtData );

				expect( executeSpy ).not.toHaveBeenCalled();
				expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
				expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();
			} );

			it( 'provides a callback which stops the event and remaining callbacks in the keystroke handler', () => {
				const spy1 = vi.fn();
				const spy2 = vi.fn();
				const spy3 = vi.fn();

				keystrokes.set( [ 'ctrl', 'A' ], spy1 );
				keystrokes.set( [ 'ctrl', 'A' ], spy2, { priority: 'high' } );
				keystrokes.set( [ 'ctrl', 'A' ], 'foo', { priority: 'low' } );
				keystrokes.set( [ 'ctrl', 'A' ], ( keyEvtData, cancel ) => {
					spy3();
					cancel();
				} );

				keystrokes.press( getCtrlA() );

				expect( spy2 ).toHaveBeenCalled();
				expect( spy1 ).toHaveBeenCalled();
				expect( spy3 ).toHaveBeenCalled();
				expect( spy2.mock.invocationCallOrder[ 0 ] ).toBeLessThan( spy1.mock.invocationCallOrder[ 0 ] );
				expect( spy1.mock.invocationCallOrder[ 0 ] ).toBeLessThan( spy3.mock.invocationCallOrder[ 0 ] );
				expect( executeSpy ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'with a callback', () => {
			it( 'never prevents default', () => {
				const callback = vi.fn();
				const keyEvtData = getCtrlA();

				keystrokes.set( 'Ctrl+A', callback );
				keystrokes.press( keyEvtData );

				expect( callback ).toHaveBeenCalledOnce();
				expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
				expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();
			} );
		} );

		it( 'supports priorities', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();
			const spy3 = vi.fn();

			keystrokes.set( [ 'ctrl', 'A' ], spy1 );
			keystrokes.set( [ 'ctrl', 'A' ], spy2, { priority: 'high' } );
			keystrokes.set( [ 'ctrl', 'A' ], 'foo', { priority: 'low' } );
			keystrokes.set( [ 'ctrl', 'A' ], spy3 );

			keystrokes.press( getCtrlA() );

			expect( spy2 ).toHaveBeenCalled();
			expect( spy1 ).toHaveBeenCalled();
			expect( spy3 ).toHaveBeenCalled();
			expect( executeSpy ).toHaveBeenCalled();
			expect( spy2.mock.invocationCallOrder[ 0 ] ).toBeLessThan( spy1.mock.invocationCallOrder[ 0 ] );
			expect( spy1.mock.invocationCallOrder[ 0 ] ).toBeLessThan( spy3.mock.invocationCallOrder[ 0 ] );
			expect( spy3.mock.invocationCallOrder[ 0 ] ).toBeLessThan( executeSpy.mock.invocationCallOrder[ 0 ] );
		} );
	} );

	describe( 'press()', () => {
		it( 'executes a command', () => {
			keystrokes.set( 'Ctrl+A', 'foo' );

			const wasHandled = keystrokes.press( getCtrlA() );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'foo' );
			expect( wasHandled ).toBe( true );
		} );

		it( 'executes a callback', () => {
			const callback = vi.fn();

			keystrokes.set( 'Ctrl+A', callback );

			const wasHandled = keystrokes.press( getCtrlA() );

			expect( executeSpy ).not.toHaveBeenCalled();
			expect( callback ).toHaveBeenCalledOnce();
			expect( wasHandled ).toBe( true );
		} );
	} );
} );

function getCtrlA() {
	return {
		keyCode: keyCodes.a,
		ctrlKey: !env.isMac,
		metaKey: env.isMac,
		preventDefault: vi.fn(),
		stopPropagation: vi.fn()
	};
}
