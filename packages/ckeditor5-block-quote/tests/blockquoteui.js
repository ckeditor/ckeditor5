/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { BlockQuoteEditing } from '../src/blockquoteediting.js';
import { BlockQuoteUI } from '../src/blockquoteui.js';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

describe( 'BlockQuoteUI', () => {
	let editor, command, element, button;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ BlockQuoteEditing, BlockQuoteUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
				command = editor.commands.get( 'blockQuote' );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( BlockQuoteUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( BlockQuoteUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'toolbar block quote button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'blockQuote' );
		} );

		it( 'has the base properties', () => {
			expect( button ).toHaveProperty( 'label', 'Block quote' );
			expect( button ).toHaveProperty( 'icon' );
			expect( button ).toHaveProperty( 'tooltip', true );
			expect( button ).toHaveProperty( 'isToggleable', true );
		} );

		it( 'has isOn bound to command\'s value', () => {
			command.value = false;
			expect( button ).toHaveProperty( 'isOn', false );

			command.value = true;
			expect( button ).toHaveProperty( 'isOn', true );
		} );

		testButton();
	} );

	describe( 'menu bar block quote button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:blockQuote' );
		} );

		it( 'has the base properties', () => {
			expect( button ).toHaveProperty( 'label', 'Block quote' );
			expect( button ).toHaveProperty( 'icon' );
			expect( button ).toHaveProperty( 'isToggleable', true );
		} );

		testButton();
	} );

	function testButton() {
		it( 'has isEnabled bound to command\'s isEnabled', () => {
			command.isEnabled = true;
			expect( button ).toHaveProperty( 'isEnabled', true );

			command.isEnabled = false;
			expect( button ).toHaveProperty( 'isEnabled', false );
		} );

		it( 'executes command when it\'s executed', () => {
			const spy = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );

			button.fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 0 ] ).toBe( 'blockQuote' );
		} );
	}
} );
