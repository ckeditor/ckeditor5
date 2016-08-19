/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { keyCodes, getCode, parseKeystroke } from '/ckeditor5/utils/keyboard.js';

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
		} );
	} );

	describe( 'getCode', () => {
		it( 'gets code of a number', () => {
			expect( getCode( '0' ) ).to.equal( 48 );
		} );

		it( 'gets code of a letter', () => {
			expect( getCode( 'a' ) ).to.equal( 65 );
		} );

		it( 'is case insensitive', () => {
			expect( getCode( 'A' ) ).to.equal( 65 );
			expect( getCode( 'Ctrl' ) ).to.equal( 0x110000 );
			expect( getCode( 'ENTER' ) ).to.equal( 13 );
		} );

		it( 'throws when passed unknown key name', () => {
			expect( () => {
				getCode( 'foo' );
			} ).to.throwCKEditorError( /^keyboard-unknown-key:/ );
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
			expect( () => {
				parseKeystroke( 'foo' );
			} ).to.throwCKEditorError( /^keyboard-unknown-key:/ );
		} );
	} );
} );
