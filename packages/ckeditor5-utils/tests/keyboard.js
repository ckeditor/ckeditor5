/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import env from '../src/env.js';
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
			expect( keyCodes[ '0' ] ).to.equal( 48 );
			expect( keyCodes[ '9' ] ).to.equal( 57 );
		} );

		it( 'contains letters', () => {
			expect( keyCodes.a ).to.equal( 65 );
			expect( keyCodes.z ).to.equal( 90 );
		} );

		it( 'contains page up and down keys', () => {
			expect( keyCodes.pageup ).to.equal( 33 );
			expect( keyCodes.pagedown ).to.equal( 34 );
		} );

		it( 'modifiers and other keys', () => {
			expect( keyCodes.delete ).to.equal( 46 );
			expect( keyCodes.ctrl ).to.equal( 0x110000 );
			expect( keyCodes.cmd ).to.equal( 0x880000 );
			expect( keyCodes.f1 ).to.equal( 112 );
			expect( keyCodes.f12 ).to.equal( 123 );

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
				expect( keyCodes[ character ] ).to.equal( charactersToCodes[ character ] );
			}
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

		it( 'gets code of a punctuation character', () => {
			expect( getCode( ']' ) ).to.equal( 221 );
		} );

		it( 'is case insensitive', () => {
			expect( getCode( 'A' ) ).to.equal( 65 );
			expect( getCode( 'Ctrl' ) ).to.equal( 0x110000 );
			expect( getCode( 'ENTER' ) ).to.equal( 13 );
		} );

		it( 'throws when passed unknown key name', () => {
			expectToThrowCKEditorError( () => {
				getCode( 'foo' );
			}, 'keyboard-unknown-key', null );
		} );

		it( 'gets code of a keystroke info', () => {
			expect( getCode( { keyCode: 48 } ) ).to.equal( 48 );
		} );

		it( 'adds modifiers to the keystroke code', () => {
			expect( getCode( { keyCode: 48, altKey: true, ctrlKey: true, shiftKey: true, metaKey: true } ) )
				.to.equal( 48 + 0x110000 + 0x220000 + 0x440000 + 0x880000 );
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
				expect( parseKeystroke( 'ctrl+a' ) ).to.equal( 0x880000 + 65 );
			} );

			it( 'parses string without modifier', () => {
				expect( parseKeystroke( '[' ) ).to.equal( 219 );
			} );

			it( 'allows spacing', () => {
				expect( parseKeystroke( 'ctrl +   a' ) ).to.equal( 0x880000 + 65 );
			} );

			it( 'is case-insensitive', () => {
				expect( parseKeystroke( 'Ctrl+A' ) ).to.equal( 0x880000 + 65 );
			} );

			it( 'works with an array', () => {
				expect( parseKeystroke( [ 'ctrl', 'a' ] ) ).to.equal( 0x880000 + 65 );
			} );

			it( 'works with an array which contains numbers', () => {
				expect( parseKeystroke( [ 'shift', 33 ] ) ).to.equal( 0x220000 + 33 );
			} );

			it( 'works with two modifiers', () => {
				expect( parseKeystroke( 'ctrl+shift+a' ) ).to.equal( 0x880000 + 0x220000 + 65 );
			} );

			it( 'supports forced modifier', () => {
				expect( parseKeystroke( 'ctrl!+a' ) ).to.equal( 0x110000 + 65 );
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
				expect( parseKeystroke( 'ctrl+a' ) ).to.equal( 0x880000 + 65 );
			} );

			it( 'parses string without modifier', () => {
				expect( parseKeystroke( '[' ) ).to.equal( 219 );
			} );

			it( 'allows spacing', () => {
				expect( parseKeystroke( 'ctrl +   a' ) ).to.equal( 0x880000 + 65 );
			} );

			it( 'is case-insensitive', () => {
				expect( parseKeystroke( 'Ctrl+A' ) ).to.equal( 0x880000 + 65 );
			} );

			it( 'works with an array', () => {
				expect( parseKeystroke( [ 'ctrl', 'a' ] ) ).to.equal( 0x880000 + 65 );
			} );

			it( 'works with an array which contains numbers', () => {
				expect( parseKeystroke( [ 'shift', 33 ] ) ).to.equal( 0x220000 + 33 );
			} );

			it( 'works with two modifiers', () => {
				expect( parseKeystroke( 'ctrl+shift+a' ) ).to.equal( 0x880000 + 0x220000 + 65 );
			} );

			it( 'supports forced modifier', () => {
				expect( parseKeystroke( 'ctrl!+a' ) ).to.equal( 0x110000 + 65 );
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
				expect( parseKeystroke( 'ctrl+a' ) ).to.equal( 0x110000 + 65 );
			} );

			it( 'parses string without modifier', () => {
				expect( parseKeystroke( '[' ) ).to.equal( 219 );
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

			it( 'supports forced modifier', () => {
				expect( parseKeystroke( 'ctrl!+a' ) ).to.equal( 0x110000 + 65 );
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
				expect( getEnvKeystrokeText( 'CTRL' ) ).to.equal( '⌘' );
				expect( getEnvKeystrokeText( 'CTRL+A' ) ).to.equal( '⌘A' );
				expect( getEnvKeystrokeText( 'ctrl+A' ) ).to.equal( '⌘A' );
			} );

			it( 'replaces CTRL! with ⌃', () => {
				expect( getEnvKeystrokeText( 'CTRL!' ) ).to.equal( '⌃' );
				expect( getEnvKeystrokeText( 'CTRL!+A' ) ).to.equal( '⌃A' );
				expect( getEnvKeystrokeText( 'ctrl!+A' ) ).to.equal( '⌃A' );
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

			it( 'normalizes value', () => {
				expect( getEnvKeystrokeText( 'ESC' ) ).to.equal( 'Esc' );
				expect( getEnvKeystrokeText( 'TAB' ) ).to.equal( '⇥' );
				expect( getEnvKeystrokeText( 'A' ) ).to.equal( 'A' );
				expect( getEnvKeystrokeText( 'a' ) ).to.equal( 'A' );
				expect( getEnvKeystrokeText( 'CTRL+a' ) ).to.equal( '⌘A' );
				expect( getEnvKeystrokeText( 'ctrl+b' ) ).to.equal( '⌘B' );
				expect( getEnvKeystrokeText( 'CTRL+[' ) ).to.equal( '⌘[' );
				expect( getEnvKeystrokeText( 'CTRL+]' ) ).to.equal( '⌘]' );
			} );

			it( 'uses pretty glyphs for arrows', () => {
				expect( getEnvKeystrokeText( 'Arrowleft' ) ).to.equal( '←' );
				expect( getEnvKeystrokeText( 'Arrowup' ) ).to.equal( '↑' );
				expect( getEnvKeystrokeText( 'Arrowright' ) ).to.equal( '→' );
				expect( getEnvKeystrokeText( 'Arrowdown' ) ).to.equal( '↓' );
			} );

			it( 'uses human readable labels for Page up and Page down', () => {
				expect( getEnvKeystrokeText( 'pageup' ) ).to.equal( 'Page Up' );
				expect( getEnvKeystrokeText( 'pagedown' ) ).to.equal( 'Page Down' );
			} );

			describe( 'with forcedEnv === Mac', () => {
				it( 'replaces CTRL! with ⌃', () => {
					expect( getEnvKeystrokeText( 'CTRL!', 'Mac' ) ).to.equal( '⌃' );
					expect( getEnvKeystrokeText( 'CTRL!+A', 'Mac' ) ).to.equal( '⌃A' );
					expect( getEnvKeystrokeText( 'ctrl!+A', 'Mac' ) ).to.equal( '⌃A' );
				} );

				it( 'replaces SHIFT with ⇧', () => {
					expect( getEnvKeystrokeText( 'SHIFT', 'Mac' ) ).to.equal( '⇧' );
					expect( getEnvKeystrokeText( 'SHIFT+A', 'Mac' ) ).to.equal( '⇧A' );
					expect( getEnvKeystrokeText( 'shift+A', 'Mac' ) ).to.equal( '⇧A' );
				} );

				it( 'replaces ALT with ⌥', () => {
					expect( getEnvKeystrokeText( 'ALT', 'Mac' ) ).to.equal( '⌥' );
					expect( getEnvKeystrokeText( 'ALT+A', 'Mac' ) ).to.equal( '⌥A' );
					expect( getEnvKeystrokeText( 'alt+A', 'Mac' ) ).to.equal( '⌥A' );
				} );
			} );

			describe( 'with forcedEnv === PC', () => {
				it( 'does not replace CTRL! with ⌃', () => {
					expect( getEnvKeystrokeText( 'CTRL!', 'PC' ) ).to.equal( 'Ctrl+' );
					expect( getEnvKeystrokeText( 'CTRL!+A', 'PC' ) ).to.equal( 'Ctrl+A' );
					expect( getEnvKeystrokeText( 'ctrl!+A', 'PC' ) ).to.equal( 'Ctrl+A' );
				} );

				it( 'does not replace SHIFT with ⇧', () => {
					expect( getEnvKeystrokeText( 'SHIFT', 'PC' ) ).to.equal( 'Shift+' );
					expect( getEnvKeystrokeText( 'SHIFT+A', 'PC' ) ).to.equal( 'Shift+A' );
					expect( getEnvKeystrokeText( 'shift+A', 'PC' ) ).to.equal( 'Shift+A' );
				} );

				it( 'does not replace ALT with ⌥', () => {
					expect( getEnvKeystrokeText( 'ALT', 'PC' ) ).to.equal( 'Alt+' );
					expect( getEnvKeystrokeText( 'ALT+A', 'PC' ) ).to.equal( 'Alt+A' );
					expect( getEnvKeystrokeText( 'alt+A', 'PC' ) ).to.equal( 'Alt+A' );
				} );
			} );
		} );

		describe( 'on iOS', () => {
			beforeEach( () => {
				env.isiOS = true;
				env.isMac = false;
			} );

			it( 'replaces CTRL with ⌘', () => {
				expect( getEnvKeystrokeText( 'CTRL' ) ).to.equal( '⌘' );
				expect( getEnvKeystrokeText( 'CTRL+A' ) ).to.equal( '⌘A' );
				expect( getEnvKeystrokeText( 'ctrl+A' ) ).to.equal( '⌘A' );
			} );

			it( 'replaces CTRL! with ⌃', () => {
				expect( getEnvKeystrokeText( 'CTRL!' ) ).to.equal( '⌃' );
				expect( getEnvKeystrokeText( 'CTRL!+A' ) ).to.equal( '⌃A' );
				expect( getEnvKeystrokeText( 'ctrl!+A' ) ).to.equal( '⌃A' );
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

			it( 'normalizes value', () => {
				expect( getEnvKeystrokeText( 'ESC' ) ).to.equal( 'Esc' );
				expect( getEnvKeystrokeText( 'TAB' ) ).to.equal( '⇥' );
				expect( getEnvKeystrokeText( 'A' ) ).to.equal( 'A' );
				expect( getEnvKeystrokeText( 'a' ) ).to.equal( 'A' );
				expect( getEnvKeystrokeText( 'CTRL+a' ) ).to.equal( '⌘A' );
				expect( getEnvKeystrokeText( 'ctrl+b' ) ).to.equal( '⌘B' );
				expect( getEnvKeystrokeText( 'CTRL+[' ) ).to.equal( '⌘[' );
				expect( getEnvKeystrokeText( 'CTRL+]' ) ).to.equal( '⌘]' );
			} );

			it( 'uses pretty glyphs for arrows', () => {
				expect( getEnvKeystrokeText( 'Arrowleft' ) ).to.equal( '←' );
				expect( getEnvKeystrokeText( 'Arrowup' ) ).to.equal( '↑' );
				expect( getEnvKeystrokeText( 'Arrowright' ) ).to.equal( '→' );
				expect( getEnvKeystrokeText( 'Arrowdown' ) ).to.equal( '↓' );
			} );

			describe( 'with forcedEnv === Mac', () => {
				it( 'replaces CTRL! with ⌃', () => {
					expect( getEnvKeystrokeText( 'CTRL!', 'Mac' ) ).to.equal( '⌃' );
					expect( getEnvKeystrokeText( 'CTRL!+A', 'Mac' ) ).to.equal( '⌃A' );
					expect( getEnvKeystrokeText( 'ctrl!+A', 'Mac' ) ).to.equal( '⌃A' );
				} );

				it( 'replaces SHIFT with ⇧', () => {
					expect( getEnvKeystrokeText( 'SHIFT', 'Mac' ) ).to.equal( '⇧' );
					expect( getEnvKeystrokeText( 'SHIFT+A', 'Mac' ) ).to.equal( '⇧A' );
					expect( getEnvKeystrokeText( 'shift+A', 'Mac' ) ).to.equal( '⇧A' );
				} );

				it( 'replaces ALT with ⌥', () => {
					expect( getEnvKeystrokeText( 'ALT', 'Mac' ) ).to.equal( '⌥' );
					expect( getEnvKeystrokeText( 'ALT+A', 'Mac' ) ).to.equal( '⌥A' );
					expect( getEnvKeystrokeText( 'alt+A', 'Mac' ) ).to.equal( '⌥A' );
				} );
			} );

			describe( 'with forcedEnv === PC', () => {
				it( 'does not replace CTRL! with ⌃', () => {
					expect( getEnvKeystrokeText( 'CTRL!', 'PC' ) ).to.equal( 'Ctrl+' );
					expect( getEnvKeystrokeText( 'CTRL!+A', 'PC' ) ).to.equal( 'Ctrl+A' );
					expect( getEnvKeystrokeText( 'ctrl!+A', 'PC' ) ).to.equal( 'Ctrl+A' );
				} );

				it( 'does not replace SHIFT with ⇧', () => {
					expect( getEnvKeystrokeText( 'SHIFT', 'PC' ) ).to.equal( 'Shift+' );
					expect( getEnvKeystrokeText( 'SHIFT+A', 'PC' ) ).to.equal( 'Shift+A' );
					expect( getEnvKeystrokeText( 'shift+A', 'PC' ) ).to.equal( 'Shift+A' );
				} );

				it( 'does not replace ALT with ⌥', () => {
					expect( getEnvKeystrokeText( 'ALT', 'PC' ) ).to.equal( 'Alt+' );
					expect( getEnvKeystrokeText( 'ALT+A', 'PC' ) ).to.equal( 'Alt+A' );
					expect( getEnvKeystrokeText( 'alt+A', 'PC' ) ).to.equal( 'Alt+A' );
				} );
			} );
		} );

		describe( 'on non–Macintosh', () => {
			beforeEach( () => {
				env.isMac = false;
			} );

			it( 'normalizes value', () => {
				expect( getEnvKeystrokeText( 'ESC' ) ).to.equal( 'Esc' );
				expect( getEnvKeystrokeText( 'TAB' ) ).to.equal( '⇥' );
				expect( getEnvKeystrokeText( 'A' ) ).to.equal( 'A' );
				expect( getEnvKeystrokeText( 'a' ) ).to.equal( 'A' );
				expect( getEnvKeystrokeText( 'CTRL+a' ) ).to.equal( 'Ctrl+A' );
				expect( getEnvKeystrokeText( 'CTRL!+a' ) ).to.equal( 'Ctrl+A' );
				expect( getEnvKeystrokeText( 'ctrl+b' ) ).to.equal( 'Ctrl+B' );
				expect( getEnvKeystrokeText( 'ctrl!+b' ) ).to.equal( 'Ctrl+B' );
				expect( getEnvKeystrokeText( 'SHIFT+A' ) ).to.equal( 'Shift+A' );
				expect( getEnvKeystrokeText( 'alt+A' ) ).to.equal( 'Alt+A' );
				expect( getEnvKeystrokeText( 'CTRL+SHIFT+A' ) ).to.equal( 'Ctrl+Shift+A' );
				expect( getEnvKeystrokeText( 'CTRL+[' ) ).to.equal( 'Ctrl+[' );
				expect( getEnvKeystrokeText( 'CTRL+]' ) ).to.equal( 'Ctrl+]' );
			} );

			it( 'uses pretty glyphs for arrows', () => {
				expect( getEnvKeystrokeText( 'Arrowleft' ) ).to.equal( '←' );
				expect( getEnvKeystrokeText( 'Arrowup' ) ).to.equal( '↑' );
				expect( getEnvKeystrokeText( 'Arrowright' ) ).to.equal( '→' );
				expect( getEnvKeystrokeText( 'Arrowdown' ) ).to.equal( '↓' );
			} );

			describe( 'with forcedEnv === Mac', () => {
				it( 'replaces CTRL! with ⌃', () => {
					expect( getEnvKeystrokeText( 'CTRL!', 'Mac' ) ).to.equal( '⌃' );
					expect( getEnvKeystrokeText( 'CTRL!+A', 'Mac' ) ).to.equal( '⌃A' );
					expect( getEnvKeystrokeText( 'ctrl!+A', 'Mac' ) ).to.equal( '⌃A' );
				} );

				it( 'replaces SHIFT with ⇧', () => {
					expect( getEnvKeystrokeText( 'SHIFT', 'Mac' ) ).to.equal( '⇧' );
					expect( getEnvKeystrokeText( 'SHIFT+A', 'Mac' ) ).to.equal( '⇧A' );
					expect( getEnvKeystrokeText( 'shift+A', 'Mac' ) ).to.equal( '⇧A' );
				} );

				it( 'replaces ALT with ⌥', () => {
					expect( getEnvKeystrokeText( 'ALT', 'Mac' ) ).to.equal( '⌥' );
					expect( getEnvKeystrokeText( 'ALT+A', 'Mac' ) ).to.equal( '⌥A' );
					expect( getEnvKeystrokeText( 'alt+A', 'Mac' ) ).to.equal( '⌥A' );
				} );
			} );

			describe( 'with forcedEnv === PC', () => {
				it( 'does not replace CTRL! with ⌃', () => {
					expect( getEnvKeystrokeText( 'CTRL!', 'PC' ) ).to.equal( 'Ctrl+' );
					expect( getEnvKeystrokeText( 'CTRL!+A', 'PC' ) ).to.equal( 'Ctrl+A' );
					expect( getEnvKeystrokeText( 'ctrl!+A', 'PC' ) ).to.equal( 'Ctrl+A' );
				} );

				it( 'does not replace SHIFT with ⇧', () => {
					expect( getEnvKeystrokeText( 'SHIFT', 'PC' ) ).to.equal( 'Shift+' );
					expect( getEnvKeystrokeText( 'SHIFT+A', 'PC' ) ).to.equal( 'Shift+A' );
					expect( getEnvKeystrokeText( 'shift+A', 'PC' ) ).to.equal( 'Shift+A' );
				} );

				it( 'does not replace ALT with ⌥', () => {
					expect( getEnvKeystrokeText( 'ALT', 'PC' ) ).to.equal( 'Alt+' );
					expect( getEnvKeystrokeText( 'ALT+A', 'PC' ) ).to.equal( 'Alt+A' );
					expect( getEnvKeystrokeText( 'alt+A', 'PC' ) ).to.equal( 'Alt+A' );
				} );
			} );
		} );
	} );

	describe( 'isArrowKeyCode()', () => {
		it( 'should return "true" for right arrow', () => {
			expect( isArrowKeyCode( keyCodes.arrowright ) ).to.be.true;
		} );

		it( 'should return "true" for left arrow', () => {
			expect( isArrowKeyCode( keyCodes.arrowleft ) ).to.be.true;
		} );

		it( 'should return "true" for up arrow', () => {
			expect( isArrowKeyCode( keyCodes.arrowup ) ).to.be.true;
		} );

		it( 'should return "true" for down arrow', () => {
			expect( isArrowKeyCode( keyCodes.arrowdown ) ).to.be.true;
		} );

		it( 'should return "false" for non-arrow keystrokes', () => {
			expect( isArrowKeyCode( keyCodes.a ) ).to.be.false;
			expect( isArrowKeyCode( keyCodes.ctrl ) ).to.be.false;
		} );
	} );

	describe( 'getLocalizedArrowKeyCodeDirection()', () => {
		describe( 'for a left–to–right content language direction', () => {
			it( 'should return "left" for left arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowleft, 'ltr' ) ).to.equal( 'left' );
			} );

			it( 'should return "right" for right arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowright, 'ltr' ) ).to.equal( 'right' );
			} );

			it( 'should return "up" for up arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowup, 'ltr' ) ).to.equal( 'up' );
			} );

			it( 'should return "down" for down arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowdown, 'ltr' ) ).to.equal( 'down' );
			} );
		} );

		describe( 'for a right-to-left content language direction', () => {
			it( 'should return "right" for left arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowleft, 'rtl' ) ).to.equal( 'right' );
			} );

			it( 'should return "left" for right arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowright, 'rtl' ) ).to.equal( 'left' );
			} );

			it( 'should return "up" for up arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowup, 'rtl' ) ).to.equal( 'up' );
			} );

			it( 'should return "down" for down arrow', () => {
				expect( getLocalizedArrowKeyCodeDirection( keyCodes.arrowdown, 'rtl' ) ).to.equal( 'down' );
			} );
		} );
	} );

	describe( 'isForwardArrowKeyCode()', () => {
		describe( 'for a left–to–right content language direction', () => {
			it( 'should return "true" for down arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowdown, 'ltr' ) ).to.be.true;
			} );

			it( 'should return "true" for right arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowright, 'ltr' ) ).to.be.true;
			} );

			it( 'should return "false" for up arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowup, 'ltr' ) ).to.be.false;
			} );

			it( 'should return "false" for left arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowleft, 'ltr' ) ).to.be.false;
			} );
		} );

		describe( 'for a right-to-left content language direction', () => {
			it( 'should return "true" for down arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowdown, 'rtl' ) ).to.be.true;
			} );

			it( 'should return "true" for left arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowleft, 'rtl' ) ).to.be.true;
			} );

			it( 'should return "false" for up arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowup, 'rtl' ) ).to.be.false;
			} );

			it( 'should return "false" for right arrow', () => {
				expect( isForwardArrowKeyCode( keyCodes.arrowright, 'rtl' ) ).to.be.false;
			} );
		} );
	} );
} );
