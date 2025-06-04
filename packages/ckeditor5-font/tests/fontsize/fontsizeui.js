/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconFontSize } from 'ckeditor5/src/icons.js';
import FontSizeEditing from '../../src/fontsize/fontsizeediting.js';
import FontSizeUI from '../../src/fontsize/fontsizeui.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { _clear as clearTranslations, add as addTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service.js';
import { normalizeOptions } from '../../src/fontsize/utils.js';

describe( 'FontSizeUI', () => {
	let editor, command, element;

	testUtils.createSinonSandbox();

	before( () => {
		addTranslations( 'en', {
			'Font Size': 'Font Size',
			'Default': 'Default',
			'Tiny': 'Tiny',
			'Small': 'Small',
			'Big': 'Big',
			'Huge': 'Huge'
		} );

		addTranslations( 'pl', {
			'Font Size': 'Rozmiar czcionki',
			'Default': 'Domyślny',
			'Tiny': 'Tyci',
			'Small': 'Mały',
			'Big': 'Duży',
			'Huge': 'Ogromny'
		} );
	} );

	after( () => {
		clearTranslations();
	} );

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ FontSizeEditing, FontSizeUI ]
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
		expect( FontSizeUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( FontSizeUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'toolbar dropdown', () => {
		let dropdown;

		beforeEach( () => {
			command = editor.commands.get( 'fontSize' );
			dropdown = editor.ui.componentFactory.create( 'fontSize' );
		} );

		it( 'button has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'label', 'Font Size' );
			expect( button ).to.have.property( 'tooltip', true );
			expect( button ).to.have.property( 'icon', IconFontSize );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			dropdown.render();

			expect( dropdown.element.classList.contains( 'ck-font-size-dropdown' ) ).to.be.true;
		} );

		it( 'should focus view after command execution', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

			dropdown.commandName = 'fontSize';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( focusSpy );
		} );

		it( 'should activate current option in dropdown', () => {
			// Make sure that list view is not created before first dropdown open.
			expect( dropdown.listView ).to.be.undefined;

			// Trigger list view creation (lazy init).
			dropdown.isOpen = true;

			const listView = dropdown.listView;

			command.value = undefined;

			// The third item is 'default' font size.
			expect( listView.items.map( item => item.children.first.isOn ) ).to.deep.equal( [ false, false, true, false, false ] );

			command.value = 'tiny';

			// The first item is 'tiny' font size.
			expect( listView.items.map( item => item.children.first.isOn ) ).to.deep.equal( [ true, false, false, false, false ] );
		} );

		describe( 'model to command binding', () => {
			it( 'isEnabled', () => {
				command.isEnabled = false;

				expect( dropdown.buttonView.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( dropdown.buttonView.isEnabled ).to.be.true;
			} );
		} );

		describe( 'config', () => {
			beforeEach( () => {
				// Each test case in this group creates its own element, so make sure to delete editor created in
				// the main beforeEach in this file, as later element and editor vars are overridden (#6002).
				element.remove();
				return editor.destroy();
			} );

			describe( 'using presets', () => {
				beforeEach( () => {
					element = document.createElement( 'div' );
					document.body.appendChild( element );

					return ClassicTestEditor
						.create( element, {
							plugins: [ FontSizeEditing, FontSizeUI ],
							fontSize: {
								options: [ 'tiny', 'small', 'default', 'big', 'huge' ]
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							dropdown = editor.ui.componentFactory.create( 'fontSize' );
						} );
				} );

				it( 'adds css class to listView#items in the panel', () => {
					// Make sure that list view is not created before first dropdown open.
					expect( dropdown.listView ).to.be.undefined;

					// Trigger list view creation (lazy init).
					dropdown.isOpen = true;

					const listView = dropdown.listView;

					expect( listView.items.map( item => item.children.first.class ) ).to.deep.equal( [
						'ck-fontsize-option text-tiny',
						'ck-fontsize-option text-small',
						'ck-fontsize-option',
						'ck-fontsize-option text-big',
						'ck-fontsize-option text-huge'
					] );
				} );
			} );

			describe( 'using numerical values', () => {
				beforeEach( () => {
					element = document.createElement( 'div' );
					document.body.appendChild( element );

					return ClassicTestEditor
						.create( element, {
							plugins: [ FontSizeEditing, FontSizeUI ],
							fontSize: {
								options: [ 10, 12, 'default', 16, 18 ]
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							dropdown = editor.ui.componentFactory.create( 'fontSize' );
						} );
				} );

				it( 'adds css class to listView#items in the panel', () => {
					// Make sure that list view is not created before first dropdown open.
					expect( dropdown.listView ).to.be.undefined;

					// Trigger list view creation (lazy init).
					dropdown.isOpen = true;

					const listView = dropdown.listView;

					expect( listView.items.map( item => item.children.first.class ) ).to.deep.equal( [
						'ck-fontsize-option',
						'ck-fontsize-option',
						'ck-fontsize-option',
						'ck-fontsize-option',
						'ck-fontsize-option'
					] );
				} );

				it( 'adds font-size style to listView#items in the panel', () => {
					// Make sure that list view is not created before first dropdown open.
					expect( dropdown.listView ).to.be.undefined;

					// Trigger list view creation (lazy init).
					dropdown.isOpen = true;

					const listView = dropdown.listView;

					expect( listView.items.map( item => item.children.first.labelStyle ) ).to.deep.equal( [
						'font-size:10px',
						'font-size:12px',
						undefined,
						'font-size:16px',
						'font-size:18px'
					] );
				} );
			} );
		} );

		describe( 'localization', () => {
			beforeEach( async () => {
				element.remove();
				await editor.destroy();

				return localizedEditor( [ 'tiny', 'small', 'default', 'big', 'huge' ] );
			} );

			it( 'does not alter normalizeOptions() internals', () => {
				const options = normalizeOptions( [ 'tiny', 'small', 'default', 'big', 'huge' ] );
				expect( options ).to.deep.equal( [
					{ title: 'Tiny', model: 'tiny', view: { name: 'span', classes: 'text-tiny', priority: 7 } },
					{ title: 'Small', model: 'small', view: { name: 'span', classes: 'text-small', priority: 7 } },
					{ title: 'Default', model: undefined },
					{ title: 'Big', model: 'big', view: { name: 'span', classes: 'text-big', priority: 7 } },
					{ title: 'Huge', model: 'huge', view: { name: 'span', classes: 'text-huge', priority: 7 } }
				] );
			} );

			it( 'works for the #buttonView', () => {
				const buttonView = dropdown.buttonView;

				expect( buttonView.label ).to.equal( 'Rozmiar czcionki' );
			} );

			it( 'works for the listView#items in the panel', () => {
				// Make sure that list view is not created before first dropdown open.
				expect( dropdown.listView ).to.be.undefined;

				// Trigger list view creation (lazy init).
				dropdown.isOpen = true;

				const listView = dropdown.listView;

				expect( listView.items.map( item => item.children.first.label ) ).to.deep.equal( [
					'Tyci',
					'Mały',
					'Domyślny',
					'Duży',
					'Ogromny'
				] );
			} );

			function localizedEditor( options ) {
				const editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ FontSizeEditing, FontSizeUI ],
						toolbar: [ 'fontSize' ],
						language: 'pl',
						fontSize: {
							options
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						dropdown = editor.ui.componentFactory.create( 'fontSize' );
						command = editor.commands.get( 'fontSize' );

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

				expect( listView.element.role ).to.equal( 'menu' );
				expect( listView.element.ariaLabel ).to.equal( 'Font Size' );
			} );
		} );
	} );

	describe( 'menu bar', () => {
		let subMenu;

		beforeEach( () => {
			command = editor.commands.get( 'fontSize' );
			subMenu = editor.ui.componentFactory.create( 'menuBar:fontSize' );
		} );

		it( 'button has the base properties', () => {
			const button = subMenu.buttonView;

			expect( button ).to.have.property( 'label', 'Font Size' );
			expect( button ).to.have.property( 'icon', IconFontSize );
		} );

		it( 'button has binding to isEnabled', () => {
			command.isEnabled = false;

			expect( subMenu.buttonView.isEnabled ).to.be.false;

			command.isEnabled = true;
			expect( subMenu.buttonView.isEnabled ).to.be.true;
		} );

		describe( 'font size sub menu button', () => {
			let buttonSmall;

			beforeEach( () => {
				buttonSmall = subMenu.panelView.children.first.items.get( 1 ).children.first;
			} );

			it( 'should focus view after command execution', () => {
				const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
				const executeSpy = sinon.stub( editor, 'execute' );

				buttonSmall.fire( 'execute' );

				sinon.assert.calledOnce( focusSpy );
				sinon.assert.calledOnce( executeSpy );
				sinon.assert.calledWithExactly( executeSpy.firstCall, 'fontSize', {
					value: 'small'
				} );
			} );

			it( 'sets item\'s #isOn depending on the value of the CodeBlockCommand', () => {
				expect( buttonSmall.isOn ).to.be.false;

				command.value = 'small';
				expect( buttonSmall.isOn ).to.be.true;
			} );

			it( 'button has proper `aria-checked` attribute set when active', () => {
				expect( buttonSmall.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'false' );

				command.value = 'small';

				expect( buttonSmall.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'true' );
			} );
		} );
	} );
} );
