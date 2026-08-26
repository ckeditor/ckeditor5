/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { SuperscriptEditing } from '../../src/superscript/superscriptediting.js';
import { SuperscriptUI } from '../../src/superscript/superscriptui.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

describe( 'SuperscriptUI', () => {
	let editor, superView, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, SuperscriptEditing, SuperscriptUI ]
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
		expect( SuperscriptUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( SuperscriptUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'toolbar button', () => {
		beforeEach( () => {
			superView = editor.ui.componentFactory.create( 'superscript' );
		} );

		testButton();
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			superView = editor.ui.componentFactory.create( 'menuBar:superscript' );
		} );

		testButton();

		it( 'should create button with `menuitemcheckbox` role', () => {
			expect( superView.role ).toEqual( 'menuitemcheckbox' );
		} );

		it( 'should bind `isOn` to `aria-checked` attribute', () => {
			superView.render();

			superView.isOn = true;
			expect( superView.element.getAttribute( 'aria-checked' ) ).toEqual( 'true' );

			superView.isOn = false;
			expect( superView.element.getAttribute( 'aria-checked' ) ).toEqual( 'false' );
		} );
	} );

	function testButton() {
		it( 'should register superscript feature component', () => {
			expect( superView ).to.be.instanceOf( ButtonView );
			expect( superView.isOn ).toBe( false );
			expect( superView.label ).toEqual( 'Superscript' );
			expect( superView.icon ).toMatch( /<svg / );
			expect( superView.isToggleable ).toBe( true );
		} );

		it( 'should execute superscript command on model execute event', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );

			superView.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'superscript' );
		} );

		it( 'should bind model to superscript command', () => {
			const command = editor.commands.get( 'superscript' );

			expect( superView.isEnabled ).toBe( true );

			command.isEnabled = false;
			expect( superView.isEnabled ).toBe( false );
		} );

		it( 'should bind `isOn` to `command`.`value`', () => {
			const command = editor.commands.get( 'superscript' );

			command.value = true;

			expect( superView.isOn ).toBe( true );

			command.value = false;

			expect( superView.isOn ).toBe( false );
		} );
	}
} );
