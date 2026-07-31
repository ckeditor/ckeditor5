/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { BoldEditing } from '../../src/bold/boldediting.js';
import { BoldUI } from '../../src/bold/boldui.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

describe( 'BoldUI', () => {
	let editor, boldView, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, BoldEditing, BoldUI ]
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
		expect( BoldUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( BoldUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'toolbar button', () => {
		beforeEach( () => {
			boldView = editor.ui.componentFactory.create( 'bold' );
		} );

		testButton();
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			boldView = editor.ui.componentFactory.create( 'menuBar:bold' );
		} );

		testButton();

		it( 'should create button with `menuitemcheckbox` role', () => {
			expect( boldView.role ).toEqual( 'menuitemcheckbox' );
		} );

		it( 'should bind `isOn` to `aria-checked` attribute', () => {
			boldView.render();

			boldView.isOn = true;
			expect( boldView.element.getAttribute( 'aria-checked' ) ).toEqual( 'true' );

			boldView.isOn = false;
			expect( boldView.element.getAttribute( 'aria-checked' ) ).toEqual( 'false' );
		} );
	} );

	function testButton() {
		it( 'should register bold feature component', () => {
			expect( boldView ).to.be.instanceOf( ButtonView );
			expect( boldView.isOn ).toBe( false );
			expect( boldView.label ).toEqual( 'Bold' );
			expect( boldView.icon ).toMatch( /<svg / );
			expect( boldView.keystroke ).toEqual( 'CTRL+B' );
			expect( boldView.isToggleable ).toBe( true );
		} );

		it( 'should execute bold command on model execute event', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );

			boldView.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'bold' );
		} );

		it( 'should bind `isEnabled` to bold command', () => {
			const command = editor.commands.get( 'bold' );

			expect( boldView.isEnabled ).toBe( true );

			command.isEnabled = false;
			expect( boldView.isEnabled ).toBe( false );
		} );

		it( 'should set keystroke in the model', () => {
			expect( boldView.keystroke ).toEqual( 'CTRL+B' );
		} );

		it( 'should bind `isOn` to `command`.`value`', () => {
			const command = editor.commands.get( 'bold' );

			command.value = true;

			expect( boldView.isOn ).toBe( true );

			command.value = false;

			expect( boldView.isOn ).toBe( false );
		} );
	}
} );
