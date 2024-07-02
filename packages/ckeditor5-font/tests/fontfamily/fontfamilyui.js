/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import FontFamilyEditing from '../../src/fontfamily/fontfamilyediting.js';
import FontFamilyUI from '../../src/fontfamily/fontfamilyui.js';

import fontFamilyIcon from '../../theme/icons/font-family.svg';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'FontFamilyUI', () => {
	let editor, command, element;

	testUtils.createSinonSandbox();

	before( () => {
		addTranslations( 'en', {
			'Font Family': 'Font Family',
			'Default': 'Default'
		} );

		addTranslations( 'pl', {
			'Font Family': 'Czcionka',
			'Default': 'Domyślna'
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

	describe( 'toolbar dropdown', () => {
		let dropdown;

		beforeEach( () => {
			command = editor.commands.get( 'fontFamily' );
			dropdown = editor.ui.componentFactory.create( 'fontFamily' );
		} );

		it( 'button has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'label', 'Font Family' );
			expect( button ).to.have.property( 'tooltip', true );
			expect( button ).to.have.property( 'icon', fontFamilyIcon );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			const dropdown = editor.ui.componentFactory.create( 'fontFamily' );

			dropdown.render();

			expect( dropdown.element.classList.contains( 'ck-font-family-dropdown' ) ).to.be.true;
		} );

		it( 'should focus view after command execution', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const dropdown = editor.ui.componentFactory.create( 'fontFamily' );

			dropdown.commandName = 'fontFamily';
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

			// The first item is 'default' font family.
			expect( listView.items.map( item => item.children.first.isOn ) )
				.to.deep.equal( [ true, false, false, false, false, false, false, false, false ] );

			command.value = 'Arial, Helvetica, sans-serif';

			// The second item is 'Arial' font family.
			expect( listView.items.map( item => item.children.first.isOn ) )
				.to.deep.equal( [ false, true, false, false, false, false, false, false, false ] );
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
				expect( dropdown.listView ).to.be.undefined;

				// Trigger list view creation (lazy init).
				dropdown.isOpen = true;

				const listView = dropdown.listView;

				command.value = undefined;

				// The first item is 'default' font family.
				expect( listView.items.map( item => item.children.first.isOn ) )
					.to.deep.equal( [ true, false, false, false, false, false, false, false, false ] );

				command.value = '\'Courier New\', Courier, monospace';

				// The third item is 'Courier New' font family.
				expect( listView.items.map( item => item.children.first.isOn ) )
					.to.deep.equal( [ false, false, true, false, false, false, false, false, false ] );
			} );

			it( 'should apply the complete font-family value (list of font-families)', () => {
				dropdown.render();
				document.body.appendChild( dropdown.element );

				// Make sure that list view is not created before first dropdown open.
				expect( dropdown.listView ).to.be.undefined;

				// Trigger list view creation (lazy init).
				dropdown.isOpen = true;

				const listView = dropdown.listView;
				const fontFamilyArialButton = listView.items.get( 1 ).children.first;

				setModelData( editor.model, '<paragraph>f[oo]</paragraph>' );

				fontFamilyArialButton.fire( 'execute' );

				expect( getModelData( editor.model ) ).to.equal(
					'<paragraph>f[<$text fontFamily="Arial, Helvetica, sans-serif">oo</$text>]</paragraph>'
				);

				expect( editor.getData() ).to.equal( '<p>f<span style="font-family:Arial, Helvetica, sans-serif;">oo</span></p>' );

				dropdown.element.remove();
			} );
		} );

		describe( 'model to command binding', () => {
			it( 'isEnabled', () => {
				command.isEnabled = false;

				expect( dropdown.buttonView.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( dropdown.buttonView.isEnabled ).to.be.true;
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

				expect( buttonView.label ).to.equal( 'Czcionka' );
			} );

			it( 'works for the listView#items in the panel', () => {
				// Make sure that list view is not created before first dropdown open.
				expect( dropdown.listView ).to.be.undefined;

				// Trigger list view creation (lazy init).
				dropdown.isOpen = true;

				const listView = dropdown.listView;

				expect( listView.items.map( item => item.children.first.label ) ).to.deep.equal( [
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

				expect( listView.element.role ).to.equal( 'menu' );
				expect( listView.element.ariaLabel ).to.equal( 'Font Family' );
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

			expect( button ).to.have.property( 'label', 'Font Family' );
			expect( button ).to.have.property( 'icon', fontFamilyIcon );
		} );

		it( 'button has binding to isEnabled', () => {
			command.isEnabled = false;

			expect( subMenu.buttonView.isEnabled ).to.be.false;

			command.isEnabled = true;
			expect( subMenu.buttonView.isEnabled ).to.be.true;
		} );

		describe( 'font family sub menu button', () => {
			let buttonArial;

			beforeEach( () => {
				buttonArial = subMenu.panelView.children.first.items.get( 1 ).children.first;
			} );

			it( 'should focus view after command execution', () => {
				const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
				const executeSpy = sinon.stub( editor, 'execute' );

				buttonArial.fire( 'execute' );

				sinon.assert.calledOnce( focusSpy );
				sinon.assert.calledOnce( executeSpy );
				sinon.assert.calledWithExactly( executeSpy.firstCall, 'fontFamily', {
					value: 'Arial, Helvetica, sans-serif'
				} );
			} );

			it( 'sets item\'s #isOn depending on the value of the CodeBlockCommand', () => {
				expect( buttonArial.isOn ).to.be.false;

				command.value = 'Arial, Helvetica, sans-serif';

				expect( buttonArial.isOn ).to.be.true;
			} );

			it( 'sets item\'s element aria-checked attribute depending on the value of the CodeBlockCommand', () => {
				expect( buttonArial.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'false' );

				command.value = 'Arial, Helvetica, sans-serif';

				expect( buttonArial.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'true' );
			} );
		} );
	} );
} );
