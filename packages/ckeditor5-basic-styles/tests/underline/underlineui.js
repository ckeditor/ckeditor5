/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { UnderlineEditing } from '../../src/underline/underlineediting.js';
import { UnderlineUI } from '../../src/underline/underlineui.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { env, keyCodes } from '@ckeditor/ckeditor5-utils';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

describe( 'Underline', () => {
	let editor, underlineView, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, UnderlineEditing, UnderlineUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( UnderlineUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( UnderlineUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'toolbar button', () => {
		beforeEach( () => {
			underlineView = editor.ui.componentFactory.create( 'underline' );
		} );

		testButton();
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			underlineView = editor.ui.componentFactory.create( 'menuBar:underline' );
		} );

		testButton();
	} );

	function testButton() {
		it( 'should register underline feature component', () => {
			expect( underlineView ).to.be.instanceOf( ButtonView );
			expect( underlineView.isOn ).toBe( false );
			expect( underlineView.label ).toEqual( 'Underline' );
			expect( underlineView.icon ).toMatch( /<svg / );
			expect( underlineView.keystroke ).toEqual( 'CTRL+U' );
			expect( underlineView.isToggleable ).toBe( true );
		} );

		it( 'should execute underline command on model execute event', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );

			underlineView.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'underline' );
		} );

		it( 'should bind model to underline command', () => {
			const command = editor.commands.get( 'underline' );

			expect( underlineView.isEnabled ).toBe( true );

			command.isEnabled = false;
			expect( underlineView.isEnabled ).toBe( false );
		} );

		it( 'should set keystroke in the model', () => {
			expect( underlineView.keystroke ).toEqual( 'CTRL+U' );
		} );

		it( 'should set editor keystroke', () => {
			const spy = vi.spyOn( editor, 'execute' );

			const wasHandled = editor.keystrokes.press( {
				keyCode: keyCodes.u,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			} );

			expect( wasHandled ).toBe( true );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should bind `isOn` to `command`.`value`', () => {
			const command = editor.commands.get( 'underline' );

			command.value = true;

			expect( underlineView.isOn ).toBe( true );

			command.value = false;

			expect( underlineView.isOn ).toBe( false );
		} );
	}
} );
