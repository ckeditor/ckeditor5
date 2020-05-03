/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import env from '../src/env';
import { keyCodes, getCode, parseKeystroke, getEnvKeystrokeText } from '../src/keyboard';
import { expectToThrowCKEditorError } from './_utils/utils';

describe( 'Keyboard', () => {
	describe( 'keyCodes', () => {
		it( 'contains numbers', () => {
			expect( keyCodes[ '0' ] ).to.equal( 48 );
			expect( keyCodes[ '9' ] ).to.equal( 57 );
		} );

		it( 'contains letters', () => {
			expect( keyCodes.a ).to.equal( 65 );
			expect( keyCodes.z ).to.equal( 90 );
		} );

		it( 'modifiers and other keys', () => {
			expect( keyCodes.delete ).to.equal( 46 );
			expect( keyCodes.ctrl ).to.equal( 0x110000 );
			expect( keyCodes.cmd ).to.equal( 0x110000 );
			expect( keyCodes.f1 ).to.equal( 112 );
			expect( keyCodes.f12 ).to.equal( 123 );

			expect( keyCodes ).to.include.keys(
				'ctrl', 'cmd', 'shift', 'alt',
				'arrowleft', 'arrowup', 'arrowright', 'arrowdown',
				'backspace', 'delete', 'enter', 'space', 'esc', 'tab',
				'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'
			);
		} );
	} );

	describe( 'getCode', () => {
		it( 'gets code of a number', () => {
			expect( getCode( '0' ) ).to.equal( 48 );
		} );

		it( 'gets code of a letter', () => {
			expect( getCode( 'a' ) ).to.equal( 65 );
		} );

		it( 'gets code of a function key', () => {
			expect( getCode( 'f6' ) ).to.equal( 117 );
		} );

		it( 'is case insensitive', () => {
			expect( getCode( 'A' ) ).to.equal( 65 );
			expect( getCode( 'Ctrl' ) ).to.equal( 0x110000 );
			expect( getCode( 'ENTER' ) ).to.equal( 13 );
		} );

		it( 'throws when passed unknown key name', () => {
			expectToThrowCKEditorError( () => {
				getCode( 'foo' );
			}, /^keyboard-unknown-key:/, null );
		} );

		it( 'gets code of a keystroke info', () => {
			expect( getCode( { keyCode: 48 } ) ).to.equal( 48 );
		} );

		it( 'adds modifiers to the keystroke code', () => {
			expect( getCode( { keyCode: 48, altKey: true, ctrlKey: true, shiftKey: true } ) )
				.to.equal( 48 + 0x110000 + 0x220000 + 0x440000 );
		} );
	} );

	describe( 'parseKeystroke', () => {
		it( 'parses string', () => {
			expect( parseKeystroke( 'ctrl+a' ) ).to.equal( 0x110000 + 65 );
		} );

		it( 'allows spacing', () => {
			expect( parseKeystroke( 'ctrl +   a' ) ).to.equal( 0x110000 + 65 );
		} );

		it( 'is case-insensitive', () => {
			expect( parseKeystroke( 'Ctrl+A' ) ).to.equal( 0x110000 + 65 );
		} );

		it( 'works with an array', () => {
			expect( parseKeystroke( [ 'ctrl', 'a' ] ) ).to.equal( 0x110000 + 65 );
		} );

		it( 'works with an array which contains numbers', () => {
			expect( parseKeystroke( [ 'shift', 33 ] ) ).to.equal( 0x220000 + 33 );
		} );

		it( 'works with two modifiers', () => {
			expect( parseKeystroke( 'ctrl+shift+a' ) ).to.equal( 0x110000 + 0x220000 + 65 );
		} );

		it( 'throws on unknown name', () => {
			expectToThrowCKEditorError( () => {
				parseKeystroke( 'foo' );
			}, /^keyboard-unknown-key:/, null );
		} );
	} );

	describe( 'getEnvKeystrokeText', () => {
		const initialEnvMac = env.isMac;

		afterEach( () => {
			env.isMac = initialEnvMac;
		} );

		describe( 'on Macintosh', () => {
			beforeEach( () => {
				env.isMac = true;
			} );

			it( 'replaces CTRL with ⌘', () => {
				expect( getEnvKeystrokeText( 'CTRL' ) ).to.equal( '⌘' );
				expect( getEnvKeystrokeText( 'CTRL+A' ) ).to.equal( '⌘A' );
				expect( getEnvKeystrokeText( 'ctrl+A' ) ).to.equal( '⌘A' );
			} );

			it( 'replaces SHIFT with ⇧', () => {
				expect( getEnvKeystrokeText( 'SHIFT' ) ).to.equal( '⇧' );
				expect( getEnvKeystrokeText( 'SHIFT+A' ) ).to.equal( '⇧A' );
				expect( getEnvKeystrokeText( 'shift+A' ) ).to.equal( '⇧A' );
			} );

			it( 'replaces ALT with ⌥', () => {
				expect( getEnvKeystrokeText( 'ALT' ) ).to.equal( '⌥' );
				expect( getEnvKeystrokeText( 'ALT+A' ) ).to.equal( '⌥A' );
				expect( getEnvKeystrokeText( 'alt+A' ) ).to.equal( '⌥A' );
			} );

			it( 'work for multiple modifiers', () => {
				expect( getEnvKeystrokeText( 'CTRL+SHIFT+X' ) ).to.equal( '⌘⇧X' );
				expect( getEnvKeystrokeText( 'ALT+SHIFT+X' ) ).to.equal( '⌥⇧X' );
			} );

			it( 'does not touch other keys', () => {
				expect( getEnvKeystrokeText( 'ESC+A' ) ).to.equal( 'ESC+A' );
				expect( getEnvKeystrokeText( 'TAB' ) ).to.equal( 'TAB' );
				expect( getEnvKeystrokeText( 'A' ) ).to.equal( 'A' );
				expect( getEnvKeystrokeText( 'A+CTRL+B' ) ).to.equal( 'A+⌘B' );
			} );
		} );

		describe( 'on non–Macintosh', () => {
			beforeEach( () => {
				env.isMac = false;
			} );

			it( 'does not touch anything', () => {
				expect( getEnvKeystrokeText( 'CTRL+A' ) ).to.equal( 'CTRL+A' );
				expect( getEnvKeystrokeText( 'ctrl+A' ) ).to.equal( 'ctrl+A' );
				expect( getEnvKeystrokeText( 'SHIFT+A' ) ).to.equal( 'SHIFT+A' );
				expect( getEnvKeystrokeText( 'alt+A' ) ).to.equal( 'alt+A' );
				expect( getEnvKeystrokeText( 'CTRL+SHIFT+A' ) ).to.equal( 'CTRL+SHIFT+A' );
				expect( getEnvKeystrokeText( 'A' ) ).to.equal( 'A' );
			} );
		} );
	} );
} );
