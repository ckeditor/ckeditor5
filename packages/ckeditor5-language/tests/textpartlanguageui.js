/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import TextPartLanguageEditing from '../src/textpartlanguageediting.js';
import TextPartLanguageUI from '../src/textpartlanguageui.js';
import { MenuBarMenuView } from '@ckeditor/ckeditor5-ui';

describe( 'TextPartLanguageUI', () => {
	let editor, editorElement, command;

	testUtils.createSinonSandbox();

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
				setData( editor.model, '<paragraph>[foo]</paragraph>' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TextPartLanguageUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TextPartLanguageUI.isPremiumPlugin ).to.be.false;
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
				expect( dropdownView ).to.be.instanceOf( DropdownView );
				expect( dropdownView.buttonView.isEnabled ).to.be.true;
				expect( dropdownView.buttonView.isOn ).to.be.false;
				expect( dropdownView.buttonView.label ).to.equal( 'Choose language' );
				expect( dropdownView.buttonView.tooltip ).to.equal( 'Language' );
				expect( dropdownView.buttonView.ariaLabel ).to.equal( 'Language' );
				expect( dropdownView.buttonView.ariaLabelledBy ).to.be.undefined;
			} );

			it( 'should lazy init language list dropdown', () => {
				dropdownView.isOpen = true;

				expect( dropdownView ).to.be.instanceOf( DropdownView );
				expect( dropdownView.buttonView.isEnabled ).to.be.true;
				expect( dropdownView.buttonView.isOn ).to.be.true;
				expect( dropdownView.buttonView.label ).to.equal( 'Choose language' );
				expect( dropdownView.buttonView.tooltip ).to.equal( 'Language' );
				expect( dropdownView.listView.items.first.children.first.label ).to.equal( 'Remove language' );
			} );

			it( 'should execute textPartLanguage command on model (no language selected)', () => {
				const executeSpy = testUtils.sinon.spy( command, 'execute' );

				dropdownView.fire( 'execute' );

				sinon.assert.calledOnce( executeSpy );
				sinon.assert.calledWithExactly( executeSpy,
					{ languageCode: undefined, textDirection: undefined } );
			} );

			it( 'should execute textPartLanguage command on model (language selected)', () => {
				const executeSpy = testUtils.sinon.spy( command, 'execute' );

				dropdownView.languageCode = 'fr';
				dropdownView.textDirection = 'ltr';
				dropdownView.fire( 'execute' );

				sinon.assert.calledOnce( executeSpy );
				sinon.assert.calledWithExactly( executeSpy,
					{ languageCode: 'fr', textDirection: 'ltr' } );
			} );

			it( 'should focus view after command execution', () => {
				const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				dropdownView.languageCode = 'fr';
				dropdownView.fire( 'execute' );

				sinon.assert.calledOnce( focusSpy );
			} );

			it( 'should add custom CSS class to dropdown', () => {
				dropdownView.render();

				expect( dropdownView.element.classList.contains( 'ck-text-fragment-language-dropdown' ) ).to.be.true;
			} );

			describe( 'listview', () => {
				it( 'should have properties set', () => {
					// Trigger lazy init.
					dropdownView.isOpen = true;

					const listView = dropdownView.listView;

					expect( listView.element.role ).to.equal( 'menu' );
					expect( listView.element.ariaLabel ).to.equal( 'Language' );
				} );
			} );

			describe( 'model to command binding', () => {
				it( 'isEnabled', () => {
					command.isEnabled = false;

					expect( dropdownView.buttonView.isEnabled ).to.be.false;

					command.isEnabled = true;
					expect( dropdownView.buttonView.isEnabled ).to.be.true;

					command.isEnabled = false;
					expect( dropdownView.buttonView.isEnabled ).to.be.false;
				} );

				it( 'label', () => {
					command.value = false;

					expect( dropdownView.buttonView.label ).to.equal( 'Choose language' );

					command.value = 'fr:ltr';
					expect( dropdownView.buttonView.label ).to.equal( 'French' );

					command.value = 'ar:rtl';
					expect( dropdownView.buttonView.label ).to.equal( 'Arabic' );
				} );

				it( 'ariaLabel', () => {
					command.value = false;

					expect( dropdownView.buttonView.ariaLabel ).to.equal( 'Language' );

					command.value = 'fr:ltr';
					expect( dropdownView.buttonView.ariaLabel ).to.equal( 'French, Language' );

					command.value = 'ar:rtl';
					expect( dropdownView.buttonView.ariaLabel ).to.equal( 'Arabic, Language' );
				} );

				it( 'reflects the #value of the command', () => {
					// Trigger lazy init.
					dropdownView.isOpen = true;

					const listView = dropdownView.listView;

					setData( editor.model, '<paragraph>[<$text language="fr:ltr">te]xt</$text></paragraph>' );

					expect( getListViewItems( listView ).map( item => item.children.first.isOn ) ).to.deep.equal( [
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
				expect( menuView ).to.be.instanceOf( MenuBarMenuView );
				expect( menuView.buttonView.isEnabled ).to.be.true;
				expect( menuView.buttonView.isOn ).to.be.false;
				expect( menuView.buttonView.label ).to.equal( 'Language' );
				expect( menuView.listView ).to.be.undefined;
			} );

			it( 'should execute textPartLanguage command on model (no language selected)', () => {
				const executeSpy = testUtils.sinon.spy( command, 'execute' );

				menuView.fire( 'execute' );

				sinon.assert.calledOnce( executeSpy );
				sinon.assert.calledWithExactly( executeSpy,
					{ languageCode: undefined, textDirection: undefined } );
			} );

			it( 'should execute textPartLanguage command on model (language selected)', () => {
				const executeSpy = testUtils.sinon.spy( command, 'execute' );

				menuView.languageCode = 'fr';
				menuView.textDirection = 'ltr';
				menuView.fire( 'execute' );

				sinon.assert.calledOnce( executeSpy );
				sinon.assert.calledWithExactly( executeSpy,
					{ languageCode: 'fr', textDirection: 'ltr' } );
			} );

			it( 'should focus view after command execution', () => {
				const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				menuView.languageCode = 'fr';
				menuView.fire( 'execute' );

				sinon.assert.calledOnce( focusSpy );
			} );

			it( 'should have menuitem role set on definition items', () => {
				const items = getListViewItems( menuView.panelView.children.first );

				expect( items.every( item => item.children.first.role === 'menuitemradio' ) ).to.be.true;
			} );

			describe( 'listview', () => {
				it( 'should have properties set', () => {
					// Trigger lazy init.
					menuView.isOpen = true;

					const listView = menuView.panelView.children.first;

					expect( listView.element.role ).to.equal( 'menu' );
					expect( listView.element.ariaLabel ).to.equal( 'Language' );
				} );
			} );

			describe( 'model to command binding', () => {
				it( 'isEnabled', () => {
					command.isEnabled = false;

					expect( menuView.buttonView.isEnabled ).to.be.false;

					command.isEnabled = true;
					expect( menuView.buttonView.isEnabled ).to.be.true;

					command.isEnabled = false;
					expect( menuView.buttonView.isEnabled ).to.be.false;
				} );

				it( 'reflects the #value of the command', () => {
					// Trigger lazy init.
					menuView.isOpen = true;

					const listView = menuView.panelView.children.first;

					setData( editor.model, '<paragraph>[<$text language="fr:ltr">te]xt</$text></paragraph>' );

					expect( getListViewItems( listView ).map( item => item.children.first.isOn ) ).to.deep.equal( [
						false,
						false,
						true,
						false
					] );
				} );

				it( 'should have `aria-checked` attribute assigned to items', () => {
					// Trigger lazy init.
					menuView.isOpen = true;

					setData( editor.model, '<paragraph>[<$text language="fr:ltr">te]xt</$text></paragraph>' );

					const listView = menuView.panelView.children.first;
					const attributes = getListViewItems( listView )
						.map( item => item.children.first.element.getAttribute( 'aria-checked' ) );

					expect( attributes ).to.deep.equal( [
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
