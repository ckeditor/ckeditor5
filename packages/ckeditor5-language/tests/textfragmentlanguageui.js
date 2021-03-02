/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import TextFragmentLanguageEditing from '../src/textfragmentlanguageediting';
import TextFragmentLanguageUI from '../src/textfragmentlanguageui';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'TextFragmentLanguageUI', () => {
	let editor, editorElement, dropdown;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ TextFragmentLanguageUI, TextFragmentLanguageEditing, Paragraph ],
				toolbar: [ 'textFragmentLanguage' ]
			} )
			.then( newEditor => {
				editor = newEditor;
				dropdown = editor.ui.componentFactory.create( 'textFragmentLanguage' );

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
			const dropdown = editor.ui.componentFactory.create( 'textFragmentLanguage' );

			expect( dropdown ).to.be.instanceOf( DropdownView );
			expect( dropdown.buttonView.isEnabled ).to.be.true;
			expect( dropdown.buttonView.isOn ).to.be.false;
			expect( dropdown.buttonView.label ).to.equal( 'Choose language' );
			expect( dropdown.buttonView.tooltip ).to.equal( 'Language' );
		} );

		it( 'should execute textFragmentLanguage command on model (no language selected)', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );
			const dropdown = editor.ui.componentFactory.create( 'textFragmentLanguage' );

			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'textFragmentLanguage',
				{ languageCode: undefined, textDirection: undefined } );
		} );

		it( 'should execute textFragmentLanguage command on model (language selected)', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );
			const dropdown = editor.ui.componentFactory.create( 'textFragmentLanguage' );

			dropdown.languageCode = 'fr';
			dropdown.textDirection = 'ltr';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'textFragmentLanguage',
				{ languageCode: 'fr', textDirection: 'ltr' } );
		} );

		it( 'should focus view after command execution', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const dropdown = editor.ui.componentFactory.create( 'textFragmentLanguage' );

			dropdown.languageCode = 'fr';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( focusSpy );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			const dropdown = editor.ui.componentFactory.create( 'textFragmentLanguage' );

			dropdown.render();

			expect( dropdown.element.classList.contains( 'ck-text-fragment-language-dropdown' ) ).to.be.true;
		} );

		describe( 'model to command binding', () => {
			let command;

			beforeEach( () => {
				command = editor.commands.get( 'textFragmentLanguage' );
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

			it( 'reflects the #value of the command', () => {
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
