/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// TODO change to new ListEditing
import { LegacyListEditing } from '../../src/legacylist/legacylistediting.js';
import { ListUI } from '../../src/list/listui.js';
import { List } from '../../src/list.js';
import { ListProperties } from '../../src/listproperties.js';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe( 'ListUI', () => {
	let editorElement, editor, model;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, { plugins: [ Paragraph, BlockQuote, LegacyListEditing, ListUI ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListUI.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListUI ) ).toBeInstanceOf( ListUI );
	} );

	describe( 'toolbar buttons', () => {
		let bulletedListButton, numberedListButton;

		beforeEach( () => {
			bulletedListButton = editor.ui.componentFactory.create( 'bulletedList' );
			numberedListButton = editor.ui.componentFactory.create( 'numberedList' );
		} );

		it( 'should set up buttons for bulleted list and numbered list', () => {
			expect( bulletedListButton ).toBeInstanceOf( ButtonView );
			expect( bulletedListButton.isToggleable ).toBe( true );

			expect( numberedListButton ).toBeInstanceOf( ButtonView );
			expect( numberedListButton.isToggleable ).toBe( true );
		} );

		it( 'should execute proper commands when buttons are used', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );

			bulletedListButton.fire( 'execute' );
			expect( executeSpy ).toHaveBeenCalledWith( 'bulletedList' );

			numberedListButton.fire( 'execute' );
			expect( executeSpy ).toHaveBeenCalledWith( 'numberedList' );
		} );

		it( 'should bind bulleted list button model to bulledList command', () => {
			_setModelData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

			const command = editor.commands.get( 'bulletedList' );

			expect( bulletedListButton.isOn ).toBe( true );
			expect( bulletedListButton.isEnabled ).toBe( true );

			command.value = false;
			expect( bulletedListButton.isOn ).toBe( false );

			command.isEnabled = false;
			expect( bulletedListButton.isEnabled ).toBe( false );
		} );

		it( 'should bind numbered list button model to numberedList command', () => {
			_setModelData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

			const command = editor.commands.get( 'numberedList' );

			// We are in UL, so numbered list is off.
			expect( numberedListButton.isOn ).toBe( false );
			expect( numberedListButton.isEnabled ).toBe( true );

			command.value = true;
			expect( numberedListButton.isOn ).toBe( true );

			command.isEnabled = false;
			expect( numberedListButton.isEnabled ).toBe( false );
		} );
	} );

	describe( 'menu bar menus', () => {
		let bulletedListButton, numberedListButton;

		beforeEach( () => {
			bulletedListButton = editor.ui.componentFactory.create( 'menuBar:bulletedList' );
			numberedListButton = editor.ui.componentFactory.create( 'menuBar:numberedList' );
		} );

		it( 'should set proper `role` and `isToggleable` attributes', () => {
			expect( bulletedListButton.role ).toBe( 'menuitemcheckbox' );
			expect( numberedListButton.role ).toBe( 'menuitemcheckbox' );

			expect( bulletedListButton.isToggleable ).toBe( true );
			expect( numberedListButton.isToggleable ).toBe( true );
		} );

		it( 'should set up buttons for bulleted list and numbered list', () => {
			expect( bulletedListButton ).toBeInstanceOf( MenuBarMenuListItemButtonView );
			expect( numberedListButton ).toBeInstanceOf( MenuBarMenuListItemButtonView );
		} );

		it( 'should execute proper commands when buttons are used', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );

			bulletedListButton.fire( 'execute' );
			expect( executeSpy ).toHaveBeenCalledWith( 'bulletedList' );

			numberedListButton.fire( 'execute' );
			expect( executeSpy ).toHaveBeenCalledWith( 'numberedList' );
		} );

		it( 'should bind bulleted list button model to bulledList command', () => {
			_setModelData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

			const command = editor.commands.get( 'bulletedList' );

			expect( bulletedListButton.isOn ).toBe( true );
			expect( bulletedListButton.isEnabled ).toBe( true );

			command.value = false;
			expect( bulletedListButton.isOn ).toBe( false );

			command.isEnabled = false;
			expect( bulletedListButton.isEnabled ).toBe( false );
		} );

		it( 'should bind numbered list button model to numberedList command', () => {
			_setModelData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

			const command = editor.commands.get( 'numberedList' );

			// We are in UL, so numbered list is off.
			expect( numberedListButton.isOn ).toBe( false );
			expect( numberedListButton.isEnabled ).toBe( true );

			command.value = true;
			expect( numberedListButton.isOn ).toBe( true );

			command.isEnabled = false;
			expect( numberedListButton.isEnabled ).toBe( false );
		} );
	} );

	describe( 'list properties', () => {
		let editorElement, editor;

		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor.create( editorElement, {
				plugins: [ Paragraph, BlockQuote, ListProperties, List ]
			} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should not override list properties ui components', () => {
			const bulletedListButton = editor.ui.componentFactory.create( 'bulletedList' );
			const numberedListButton = editor.ui.componentFactory.create( 'numberedList' );

			expect( bulletedListButton.class ).toBe( 'ck-list-styles-dropdown' );
			expect( numberedListButton.class ).toBe( 'ck-list-styles-dropdown' );
		} );
	} );
} );
