/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { DropdownView, MenuBarMenuView } from '@ckeditor/ckeditor5-ui';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { TextPartLanguageEditing } from '../src/textpartlanguageediting.js';
import { TextPartLanguageUI } from '../src/textpartlanguageui.js';

describe( 'TextPartLanguageUI', () => {
	let editor, editorElement, command;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ TextPartLanguageUI, TextPartLanguageEditing, Paragraph ],
				toolbar: [ 'textPartLanguage' ]
			} )
			.then( newEditor => {
				editor = newEditor;
				command = editor.commands.get( 'textPartLanguage' );

				// Set data so the commands will be enabled.
				_setModelData( editor.model, '<paragraph>[foo]</paragraph>' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TextPartLanguageUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TextPartLanguageUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'init()', () => {
		describe( 'toolbar drop-down', () => {
			let dropdownView;

			beforeEach( () => {
				dropdownView = editor.ui.componentFactory.create( 'textPartLanguage' );
			} );

			afterEach( () => {
				dropdownView.destroy();
			} );

			it( 'should be registered', () => {
				expect( dropdownView ).toBeInstanceOf( DropdownView );
				expect( dropdownView.buttonView.isEnabled ).toBe( true );
				expect( dropdownView.buttonView.isOn ).toBe( false );
				expect( dropdownView.buttonView.label ).toEqual( 'Choose language' );
				expect( dropdownView.buttonView.tooltip ).toEqual( 'Language' );
				expect( dropdownView.buttonView.ariaLabel ).toEqual( 'Language' );
				expect( dropdownView.buttonView.ariaLabelledBy ).toBeUndefined();
			} );

			it( 'should lazy init language list dropdown', () => {
				dropdownView.isOpen = true;

				expect( dropdownView ).toBeInstanceOf( DropdownView );
				expect( dropdownView.buttonView.isEnabled ).toBe( true );
				expect( dropdownView.buttonView.isOn ).toBe( true );
				expect( dropdownView.buttonView.label ).toEqual( 'Choose language' );
				expect( dropdownView.buttonView.tooltip ).toEqual( 'Language' );
				expect( dropdownView.listView.items.first.children.first.label ).toEqual( 'Remove language' );
			} );

			it( 'should execute textPartLanguage command on model (no language selected)', () => {
				const executeSpy = vi.spyOn( command, 'execute' );

				dropdownView.fire( 'execute' );

				expect( executeSpy ).toHaveBeenCalledOnce();
				expect( executeSpy ).toHaveBeenCalledWith(
					{ languageCode: undefined, textDirection: undefined } );
			} );

			it( 'should execute textPartLanguage command on model (language selected)', () => {
				const executeSpy = vi.spyOn( command, 'execute' );

				dropdownView.languageCode = 'fr';
				dropdownView.textDirection = 'ltr';
				dropdownView.fire( 'execute' );

				expect( executeSpy ).toHaveBeenCalledOnce();
				expect( executeSpy ).toHaveBeenCalledWith(
					{ languageCode: 'fr', textDirection: 'ltr' } );
			} );

			it( 'should focus view after command execution', () => {
				const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

				dropdownView.languageCode = 'fr';
				dropdownView.fire( 'execute' );

				expect( focusSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should add custom CSS class to dropdown', () => {
				dropdownView.render();

				expect( dropdownView.element.classList.contains( 'ck-text-fragment-language-dropdown' ) ).toBe( true );
			} );

			describe( 'listview', () => {
				it( 'should have properties set', () => {
					// Trigger lazy init.
					dropdownView.isOpen = true;

					const listView = dropdownView.listView;

					expect( listView.element.role ).toEqual( 'menu' );
					expect( listView.element.ariaLabel ).toEqual( 'Language' );
				} );
			} );

			describe( 'model to command binding', () => {
				it( 'isEnabled', () => {
					command.isEnabled = false;

					expect( dropdownView.buttonView.isEnabled ).toBe( false );

					command.isEnabled = true;
					expect( dropdownView.buttonView.isEnabled ).toBe( true );

					command.isEnabled = false;
					expect( dropdownView.buttonView.isEnabled ).toBe( false );
				} );

				it( 'label', () => {
					command.value = false;

					expect( dropdownView.buttonView.label ).toEqual( 'Choose language' );

					command.value = 'fr:ltr';
					expect( dropdownView.buttonView.label ).toEqual( 'French' );

					command.value = 'ar:rtl';
					expect( dropdownView.buttonView.label ).toEqual( 'Arabic' );
				} );

				it( 'ariaLabel', () => {
					command.value = false;

					expect( dropdownView.buttonView.ariaLabel ).toEqual( 'Language' );

					command.value = 'fr:ltr';
					expect( dropdownView.buttonView.ariaLabel ).toEqual( 'French, Language' );

					command.value = 'ar:rtl';
					expect( dropdownView.buttonView.ariaLabel ).toEqual( 'Arabic, Language' );
				} );

				it( 'reflects the #value of the command', () => {
					// Trigger lazy init.
					dropdownView.isOpen = true;

					const listView = dropdownView.listView;

					_setModelData( editor.model, '<paragraph>[<$text language="fr:ltr">te]xt</$text></paragraph>' );

					expect( getListViewItems( listView ).map( item => item.children.first.isOn ) ).toEqual( [
						false,
						false,
						true,
						false
					] );
				} );
			} );
		} );

		describe( 'menu bar menu', () => {
			let menuView;

			beforeEach( () => {
				menuView = editor.ui.componentFactory.create( 'menuBar:textPartLanguage' );
			} );

			afterEach( () => {
				menuView.destroy();
			} );

			it( 'should be registered', () => {
				expect( menuView ).toBeInstanceOf( MenuBarMenuView );
				expect( menuView.buttonView.isEnabled ).toBe( true );
				expect( menuView.buttonView.isOn ).toBe( false );
				expect( menuView.buttonView.label ).toEqual( 'Language' );
				expect( menuView.listView ).toBeUndefined();
			} );

			it( 'should execute textPartLanguage command on model (no language selected)', () => {
				const executeSpy = vi.spyOn( command, 'execute' );

				menuView.fire( 'execute' );

				expect( executeSpy ).toHaveBeenCalledOnce();
				expect( executeSpy ).toHaveBeenCalledWith(
					{ languageCode: undefined, textDirection: undefined } );
			} );

			it( 'should execute textPartLanguage command on model (language selected)', () => {
				const executeSpy = vi.spyOn( command, 'execute' );

				menuView.languageCode = 'fr';
				menuView.textDirection = 'ltr';
				menuView.fire( 'execute' );

				expect( executeSpy ).toHaveBeenCalledOnce();
				expect( executeSpy ).toHaveBeenCalledWith(
					{ languageCode: 'fr', textDirection: 'ltr' } );
			} );

			it( 'should focus view after command execution', () => {
				const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

				menuView.languageCode = 'fr';
				menuView.fire( 'execute' );

				expect( focusSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should have menuitem role set on definition items', () => {
				const items = getListViewItems( menuView.panelView.children.first );

				expect( items.every( item => item.children.first.role === 'menuitemradio' ) ).toBe( true );
			} );

			describe( 'listview', () => {
				it( 'should have properties set', () => {
					// Trigger lazy init.
					menuView.isOpen = true;

					const listView = menuView.panelView.children.first;

					expect( listView.element.role ).toEqual( 'menu' );
					expect( listView.element.ariaLabel ).toEqual( 'Language' );
				} );
			} );

			describe( 'model to command binding', () => {
				it( 'isEnabled', () => {
					command.isEnabled = false;

					expect( menuView.buttonView.isEnabled ).toBe( false );

					command.isEnabled = true;
					expect( menuView.buttonView.isEnabled ).toBe( true );

					command.isEnabled = false;
					expect( menuView.buttonView.isEnabled ).toBe( false );
				} );

				it( 'reflects the #value of the command', () => {
					// Trigger lazy init.
					menuView.isOpen = true;

					const listView = menuView.panelView.children.first;

					_setModelData( editor.model, '<paragraph>[<$text language="fr:ltr">te]xt</$text></paragraph>' );

					expect( getListViewItems( listView ).map( item => item.children.first.isOn ) ).toEqual( [
						false,
						false,
						true,
						false
					] );
				} );

				it( 'should have `aria-checked` attribute assigned to items', () => {
					// Trigger lazy init.
					menuView.isOpen = true;

					_setModelData( editor.model, '<paragraph>[<$text language="fr:ltr">te]xt</$text></paragraph>' );

					const listView = menuView.panelView.children.first;
					const attributes = getListViewItems( listView )
						.map( item => item.children.first.element.getAttribute( 'aria-checked' ) );

					expect( attributes ).toEqual( [
						'false',
						'false',
						'true',
						'false'
					] );
				} );
			} );
		} );
	} );

	function getListViewItems( listView ) {
		// Let's drop separator.
		return listView.items.filter( item => item.children );
	}
} );
