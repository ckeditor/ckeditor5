/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { IconFontFamily } from '@ckeditor/ckeditor5-icons';
import { FontFamilyEditing } from '../../src/fontfamily/fontfamilyediting.js';
import { FontFamilyUI } from '../../src/fontfamily/fontfamilyui.js';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { add as addTranslations, _clearTranslations } from '@ckeditor/ckeditor5-utils';
import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';

describe( 'FontFamilyUI', () => {
	let editor, command, element;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeAll( () => {
		addTranslations( 'en', {
			'Font Family': 'Font Family',
			'Default': 'Default'
		} );

		addTranslations( 'pl', {
			'Font Family': 'Czcionka',
			'Default': 'Domyślna'
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
				plugins: [ FontFamilyEditing, FontFamilyUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FontFamilyUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( FontFamilyUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'toolbar dropdown', () => {
		let dropdown;

		beforeEach( () => {
			command = editor.commands.get( 'fontFamily' );
			dropdown = editor.ui.componentFactory.create( 'fontFamily' );
		} );

		it( 'button has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).toHaveProperty( 'label', 'Font Family' );
			expect( button ).toHaveProperty( 'tooltip', true );
			expect( button ).toHaveProperty( 'icon', IconFontFamily );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			const dropdown = editor.ui.componentFactory.create( 'fontFamily' );

			dropdown.render();

			expect( dropdown.element.classList.contains( 'ck-font-family-dropdown' ) ).toBe( true );
		} );

		it( 'should focus view after command execution', () => {
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' );
			const dropdown = editor.ui.componentFactory.create( 'fontFamily' );

			dropdown.commandName = 'fontFamily';
			dropdown.fire( 'execute' );

			expect( focusSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should activate current option in dropdown', () => {
			// Make sure that list view is not created before first dropdown open.
			expect( dropdown.listView ).toBeUndefined();

			// Trigger list view creation (lazy init).
			dropdown.isOpen = true;

			const listView = dropdown.listView;

			command.value = undefined;

			// The first item is 'default' font family.
			expect( listView.items.map( item => item.children.first.isOn ) )
				.toEqual( [ true, false, false, false, false, false, false, false, false ] );

			command.value = 'Arial, Helvetica, sans-serif';

			// The second item is 'Arial' font family.
			expect( listView.items.map( item => item.children.first.isOn ) )
				.toEqual( [ false, true, false, false, false, false, false, false, false ] );
		} );

		describe( 'with supportAllValues=true', () => {
			let editor, element, command, dropdown;

			beforeEach( async () => {
				element = document.createElement( 'div' );
				document.body.appendChild( element );

				editor = await ClassicTestEditor
					.create( element, {
						plugins: [ Paragraph, FontFamilyEditing, FontFamilyUI ],
						fontSize: {
							supportAllValues: true
						}
					} );

				command = editor.commands.get( 'fontFamily' );
				dropdown = editor.ui.componentFactory.create( 'fontFamily' );
			} );

			afterEach( async () => {
				await editor.destroy();
				element.remove();
			} );

			it( 'should activate the current option in the dropdown for full font family definitions', () => {
				// Make sure that list view is not created before first dropdown open.
				expect( dropdown.listView ).toBeUndefined();

				// Trigger list view creation (lazy init).
				dropdown.isOpen = true;

				const listView = dropdown.listView;

				command.value = undefined;

				// The first item is 'default' font family.
				expect( listView.items.map( item => item.children.first.isOn ) )
					.toEqual( [ true, false, false, false, false, false, false, false, false ] );

				command.value = '\'Courier New\', Courier, monospace';

				// The third item is 'Courier New' font family.
				expect( listView.items.map( item => item.children.first.isOn ) )
					.toEqual( [ false, false, true, false, false, false, false, false, false ] );
			} );

			it( 'should activate the current option in the dropdown for full font family definitions even if includes spaces', () => {
				// Make sure that list view is not created before first dropdown open.
				expect( dropdown.listView ).toBeUndefined();

				// Trigger list view creation (lazy init).
				dropdown.isOpen = true;

				const listView = dropdown.listView;

				command.value = undefined;

				// The first item is 'default' font family.
				expect( listView.items.map( item => item.children.first.isOn ) )
					.toEqual( [ true, false, false, false, false, false, false, false, false ] );

				command.value = 'Courier New , Courier, monospace';

				// The third item is 'Courier New' font family.
				expect( listView.items.map( item => item.children.first.isOn ) )
					.toEqual( [ false, false, true, false, false, false, false, false, false ] );
			} );

			it( 'should activate the current option in the dropdown even if only first face matches', () => {
				// Make sure that list view is not created before first dropdown open.
				expect( dropdown.listView ).toBeUndefined();

				// Trigger list view creation (lazy init).
				dropdown.isOpen = true;

				const listView = dropdown.listView;

				command.value = undefined;

				// The first item is 'default' font family.
				expect( listView.items.map( item => item.children.first.isOn ) )
					.toEqual( [ true, false, false, false, false, false, false, false, false ] );

				command.value = 'Courier New';

				// The third item is 'Courier New' font family.
				expect( listView.items.map( item => item.children.first.isOn ) )
					.toEqual( [ false, false, true, false, false, false, false, false, false ] );
			} );

			it( 'should apply the complete font-family value (list of font-families)', () => {
				dropdown.render();
				document.body.appendChild( dropdown.element );

				// Make sure that list view is not created before first dropdown open.
				expect( dropdown.listView ).toBeUndefined();

				// Trigger list view creation (lazy init).
				dropdown.isOpen = true;

				const listView = dropdown.listView;
				const fontFamilyArialButton = listView.items.get( 1 ).children.first;

				_setModelData( editor.model, '<paragraph>f[oo]</paragraph>' );

				fontFamilyArialButton.fire( 'execute' );

				expect( _getModelData( editor.model ) ).toEqual(
					'<paragraph>f[<$text fontFamily="Arial, Helvetica, sans-serif">oo</$text>]</paragraph>'
				);

				expect( editor.getData() ).toEqual( '<p>f<span style="font-family:Arial, Helvetica, sans-serif;">oo</span></p>' );

				dropdown.element.remove();
			} );
		} );

		describe( 'model to command binding', () => {
			it( 'isEnabled', () => {
				command.isEnabled = false;

				expect( dropdown.buttonView.isEnabled ).toBe( false );

				command.isEnabled = true;
				expect( dropdown.buttonView.isEnabled ).toBe( true );
			} );
		} );

		describe( 'localization', () => {
			let editorElement;

			beforeEach( async () => {
				await editor.destroy();

				return localizedEditor( [ 'default', 'Arial' ] );
			} );

			afterEach( () => {
				editorElement.remove();
			} );

			it( 'works for the #buttonView', () => {
				const buttonView = dropdown.buttonView;

				expect( buttonView.label ).toEqual( 'Czcionka' );
			} );

			it( 'works for the listView#items in the panel', () => {
				// Make sure that list view is not created before first dropdown open.
				expect( dropdown.listView ).toBeUndefined();

				// Trigger list view creation (lazy init).
				dropdown.isOpen = true;

				const listView = dropdown.listView;

				expect( listView.items.map( item => item.children.first.label ) ).toEqual( [
					'Domyślna',
					'Arial'
				] );
			} );

			function localizedEditor( options ) {
				editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ FontFamilyEditing, FontFamilyUI ],
						toolbar: [ 'fontFamily' ],
						language: 'pl',
						fontFamily: {
							options
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						dropdown = editor.ui.componentFactory.create( 'fontFamily' );
						command = editor.commands.get( 'fontFamily' );

						editorElement.remove();

						return editor.destroy();
					} );
			}
		} );

		describe( 'listview', () => {
			it( 'should have properties set', () => {
				// Trigger list view creation (lazy init).
				dropdown.isOpen = true;

				const listView = dropdown.listView;

				expect( listView.element.role ).toEqual( 'menu' );
				expect( listView.element.ariaLabel ).toEqual( 'Font Family' );
			} );
		} );
	} );

	describe( 'menu bar', () => {
		let subMenu;

		beforeEach( () => {
			command = editor.commands.get( 'fontFamily' );
			subMenu = editor.ui.componentFactory.create( 'menuBar:fontFamily' );
		} );

		it( 'button has the base properties', () => {
			const button = subMenu.buttonView;

			expect( button ).toHaveProperty( 'label', 'Font Family' );
			expect( button ).toHaveProperty( 'icon', IconFontFamily );
		} );

		it( 'button has binding to isEnabled', () => {
			command.isEnabled = false;

			expect( subMenu.buttonView.isEnabled ).toBe( false );

			command.isEnabled = true;
			expect( subMenu.buttonView.isEnabled ).toBe( true );
		} );

		describe( 'font family sub menu button', () => {
			let buttonArial;

			beforeEach( () => {
				buttonArial = subMenu.panelView.children.first.items.get( 1 ).children.first;
			} );

			it( 'should focus view after command execution', () => {
				const focusSpy = vi.spyOn( editor.editing.view, 'focus' );
				const executeSpy = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );

				buttonArial.fire( 'execute' );

				expect( focusSpy ).toHaveBeenCalledOnce();
				expect( executeSpy ).toHaveBeenCalledOnce();
				expect( executeSpy ).toHaveBeenNthCalledWith( 1, 'fontFamily', {
					value: 'Arial, Helvetica, sans-serif'
				} );
			} );

			it( 'sets item\'s #isOn depending on the value of the CodeBlockCommand', () => {
				expect( buttonArial.isOn ).toBe( false );

				command.value = 'Arial, Helvetica, sans-serif';

				expect( buttonArial.isOn ).toBe( true );
			} );

			it( 'sets item\'s element aria-checked attribute depending on the value of the CodeBlockCommand', () => {
				expect( buttonArial.element.getAttribute( 'aria-checked' ) ).toEqual( 'false' );

				command.value = 'Arial, Helvetica, sans-serif';

				expect( buttonArial.element.getAttribute( 'aria-checked' ) ).toEqual( 'true' );
			} );
		} );
	} );
} );
