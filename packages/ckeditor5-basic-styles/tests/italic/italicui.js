/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { ItalicEditing } from '../../src/italic/italicediting.js';
import { ItalicUI } from '../../src/italic/italicui.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { env, keyCodes } from '@ckeditor/ckeditor5-utils';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

describe( 'ItalicUI', () => {
	let editor, italicView, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, ItalicEditing, ItalicUI ]
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
		expect( ItalicUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ItalicUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'toolbar button', () => {
		beforeEach( () => {
			italicView = editor.ui.componentFactory.create( 'italic' );
		} );

		testButton();
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			italicView = editor.ui.componentFactory.create( 'menuBar:italic' );
		} );

		testButton();

		it( 'should create button with `menuitemcheckbox` role', () => {
			expect( italicView.role ).toEqual( 'menuitemcheckbox' );
		} );

		it( 'should bind `isOn` to `aria-checked` attribute', () => {
			italicView.render();

			italicView.isOn = true;
			expect( italicView.element.getAttribute( 'aria-checked' ) ).toEqual( 'true' );

			italicView.isOn = false;
			expect( italicView.element.getAttribute( 'aria-checked' ) ).toEqual( 'false' );
		} );
	} );

	function testButton() {
		it( 'should register italic feature component', () => {
			expect( italicView ).to.be.instanceOf( ButtonView );
			expect( italicView.isOn ).toBe( false );
			expect( italicView.label ).toEqual( 'Italic' );
			expect( italicView.icon ).toMatch( /<svg / );
			expect( italicView.keystroke ).toEqual( 'CTRL+I' );
			expect( italicView.isToggleable ).toBe( true );
		} );

		it( 'should execute italic command on model execute event', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );

			italicView.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'italic' );
		} );

		it( 'should bind model to italic command', () => {
			const command = editor.commands.get( 'italic' );

			expect( italicView.isEnabled ).toBe( true );

			command.isEnabled = false;
			expect( italicView.isEnabled ).toBe( false );
		} );

		it( 'should set keystroke in the model', () => {
			expect( italicView.keystroke ).toEqual( 'CTRL+I' );
		} );

		it( 'should set editor keystroke', () => {
			const spy = vi.spyOn( editor, 'execute' );

			const wasHandled = editor.keystrokes.press( {
				keyCode: keyCodes.i,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			} );

			expect( wasHandled ).toBe( true );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should bind `isOn` to `command`.`value`', () => {
			const command = editor.commands.get( 'italic' );

			command.value = true;

			expect( italicView.isOn ).toBe( true );

			command.value = false;

			expect( italicView.isOn ).toBe( false );
		} );
	}
} );
