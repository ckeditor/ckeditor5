/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { env } from '../src/env.js';
import {
	keyCodes,
	getCode,
	parseKeystroke,
	getEnvKeystrokeText,
	isArrowKeyCode,
	isForwardArrowKeyCode,
	getLocalizedArrowKeyCodeDirection
} from '../src/keyboard.js';
import { expectToThrowCKEditorError } from './_utils/utils.js';

describe( 'Keyboard', () => {
	describe( 'keyCodes', () => {
		it( 'contains numbers', () => {
			expect( keyCodes[ '0' ] ).toEqual( 48 );
			expect( keyCodes[ '9' ] ).toEqual( 57 );
		} );

		it( 'contains letters', () => {
			expect( keyCodes.a ).toEqual( 65 );
			expect( keyCodes.z ).toEqual( 90 );
		} );

		it( 'contains page up and down keys', () => {
			expect( keyCodes.pageup ).toEqual( 33 );
			expect( keyCodes.pagedown ).toEqual( 34 );
		} );

		it( 'modifiers and other keys', () => {
			expect( keyCodes.delete ).toEqual( 46 );
			expect( keyCodes.ctrl ).toEqual( 0x110000 );
			expect( keyCodes.cmd ).toEqual( 0x880000 );
			expect( keyCodes.f1 ).toEqual( 112 );
			expect( keyCodes.f12 ).toEqual( 123 );

			expect( keyCodes ).to.include.keys(
				'ctrl', 'cmd', 'shift', 'alt',
				'arrowleft', 'arrowup', 'arrowright', 'arrowdown',
				'backspace', 'delete', 'enter', 'space', 'esc', 'tab',
				'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12',
				'`', '-', '=', '[', ']', ';', '\'', ',', '.', '/', '\\'
			);
		} );

		it( 'should provide correct codes for interpunction characters, brackets, slashes, etc.', () => {
			const charactersToCodes = {
				'\'': 222,
				',': 108,
				'-': 109,
				'.': 110,
				'/': 111,
				';': 186,
				'=': 187,
				'[': 219,
				'\\': 220,
				']': 221,
				'`': 223
			};

			for ( const character in charactersToCodes ) {
				expect( keyCodes[ character ] ).toEqual( charactersToCodes[ character ] );
			}
		} );
	} );

	describe( 'getCode', () => {
		it( 'gets code of a number', () => {
			expect( getCode( '0' ) ).toEqual( 48 );
		} );

		it( 'gets code of a letter', () => {
			expect( getCode( 'a' ) ).toEqual( 65 );
		} );

		it( 'gets code of a function key', () => {
			expect( getCode( 'f6' ) ).toEqual( 117 );
		} );

		it( 'gets code of a punctuation character', () => {
			expect( getCode( ']' ) ).toEqual( 221 );
		} );

		it( 'is case insensitive', () => {
			expect( getCode( 'A' ) ).toEqual( 65 );
			expect( getCode( 'Ctrl' ) ).toEqual( 0x110000 );
			expect( getCode( 'ENTER' ) ).toEqual( 13 );
		} );

		it( 'throws when passed unknown key name', () => {
			expectToThrowCKEditorError( () => {
				getCode( 'foo' );
			}, 'keyboard-unknown-key', null );
		} );

		it( 'gets code of a keystroke info', () => {
			expect( getCode( { keyCode: 48 } ) ).toEqual( 48 );
		} );

		it( 'adds modifiers to the keystroke code', () => {
			expect( getCode( { keyCode: 48, altKey: true, ctrlKey: true, shiftKey: true, metaKey: true } ) )
				.toEqual( 48 + 0x110000 + 0x220000 + 0x440000 + 0x880000 );
		} );
	} );

	describe( 'parseKeystroke', () => {
		const initialEnvMac = env.isMac;
		const initialEnviOS = env.isiOS;

		afterEach( () => {
			env.isMac = initialEnvMac;
			env.isiOS = initialEnviOS;
		} );

		describe( 'on Macintosh', () => {
			beforeEach( () => {
				env.isMac = true;
				env.isiOS = false;
			} );

			it( 'parses string', () => {
				expect( parseKeystroke( 'ctrl+a' ) ).toEqual( 0x880000 + 65 );
			} );

			it( 'parses string without modifier', () => {
				expect( parseKeystroke( '[' ) ).toEqual( 219 );
			} );

			it( 'allows spacing', () => {
				expect( parseKeystroke( 'ctrl +   a' ) ).toEqual( 0x880000 + 65 );
			} );

			it( 'is case-insensitive', () => {
				expect( parseKeystroke( 'Ctrl+A' ) ).toEqual( 0x880000 + 65 );
			} );

			it( 'works with an array', () => {
				expect( parseKeystroke( [ 'ctrl', 'a' ] ) ).toEqual( 0x880000 + 65 );
			} );

			it( 'works with an array which contains numbers', () => {
				expect( parseKeystroke( [ 'shift', 33 ] ) ).toEqual( 0x220000 + 33 );
			} );

			it( 'works with two modifiers', () => {
				expect( parseKeystroke( 'ctrl+shift+a' ) ).toEqual( 0x880000 + 0x220000 + 65 );
			} );

			it( 'supports forced modifier', () => {
				expect( parseKeystroke( 'ctrl!+a' ) ).toEqual( 0x110000 + 65 );
			} );

			it( 'throws on unknown name', () => {
				expectToThrowCKEditorError( () => {
					parseKeystroke( 'foo' );
				}, 'keyboard-unknown-key', null );
			} );
		} );

		describe( 'on iOS', () => {
			beforeEach( () => {
				env.isiOS = true;
				env.isMac = false;
			} );

			it( 'parses string', () => {
				expect( parseKeystroke( 'ctrl+a' ) ).toEqual( 0x880000 + 65 );
			} );

			it( 'parses string without modifier', () => {
				expect( parseKeystroke( '[' ) ).toEqual( 219 );
			} );

			it( 'allows spacing', () => {
				expect( parseKeystroke( 'ctrl +   a' ) ).toEqual( 0x880000 + 65 );
			} );

			it( 'is case-insensitive', () => {
				expect( parseKeystroke( 'Ctrl+A' ) ).toEqual( 0x880000 + 65 );
			} );

			it( 'works with an array', () => {
				expect( parseKeystroke( [ 'ctrl', 'a' ] ) ).toEqual( 0x880000 + 65 );
			} );

			it( 'works with an array which contains numbers', () => {
				expect( parseKeystroke( [ 'shift', 33 ] ) ).toEqual( 0x220000 + 33 );
			} );

			it( 'works with two modifiers', () => {
				expect( parseKeystroke( 'ctrl+shift+a' ) ).toEqual( 0x880000 + 0x220000 + 65 );
			} );

			it( 'supports forced modifier', () => {
				expect( parseKeystroke( 'ctrl!+a' ) ).toEqual( 0x110000 + 65 );
			} );

			it( 'throws on unknown name', () => {
				expectToThrowCKEditorError( () => {
					parseKeystroke( 'foo' );
				}, 'keyboard-unknown-key', null );
			} );
		} );

		describe( 'on non–Macintosh', () => {
			beforeEach( () => {
				env.isMac = false;
			} );

			it( 'parses string', () => {
				expect( parseKeystroke( 'ctrl+a' ) ).toEqual( 0x110000 + 65 );
			} );

			it( 'parses string without modifier', () => {
				expect( parseKeystroke( '[' ) ).toEqual( 219 );
			} );

			it( 'allows spacing', () => {
				expect( parseKeystroke( 'ctrl +   a' ) ).toEqual( 0x110000 + 65 );
			} );

			it( 'is case-insensitive', () => {
				expect( parseKeystroke( 'Ctrl+A' ) ).toEqual( 0x110000 + 65 );
			} );

			it( 'works with an array', () => {
				expect( parseKeystroke( [ 'ctrl', 'a' ] ) ).toEqual( 0x110000 + 65 );
			} );

			it( 'works with an array which contains numbers', () => {
				expect( parseKeystroke( [ 'shift', 33 ] ) ).toEqual( 0x220000 + 33 );
			} );

			it( 'works with two modifiers', () => {
				expect( parseKeystroke( 'ctrl+shift+a' ) ).toEqual( 0x110000 + 0x220000 + 65 );
			} );

			it( 'supports forced modifier', () => {
				expect( parseKeystroke( 'ctrl!+a' ) ).toEqual( 0x110000 + 65 );
			} );

			it( 'throws on unknown name', () => {
				expectToThrowCKEditorError( () => {
					parseKeystroke( 'foo' );
				}, 'keyboard-unknown-key', null );
			} );
		} );
	} );

	describe( 'getEnvKeystrokeText', () => {
		const initialEnvMac = env.isMac;
		const initialEnviOS = env.isiOS;

		afterEach( () => {
			env.isMac = initialEnvMac;
			env.isiOS = initialEnviOS;
		} );

		describe( 'on Macintosh', () => {
			beforeEach( () => {
				env.isMac = true;
				env.isiOS = false;
			} );

			it( 'replaces CTRL with ⌘', () => {
				expect( getEnvKeystrokeText( 'CTRL' ) ).toEqual( '⌘' );
				expect( getEnvKeystrokeText( 'CTRL+A' ) ).toEqual( '⌘A' );
				expect( getEnvKeystrokeText( 'ctrl+A' ) ).toEqual( '⌘A' );
			} );

			it( 'replaces CTRL! with ⌃', () => {
				expect( getEnvKeystrokeText( 'CTRL!' ) ).toEqual( '⌃' );
				expect( getEnvKeystrokeText( 'CTRL!+A' ) ).toEqual( '⌃A' );
				expect( getEnvKeystrokeText( 'ctrl!+A' ) ).toEqual( '⌃A' );
			} );

			it( 'replaces SHIFT with ⇧', () => {
				expect( getEnvKeystrokeText( 'SHIFT' ) ).toEqual( '⇧' );
				expect( getEnvKeystrokeText( 'SHIFT+A' ) ).toEqual( '⇧A' );
				expect( getEnvKeystrokeText( 'shift+A' ) ).toEqual( '⇧A' );
			} );

			it( 'replaces ALT with ⌥', () => {
				expect( getEnvKeystrokeText( 'ALT' ) ).toEqual( '⌥' );
				expect( getEnvKeystrokeText( 'ALT+A' ) ).toEqual( '⌥A' );
				expect( getEnvKeystrokeText( 'alt+A' ) ).toEqual( '⌥A' );
			} );

			it( 'work for multiple modifiers', () => {
				expect( getEnvKeystrokeText( 'CTRL+SHIFT+X' ) ).toEqual( '⌘⇧X' );
				expect( getEnvKeystrokeText( 'ALT+SHIFT+X' ) ).toEqual( '⌥⇧X' );
			} );

			it( 'normalizes value', () => {
				expect( getEnvKeystrokeText( 'ESC' ) ).toEqual( 'Esc' );
				expect( getEnvKeystrokeText( 'TAB' ) ).toEqual( '⇥' );
				expect( getEnvKeystrokeText( 'A' ) ).toEqual( 'A' );
				expect( getEnvKeystrokeText( 'a' ) ).toEqual( 'A' );
				expect( getEnvKeystrokeText( 'CTRL+a' ) ).toEqual( '⌘A' );
				expect( getEnvKeystrokeText( 'ctrl+b' ) ).toEqual( '⌘B' );
				expect( getEnvKeystrokeText( 'CTRL+[' ) ).toEqual( '⌘[' );
				expect( getEnvKeystrokeText( 'CTRL+]' ) ).toEqual( '⌘]' );
			} );

			it( 'uses pretty glyphs for arrows', () => {
				expect( getEnvKeystrokeText( 'Arrowleft' ) ).toEqual( '←' );
				expect( getEnvKeystrokeText( 'Arrowup' ) ).toEqual( '↑' );
				expect( getEnvKeystrokeText( 'Arrowright' ) ).toEqual( '→' );
				expect( getEnvKeystrokeText( 'Arrowdown' ) ).toEqual( '↓' );
			} );

			it( 'uses human readable labels for Page up and Page down', () => {
				expect( getEnvKeystrokeText( 'pageup' ) ).toEqual( 'Page Up' );
				expect( getEnvKeystrokeText( 'pagedown' ) ).toEqual( 'Page Down' );
			} );

			describe( 'with forcedEnv === Mac', () => {
				it( 'replaces CTRL! with ⌃', () => {
					expect( getEnvKeystrokeText( 'CTRL!', 'Mac' ) ).toEqual( '⌃' );
					expect( getEnvKeystrokeText( 'CTRL!+A', 'Mac' ) ).toEqual( '⌃A' );
					expect( getEnvKeystrokeText( 'ctrl!+A', 'Mac' ) ).toEqual( '⌃A' );
				} );

				it( 'replaces SHIFT with ⇧', () => {
					expect( getEnvKeystrokeText( 'SHIFT', 'Mac' ) ).toEqual( '⇧' );
					expect( getEnvKeystrokeText( 'SHIFT+A', 'Mac' ) ).toEqual( '⇧A' );
					expect( getEnvKeystrokeText( 'shift+A', 'Mac' ) ).toEqual( '⇧A' );
				} );

				it( 'replaces ALT with ⌥', () => {
					expect( getEnvKeystrokeText( 'ALT', 'Mac' ) ).toEqual( '⌥' );
					expect( getEnvKeystrokeText( 'ALT+A', 'Mac' ) ).toEqual( '⌥A' );
					expect( getEnvKeystrokeText( 'alt+A', 'Mac' ) ).toEqual( '⌥A' );
				} );
			} );

			describe( 'with forcedEnv === PC', () => {
				it( 'does not replace CTRL! with ⌃', () => {
					expect( getEnvKeystrokeText( 'CTRL!', 'PC' ) ).toEqual( 'Ctrl+' );
					expect( getEnvKeystrokeText( 'CTRL!+A', 'PC' ) ).toEqual( 'Ctrl+A' );
					expect( getEnvKeystrokeText( 'ctrl!+A', 'PC' ) ).toEqual( 'Ctrl+A' );
				} );

				it( 'does not replace SHIFT with ⇧', () => {
					expect( getEnvKeystrokeText( 'SHIFT', 'PC' ) ).toEqual( 'Shift+' );
					expect( getEnvKeystrokeText( 'SHIFT+A', 'PC' ) ).toEqual( 'Shift+A' );
					expect( getEnvKeystrokeText( 'shift+A', 'PC' ) ).toEqual( 'Shift+A' );
				} );

				it( 'does not replace ALT with ⌥', () => {
					expect( getEnvKeystrokeText( 'ALT', 'PC' ) ).toEqual( 'Alt+' );
					expect( getEnvKeystrokeText( 'ALT+A', 'PC' ) ).toEqual( 'Alt+A' );
					expect( getEnvKeystrokeText( 'alt+A', 'PC' ) ).toEqual( 'Alt+A' );
				} );
			} );
		} );

		describe( 'on iOS', () => {
			beforeEach( () => {
				env.isiOS = true;
				env.isMac = false;
			} );

			it( 'replaces CTRL with ⌘', () => {
				expect( getEnvKeystrokeText( 'CTRL' ) ).toEqual( '⌘' );
				expect( getEnvKeystrokeText( 'CTRL+A' ) ).toEqual( '⌘A' );
				expect( getEnvKeystrokeText( 'ctrl+A' ) ).toEqual( '⌘A' );
			} );

			it( 'replaces CTRL! with ⌃', () => {
				expect( getEnvKeystrokeText( 'CTRL!' ) ).toEqual( '⌃' );
				expect( getEnvKeystrokeText( 'CTRL!+A' ) ).toEqual( '⌃A' );
				expect( getEnvKeystrokeText( 'ctrl!+A' ) ).toEqual( '⌃A' );
			} );

			it( 'replaces SHIFT with ⇧', () => {
				expect( getEnvKeystrokeText( 'SHIFT' ) ).toEqual( '⇧' );
				expect( getEnvKeystrokeText( 'SHIFT+A' ) ).toEqual( '⇧A' );
				expect( getEnvKeystrokeText( 'shift+A' ) ).toEqual( '⇧A' );
			} );

			it( 'replaces ALT with ⌥', () => {
				expect( getEnvKeystrokeText( 'ALT' ) ).toEqual( '⌥' );
				expect( getEnvKeystrokeText( 'ALT+A' ) ).toEqual( '⌥A' );
				expect( getEnvKeystrokeText( 'alt+A' ) ).toEqual( '⌥A' );
			} );

			it( 'work for multiple modifiers', () => {
				expect( getEnvKeystrokeText( 'CTRL+SHIFT+X' ) ).toEqual( '⌘⇧X' );
				expect( getEnvKeystrokeText( 'ALT+SHIFT+X' ) ).toEqual( '⌥⇧X' );
			} );

			it( 'normalizes value', () => {
				expect( getEnvKeystrokeText( 'ESC' ) ).toEqual( 'Esc' );
				expect( getEnvKeystrokeText( 'TAB' ) ).toEqual( '⇥' );
				expect( getEnvKeystrokeText( 'A' ) ).toEqual( 'A' );
				expect( getEnvKeystrokeText( 'a' ) ).toEqual( 'A' );
				expect( getEnvKeystrokeText( 'CTRL+a' ) ).toEqual( '⌘A' );
				expect( getEnvKeystrokeText( 'ctrl+b' ) ).toEqual( '⌘B' );
				expect( getEnvKeystrokeText( 'CTRL+[' ) ).toEqual( '⌘[' );
				expect( getEnvKeystrokeText( 'CTRL+]' ) ).toEqual( '⌘]' );
			} );

			it( 'uses pretty glyphs for arrows', () => {
				expect( getEnvKeystrokeText( 'Arrowleft' ) ).toEqual( '←' );
				expect( getEnvKeystrokeText( 'Arrowup' ) ).toEqual( '↑' );
				expect( getEnvKeystrokeText( 'Arrowright' ) ).toEqual( '→' );
				expect( getEnvKeystrokeText( 'Arrowdown' ) ).toEqual( '↓' );
			} );

			describe( 'with forcedEnv === Mac', () => {
				it( 'replaces CTRL! with ⌃', () => {
					expect( getEnvKeystrokeText( 'CTRL!', 'Mac' ) ).toEqual( '⌃' );
					expect( getEnvKeystrokeText( 'CTRL!+A', 'Mac' ) ).toEqual( '⌃A' );
					expect( getEnvKeystrokeText( 'ctrl!+A', 'Mac' ) ).toEqual( '⌃A' );
				} );

				it( 'replaces SHIFT with ⇧', () => {
					expect( getEnvKeystrokeText( 'SHIFT', 'Mac' ) ).toEqual( '⇧' );
					expect( getEnvKeystrokeText( 'SHIFT+A', 'Mac' ) ).toEqual( '⇧A' );
					expect( getEnvKeystrokeText( 'shift+A', 'Mac' ) ).toEqual( '⇧A' );
				} );

				it( 'replaces ALT with ⌥', () => {
					expect( getEnvKeystrokeText( 'ALT', 'Mac' ) ).toEqual( '⌥' );
					expect( getEnvKeystrokeText( 'ALT+A', 'Mac' ) ).toEqual( '⌥A' );
					expect( getEnvKeystrokeText( 'alt+A', 'Mac' ) ).toEqual( '⌥A' );
				} );
			} );

			describe( 'with forcedEnv === PC', () => {
				it( 'does not replace CTRL! with ⌃', () => {
					expect( getEnvKeystrokeText( 'CTRL!', 'PC' ) ).toEqual( 'Ctrl+' );
					expect( getEnvKeystrokeText( 'CTRL!+A', 'PC' ) ).toEqual( 'Ctrl+A' );
					expect( getEnvKeystrokeText( 'ctrl!+A', 'PC' ) ).toEqual( 'Ctrl+A' );
				} );

				it( 'does not replace SHIFT with ⇧', () => {
					expect( getEnvKeystrokeText( 'SHIFT', 'PC' ) ).toEqual( 'Shift+' );
					expect( getEnvKeystrokeText( 'SHIFT+A', 'PC' ) ).toEqual( 'Shift+A' );
					expect( getEnvKeystrokeText( 'shift+A', 'PC' ) ).toEqual( 'Shift+A' );
				} );

				it( 'does not replace ALT with ⌥', () => {
					expect( getEnvKeystrokeText( 'ALT', 'PC' ) ).toEqual( 'Alt+' );
					expect( getEnvKeystrokeText( 'ALT+A', 'PC' ) ).toEqual( 'Alt+A' );
					expect( getEnvKeystrokeText( 'alt+A', 'PC' ) ).toEqual( 'Alt+A' );
				} );
			} );
		} );

		describe( 'on non–Macintosh', () => {
			beforeEach( () => {
				env.isMac = false;
			} );

			it( 'normalizes value', () => {
				expect( getEnvKeystrokeText( 'ESC' ) ).toEqual( 'Esc' );
				expect( getEnvKeystrokeText( 'TAB' ) ).toEqual( '⇥' );
				expect( getEnvKeystrokeText( 'A' ) ).toEqual( 'A' );
				expect( getEnvKeystrokeText( 'a' ) ).toEqual( 'A' );
				expect( getEnvKeystrokeText( 'CTRL+a' ) ).toEqual( 'Ctrl+A' );
				expect( getEnvKeystrokeText( 'CTRL!+a' ) ).toEqual( 'Ctrl+A' );
				expect( getEnvKeystrokeText( 'ctrl+b' ) ).toEqual( 'Ctrl+B' );
				expect( getEnvKeystrokeText( 'ctrl!+b' ) ).toEqual( 'Ctrl+B' );
				expect( getEnvKeystrokeText( 'SHIFT+A' ) ).toEqual( 'Shift+A' );
				expect( getEnvKeystrokeText( 'alt+A' ) ).toEqual( 'Alt+A' );
				expect( getEnvKeystrokeText( 'CTRL+SHIFT+A' ) ).toEqual( 'Ctrl+Shift+A' );
				expect( getEnvKeystrokeText( 'CTRL+[' ) ).toEqual( 'Ctrl+[' );
				expect( getEnvKeystrokeText( 'CTRL+]' ) ).toEqual( 'Ctrl+]' );
			} );

			it( 'uses pretty glyphs for arrows', () => {
				expect( getEnvKeystrokeText( 'Arrowleft' ) ).toEqual( '←' );
				expect( getEnvKeystrokeText( 'Arrowup' ) ).toEqual( '↑' );
				expect( getEnvKeystrokeText( 'Arrowright' ) ).toEqual( '→' );
				expect( getEnvKeystrokeText( 'Arrowdown' ) ).toEqual( '↓' );
			} );

			describe( 'with forcedEnv === Mac', () => {
				it( 'replaces CTRL! with ⌃', () => {
					expect( getEnvKeystrokeText( 'CTRL!', 'Mac' ) ).toEqual( '⌃' );
					expect( getEnvKeystrokeText( 'CTRL!+A', 'Mac' ) ).toEqual( '⌃A' );
					expect( getEnvKeystrokeText( 'ctrl!+A', 'Mac' ) ).toEqual( '⌃A' );
				} );

				it( 'replaces SHIFT with ⇧', () => {
					expect( getEnvKeystrokeText( 'SHIFT', 'Mac' ) ).toEqual( '⇧' );
					expect( getEnvKeystrokeText( 'SHIFT+A', 'Mac' ) ).toEqual( '⇧A' );
					expect( getEnvKeystrokeText( 'shift+A', 'Mac' ) ).toEqual( '⇧A' );
				} );

				it( 'replaces ALT with ⌥', () => {
					expect( getEnvKeystrokeText( 'ALT', 'Mac' ) ).toEqual( '⌥' );
					expect( getEnvKeystrokeText( 'ALT+A', 'Mac' ) ).toEqual( '⌥A' );
					expect( getEnvKeystrokeText( 'alt+A', 'Mac' ) ).toEqual( '⌥A' );
				} );
			} );

			describe( 'with forcedEnv === PC', () => {
				it( 'does not replace CTRL! with ⌃', () => {
					expect( getEnvKeystrokeText( 'CTRL!', 'PC' ) ).toEqual( 'Ctrl+' );
					expect( getEnvKeystrokeText( 'CTRL!+A', 'PC' ) ).toEqual( 'Ctrl+A' );
					expect( getEnvKeystrokeText( 'ctrl!+A', 'PC' ) ).toEqual( 'Ctrl+A' );
				} );

				it( 'does not replace SHIFT with ⇧', () => {
					expect( getEnvKeystrokeText( 'SHIFT', 'PC' ) ).toEqual( 'Shift+' );
					expect( getEnvKeystrokeText( 'SHIFT+A', 'PC' ) ).toEqual( 'Shift+A' );
					expect( getEnvKeystrokeText( 'shift+A', 'PC' ) ).toEqual( 'Shift+A' );
				} );

				it( 'does not replace ALT with ⌥', () => {
					expect( getEnvKeystrokeText( 'ALT', 'PC' ) ).toEqual( 'Alt+' );
					expect( getEnvKeystrokeText( 'ALT+A', 'PC' ) ).toEqual( 'Alt+A' );
					expect( getEnvKeystrokeText( 'alt+A', 'PC' ) ).toEqual( 'Alt+A' );
				} );
			} );
		} );
	} );

	describe( 'isArrowKeyCode()', () => {
		it( 'should return "true" for right arrow', () => {
			expect( isArrowKeyCode( keyCodes.arrowright ) ).toBe( true );
		} );

		it( 'should return "true" for left arrow', () => {
			expect( isArrowKeyCode( keyCodes.arrowleft ) ).toBe( true );
		} );

		it( 'should return "true" for up arrow', () => {
			expect( isArrowKeyCode( keyCodes.arrowup ) ).toBe( true );
		} );

		it( 'should return "true" for down arrow', () => {
			expect( isArrowKeyCode( keyCodes.arrowdown ) ).toBe( true );
		} );

		it( 'should return "false" for non-arrow keystrokes', () => {
			expect( isArrowKeyCode( keyCodes.a ) ).toBe( false );
			expect( isArrowKeyCode( keyCodes.ctrl ) ).toBe( false );
		} );
	} );

	describe( 'getLocalizedArrowKeyCodeDirection()', () => {
		describe( 'for a left–to–right content language direction', () => {
			it( 'should return "left" for left arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowleft, 'ltr' ) ).toEqual( 'left' );
			} );

			it( 'should return "right" for right arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowright, 'ltr' ) ).toEqual( 'right' );
			} );

			it( 'should return "up" for up arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowup, 'ltr' ) ).toEqual( 'up' );
			} );

			it( 'should return "down" for down arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowdown, 'ltr' ) ).toEqual( 'down' );
			} );
		} );

		describe( 'for a right-to-left content language direction', () => {
			it( 'should return "right" for left arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowleft, 'rtl' ) ).toEqual( 'right' );
			} );

			it( 'should return "left" for right arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowright, 'rtl' ) ).toEqual( 'left' );
			} );

			it( 'should return "up" for up arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowup, 'rtl' ) ).toEqual( 'up' );
			} );

			it( 'should return "down" for down arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowdown, 'rtl' ) ).toEqual( 'down' );
			} );
		} );
	} );

	describe( 'isForwardArrowKeyCode()', () => {
		describe( 'for a left–to–right content language direction', () => {
			it( 'should return "true" for down arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowdown, 'ltr' ) ).toBe( true );
			} );

			it( 'should return "true" for right arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowright, 'ltr' ) ).toBe( true );
			} );

			it( 'should return "false" for up arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowup, 'ltr' ) ).toBe( false );
			} );

			it( 'should return "false" for left arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowleft, 'ltr' ) ).toBe( false );
			} );
		} );

		describe( 'for a right-to-left content language direction', () => {
			it( 'should return "true" for down arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowdown, 'rtl' ) ).toBe( true );
			} );

			it( 'should return "true" for left arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowleft, 'rtl' ) ).toBe( true );
			} );

			it( 'should return "false" for up arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowup, 'rtl' ) ).toBe( false );
			} );

			it( 'should return "false" for right arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowright, 'rtl' ) ).toBe( false );
			} );
		} );
	} );
} );
