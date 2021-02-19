/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import LanguageEditing from '../src/languageediting';
import LanguageUI from '../src/languageui';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'LanguageUI', () => {
	let editor, editorElement, dropdown;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ LanguageUI, LanguageEditing, Paragraph ],
				toolbar: [ 'language' ]
			} )
			.then( newEditor => {
				editor = newEditor;
				dropdown = editor.ui.componentFactory.create( 'language' );

				// Set data so the commands will be enabled.
				setData( editor.model, '<paragraph>[foo]</paragraph>' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'init()', () => {
		it( 'should register options feature component', () => {
			const dropdown = editor.ui.componentFactory.create( 'language' );

			expect( dropdown ).to.be.instanceOf( DropdownView );
			expect( dropdown.buttonView.isEnabled ).to.be.true;
			expect( dropdown.buttonView.isOn ).to.be.false;
			expect( dropdown.buttonView.label ).to.equal( 'Choose language' );
			expect( dropdown.buttonView.tooltip ).to.equal( 'Language' );
		} );

		it( 'should execute language command on model (no language selected)', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );
			const dropdown = editor.ui.componentFactory.create( 'language' );

			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'language',
				{ languageCode: undefined, textDirection: undefined } );
		} );

		it( 'should execute language command on model (language selected)', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );
			const dropdown = editor.ui.componentFactory.create( 'language' );

			dropdown.languageCode = 'fr';
			dropdown.textDirection = 'ltr';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'language',
				{ languageCode: 'fr', textDirection: 'ltr' } );
		} );

		it( 'should focus view after command execution', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const dropdown = editor.ui.componentFactory.create( 'language' );

			dropdown.languageCode = 'fr';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( focusSpy );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			const dropdown = editor.ui.componentFactory.create( 'language' );

			dropdown.render();

			expect( dropdown.element.classList.contains( 'ck-language-dropdown' ) ).to.be.true;
		} );

		describe( 'model to command binding', () => {
			let command;

			beforeEach( () => {
				command = editor.commands.get( 'language' );
			} );

			it( 'isEnabled', () => {
				command.isEnabled = false;

				expect( dropdown.buttonView.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( dropdown.buttonView.isEnabled ).to.be.true;

				command.isEnabled = false;
				expect( dropdown.buttonView.isEnabled ).to.be.false;
			} );

			it( 'label', () => {
				command.value = false;

				expect( dropdown.buttonView.label ).to.equal( 'Choose language' );

				command.value = 'fr:ltr';
				expect( dropdown.buttonView.label ).to.equal( 'French' );

				command.value = 'ar:rtl';
				expect( dropdown.buttonView.label ).to.equal( 'Arabic' );
			} );
		} );

		describe( 'localization', () => {
			let command, editor, dropdown;

			before( () => {
				addTranslations( 'en', {
					'Choose language': 'Choose language',
					'Language': 'Language',
					'Hebrew': 'Hebrew',
					'Polish': 'Polish',
					'Remove language': 'Remove language'
				} );

				addTranslations( 'pl', {
					'Choose language': 'Wybierz język',
					'Language': 'Język',
					'Hebrew': 'Hebrajski',
					'Polish': 'Polski',
					'Remove language': 'Usuń język'
				} );
			} );

			after( () => {
				clearTranslations();
			} );

			beforeEach( () => {
				return localizedEditor( [
					{ title: 'Hebrew', languageCode: 'he' },
					{ title: 'Polish', languageCode: 'pl' }
				] );
			} );

			it( 'does not alter the original config', () => {
				expect( editor.config.get( 'languageList.options' ) ).to.deep.equal( [
					{ title: 'Hebrew', languageCode: 'he' },
					{ title: 'Polish', languageCode: 'pl' }
				] );
			} );

			it( 'works for the #buttonView', () => {
				const buttonView = dropdown.buttonView;

				expect( buttonView.label ).to.equal( 'Wybierz język' );
				expect( buttonView.tooltip ).to.equal( 'Język' );

				command.value = 'he:rtl';
				expect( buttonView.label ).to.equal( 'Hebrajski' );
			} );

			it( 'works for the listView#items in the panel', () => {
				const listView = dropdown.listView;

				expect( getListViewItems( listView ).map( item => item.children.first.label ) ).to.deep.equal( [
					'Hebrajski',
					'Polski',
					'Usuń język'
				] );
			} );

			it( 'allows custom titles', () => {
				return localizedEditor( [
					{ title: 'He', languageCode: 'he' },
					{ title: 'Pl', languageCode: 'pl' }
				] ).then( () => {
					const listView = dropdown.listView;

					expect( getListViewItems( listView ).map( item => item.children.first.label ) ).to.deep.equal( [
						'He',
						'Pl',
						'Usuń język'
					] );
				} );
			} );

			function localizedEditor( options ) {
				const editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ LanguageEditing, LanguageUI ],
						toolbar: [ 'language' ],
						language: 'pl',
						languageList: {
							options
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						dropdown = editor.ui.componentFactory.create( 'language' );
						command = editor.commands.get( 'language' );

						editorElement.remove();

						return editor.destroy();
					} );
			}
		} );

		describe( 'class', () => {
			it( 'is set for the listView#items in the panel', () => {
				const listView = dropdown.listView;

				expect( getListViewItems( listView ).map( item => item.children.first.class ) ).to.deep.equal( [
					'ck-language_ar',
					'ck-language_fr',
					'ck-language_es',
					'ck-language_remove'
				] );
			} );

			it( 'reflects the #value of the commands', () => {
				const listView = dropdown.listView;

				setData( editor.model, '<paragraph>[<$text language="fr:ltr">te]xt</$text></paragraph>' );

				expect( getListViewItems( listView ).map( item => item.children.first.isOn ) ).to.deep.equal( [
					false,
					true,
					false,
					false
				] );
			} );
		} );
	} );
} );

function getListViewItems( listView ) {
	// Let's drop separator.
	return listView.items.filter( item => item.children );
}
