/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { SubscriptEditing } from '../../src/subscript/subscriptediting.js';
import { SubscriptUI } from '../../src/subscript/subscriptui.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

describe( 'SubscriptUI', () => {
	let editor, subView, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, SubscriptEditing, SubscriptUI ]
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
		expect( SubscriptUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( SubscriptUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'toolbar button', () => {
		beforeEach( () => {
			subView = editor.ui.componentFactory.create( 'subscript' );
		} );

		testButton();
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			subView = editor.ui.componentFactory.create( 'menuBar:subscript' );
		} );

		testButton();

		it( 'should create button with `menuitemcheckbox` role', () => {
			expect( subView.role ).toEqual( 'menuitemcheckbox' );
		} );

		it( 'should bind `isOn` to `aria-checked` attribute', () => {
			subView.render();

			subView.isOn = true;
			expect( subView.element.getAttribute( 'aria-checked' ) ).toEqual( 'true' );

			subView.isOn = false;
			expect( subView.element.getAttribute( 'aria-checked' ) ).toEqual( 'false' );
		} );
	} );

	function testButton() {
		it( 'should register subscript feature component', () => {
			expect( subView ).to.be.instanceOf( ButtonView );
			expect( subView.isOn ).toBe( false );
			expect( subView.label ).toEqual( 'Subscript' );
			expect( subView.icon ).toMatch( /<svg / );
			expect( subView.isToggleable ).toBe( true );
		} );

		it( 'should execute subscript command on model execute event', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );

			subView.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'subscript' );
		} );

		it( 'should bind model to subscript command', () => {
			const command = editor.commands.get( 'subscript' );

			expect( subView.isEnabled ).toBe( true );

			command.isEnabled = false;
			expect( subView.isEnabled ).toBe( false );
		} );

		it( 'should bind `isOn` to `command`.`value`', () => {
			const command = editor.commands.get( 'subscript' );

			command.value = true;

			expect( subView.isOn ).toBe( true );

			command.value = false;

			expect( subView.isOn ).toBe( false );
		} );
	}
} );
