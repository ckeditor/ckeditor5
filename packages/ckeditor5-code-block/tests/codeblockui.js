/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { CodeBlockEditing } from '../src/codeblockediting.js';
import { CodeBlockUI } from '../src/codeblockui.js';

import { IconCodeBlock } from '@ckeditor/ckeditor5-icons';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { _clearTranslations, add as addTranslations } from '@ckeditor/ckeditor5-utils';

describe( 'CodeBlockUI', () => {
	let editor, command, element, languagesListView;

	beforeAll( () => {
		addTranslations( 'en', {
			'Plain text': 'Plain text'
		} );

		addTranslations( 'pl', {
			'Plain text': 'Zwykły tekst'
		} );
	} );

	afterAll( () => {
		_clearTranslations();
	} );

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ CodeBlockEditing, CodeBlockUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
				command = editor.commands.get( 'codeBlock' );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CodeBlockUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CodeBlockUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'toolbar', () => {
		let button;

		beforeEach( () => {
			const dropdown = editor.ui.componentFactory.create( 'codeBlock' );
			button = dropdown.buttonView;
			dropdown.isOpen = true;
			languagesListView = dropdown.listView;
		} );

		it( 'should execute the command with the "usePreviousLanguageChoice" option set to "true"', () => {
			const executeSpy = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' ).mockImplementation( () => {} );

			button.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( focusSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'codeBlock', {
				usePreviousLanguageChoice: true
			} );
		} );

		it( 'has the base properties', () => {
			expect( button ).toHaveProperty( 'label', 'Insert code block' );
			expect( button ).toHaveProperty( 'icon', IconCodeBlock );
			expect( button ).toHaveProperty( 'tooltip', true );
			expect( button ).toHaveProperty( 'isToggleable', true );
		} );

		it( 'has #isOn bound to command\'s value', () => {
			command.value = false;
			expect( button ).toHaveProperty( 'isOn', false );

			command.value = true;
			expect( button ).toHaveProperty( 'isOn', true );
		} );

		describe( 'language list', () => {
			testLanguagesList();

			it( 'uses localized "Plain text" label', async () => {
				await editor.destroy();

				return ClassicTestEditor
					.create( element, {
						language: 'pl',
						plugins: [ CodeBlockEditing, CodeBlockUI ]
					} )
					.then( newEditor => {
						const editor = newEditor;
						const dropdown = editor.ui.componentFactory.create( 'codeBlock' );

						// Make sure that list view is not created before first dropdown open.
						expect( dropdown.listView ).toBeUndefined();

						// Trigger list view creation (lazy init).
						dropdown.isOpen = true;

						const listView = dropdown.listView;

						expect( listView.items.first.children.first.label ).toBe( 'Zwykły tekst' );

						return editor.destroy();
					} );
			} );
		} );
	} );

	describe( 'menu bar', () => {
		let subMenu;

		beforeEach( () => {
			subMenu = editor.ui.componentFactory.create( 'menuBar:codeBlock' );
			languagesListView = subMenu.panelView.children.first;
		} );

		it( 'has proper menu item role on button', () => {
			expect( subMenu.buttonView.role ).toBe( 'menuitem' );
		} );

		it( 'sets item\'s aria-checked attribute depending on the value of the CodeBlockCommand', () => {
			const { element } = languagesListView.items.get( 2 ).children.first;

			expect( element.getAttribute( 'aria-checked' ) ).toBe( 'false' );

			command.value = 'cs';

			expect( element.getAttribute( 'aria-checked' ) ).toBe( 'true' );
		} );

		it( 'has isEnabled bound to command\'s isEnabled', () => {
			command.isEnabled = true;
			expect( subMenu ).toHaveProperty( 'isEnabled', true );

			command.isEnabled = false;
			expect( subMenu ).toHaveProperty( 'isEnabled', false );
		} );

		describe( 'language list', () => {
			testLanguagesList();

			it( 'uses localized "Plain text" label', async () => {
				await editor.destroy();

				return ClassicTestEditor
					.create( element, {
						language: 'pl',
						plugins: [ CodeBlockEditing, CodeBlockUI ]
					} )
					.then( newEditor => {
						const editor = newEditor;
						const subMenu = editor.ui.componentFactory.create( 'menuBar:codeBlock' );
						const listView = subMenu.panelView.children.first;

						expect( listView.items.first.children.first.label ).toBe( 'Zwykły tekst' );

						return editor.destroy();
					} );
			} );

			it( 'executes the command with forceValue=false when codeblock already has selected language set', () => {
				const executeSpy = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
				const focusSpy = vi.spyOn( editor.editing.view, 'focus' ).mockImplementation( () => {} );
				const cSharpButton = languagesListView.items.get( 2 ).children.first;

				command.value = 'cs';

				expect( cSharpButton.label ).toBe( 'C#' );
				cSharpButton.fire( 'execute' );

				expect( executeSpy ).toHaveBeenCalledOnce();
				expect( focusSpy ).toHaveBeenCalledOnce();
				expect( executeSpy ).toHaveBeenCalledWith( 'codeBlock', {
					language: 'cs',
					forceValue: false
				} );
			} );
		} );
	} );

	describe( 'codeBlock dropdown', () => {
		it( 'has #class set', () => {
			const dropdown = editor.ui.componentFactory.create( 'codeBlock' );

			expect( dropdown.class ).toBe( 'ck-code-block-dropdown' );
		} );

		it( 'has isEnabled bound to command\'s isEnabled', () => {
			const dropdown = editor.ui.componentFactory.create( 'codeBlock' );

			command.isEnabled = true;
			expect( dropdown ).toHaveProperty( 'isEnabled', true );

			command.isEnabled = false;
			expect( dropdown ).toHaveProperty( 'isEnabled', false );
		} );
	} );

	function testLanguagesList() {
		it( 'corresponds to the config', () => {
			expect( languagesListView.items
				.map( item => {
					const { label, withText } = item.children.first;

					return { label, withText };
				} ) )
				.toEqual( [
					{
						label: 'Plain text',
						withText: true
					},
					{
						label: 'C',
						withText: true
					},
					{
						label: 'C#',
						withText: true
					},
					{
						label: 'C++',
						withText: true
					},
					{
						label: 'CSS',
						withText: true
					},
					{
						label: 'Diff',
						withText: true
					},
					{
						label: 'Go',
						withText: true
					},
					{
						label: 'HTML',
						withText: true
					},
					{
						label: 'Java',
						withText: true
					},
					{
						label: 'JavaScript',
						withText: true
					},
					{
						label: 'PHP',
						withText: true
					},
					{
						label: 'Python',
						withText: true
					},
					{
						label: 'Ruby',
						withText: true
					},
					{
						label: 'TypeScript',
						withText: true
					},
					{
						label: 'XML',
						withText: true
					}
				] );
		} );

		it( 'sets item\'s #isOn depending on the value of the CodeBlockCommand', () => {
			expect( languagesListView.items.get( 2 ).children.first.isOn ).toBe( false );

			command.value = 'cs';
			expect( languagesListView.items.get( 2 ).children.first.isOn ).toBe( true );
		} );

		it( 'should have properties set', () => {
			expect( languagesListView.element.role ).toBe( 'menu' );
			expect( languagesListView.element.ariaLabel ).toBe( 'Insert code block' );
		} );

		it( 'executes the command when executed one of the available language buttons from the list', () => {
			const executeSpy = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' ).mockImplementation( () => {} );
			const cSharpButton = languagesListView.items.get( 2 ).children.first;

			expect( cSharpButton.label ).toBe( 'C#' );
			cSharpButton.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( focusSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'codeBlock', {
				language: 'cs',
				forceValue: true
			} );
		} );
	}
} );
