/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	keyCodes
} from '@ckeditor/ckeditor5-utils/src/keyboard';
import { isNonTypingKeystroke } from '../../src/utils/injectunsafekeystrokeshandling';

describe( 'unsafe keystroke handling utils', () => {
	describe( 'isNonTypingKeystroke()', () => {
		it( 'should return "true" for any keystroke with the Ctrl key', () => {
			expect( isNonTypingKeystroke( { keyCode: keyCodes.a, ctrlKey: true } ), 'Ctrl+a' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes[ 0 ], ctrlKey: true } ), 'Ctrl+0' ).to.be.true;
		} );

		it( 'should return "true" for all arrow keys', () => {
			expect( isNonTypingKeystroke( { keyCode: keyCodes.arrowup } ), 'arrow up' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.arrowdown } ), 'arrow down' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.arrowleft } ), 'arrow left' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.arrowright } ), 'arrow right' ).to.be.true;
		} );

		it( 'should return "true" for function (Fn) keystrokes', () => {
			expect( isNonTypingKeystroke( { keyCode: keyCodes.f1 } ), 'F1' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.f2 } ), 'F2' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.f3 } ), 'F3' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.f4 } ), 'F4' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.f5 } ), 'F5' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.f6 } ), 'F6' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.f7 } ), 'F7' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.f8 } ), 'F8' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.f9 } ), 'F9' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.f10 } ), 'F10' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.f11 } ), 'F11' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.f12 } ), 'F12' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 124 } ), 'F13' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 125 } ), 'F14' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 126 } ), 'F15' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 127 } ), 'F16' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 128 } ), 'F17' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 129 } ), 'F18' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 130 } ), 'F19' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 131 } ), 'F20' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 132 } ), 'F21' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 133 } ), 'F22' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 134 } ), 'F23' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 135 } ), 'F24' ).to.be.true;
		} );

		it( 'should return "true" for other safe keystrokes', () => {
			expect( isNonTypingKeystroke( { keyCode: keyCodes.tab } ), 'Tab' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 16 } ), 'Shift' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 17 } ), 'Ctrl' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 18 } ), 'Alt' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 19 } ), 'Pause' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 20 } ), 'CapsLock' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.esc } ), 'Escape' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 33 } ), 'PageUp' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 34 } ), 'PageDown' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 35 } ), 'Home' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 36 } ), 'End' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 45 } ), 'Insert' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 91 } ), 'Windows' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 93 } ), 'Menu key' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 144 } ), 'NumLock' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 145 } ), 'ScrollLock' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 173 } ), 'Mute/Unmute' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 174 } ), 'Volume up' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 175 } ), 'Volume down' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 176 } ), 'Next song' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 177 } ), 'Previous song' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 178 } ), 'Stop' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 179 } ), 'Play/Pause' ).to.be.true;
			expect( isNonTypingKeystroke( { keyCode: 255 } ), 'Display brightness (increase and decrease)' ).to.be.true;
		} );

		it( 'should return "false" for the keystrokes that result in typing', () => {
			expect( isNonTypingKeystroke( { keyCode: keyCodes.a } ), 'a' ).to.be.false;
			expect( isNonTypingKeystroke( { keyCode: keyCodes[ 0 ] } ), '0' ).to.be.false;
			expect( isNonTypingKeystroke( { keyCode: keyCodes.a, altKey: true } ), 'Alt+a' ).to.be.false;
		} );
	} );
} );
