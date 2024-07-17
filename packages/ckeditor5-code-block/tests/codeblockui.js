/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import CodeBlockEditing from '../src/codeblockediting.js';
import CodeBlockUI from '../src/codeblockui.js';

import { icons } from 'ckeditor5/src/core.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { _clear as clearTranslations, add as addTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service.js';

describe( 'CodeBlockUI', () => {
	let editor, command, element, languagesListView;

	before( () => {
		addTranslations( 'en', {
			'Plain text': 'Plain text'
		} );

		addTranslations( 'pl', {
			'Plain text': 'Zwykły tekst'
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

	describe( 'toolbar', () => {
		let button;

		beforeEach( () => {
			const dropdown = editor.ui.componentFactory.create( 'codeBlock' );
			button = dropdown.buttonView;
			dropdown.isOpen = true;
			languagesListView = dropdown.listView;
		} );

		it( 'should execute the command with the "usePreviousLanguageChoice" option set to "true"', () => {
			const executeSpy = sinon.stub( editor, 'execute' );
			const focusSpy = sinon.stub( editor.editing.view, 'focus' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledOnce( focusSpy );
			sinon.assert.calledWithExactly( executeSpy.firstCall, 'codeBlock', {
				usePreviousLanguageChoice: true
			} );
		} );

		it( 'has the base properties', () => {
			expect( button ).to.have.property( 'label', 'Insert code block' );
			expect( button ).to.have.property( 'icon', icons.codeBlock );
			expect( button ).to.have.property( 'tooltip', true );
			expect( button ).to.have.property( 'isToggleable', true );
		} );

		it( 'has #isOn bound to command\'s value', () => {
			command.value = false;
			expect( button ).to.have.property( 'isOn', false );

			command.value = true;
			expect( button ).to.have.property( 'isOn', true );
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
						expect( dropdown.listView ).to.be.undefined;

						// Trigger list view creation (lazy init).
						dropdown.isOpen = true;

						const listView = dropdown.listView;

						expect( listView.items.first.children.first.label ).to.equal( 'Zwykły tekst' );

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
			expect( subMenu.buttonView.role ).to.be.equal( 'menuitem' );
		} );

		it( 'sets item\'s aria-checked attribute depending on the value of the CodeBlockCommand', () => {
			const { element } = languagesListView.items.get( 2 ).children.first;

			expect( element.getAttribute( 'aria-checked' ) ).to.be.equal( 'false' );

			command.value = 'cs';

			expect( element.getAttribute( 'aria-checked' ) ).to.be.equal( 'true' );
		} );

		it( 'has isEnabled bound to command\'s isEnabled', () => {
			command.isEnabled = true;
			expect( subMenu ).to.have.property( 'isEnabled', true );

			command.isEnabled = false;
			expect( subMenu ).to.have.property( 'isEnabled', false );
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

						expect( listView.items.first.children.first.label ).to.equal( 'Zwykły tekst' );

						return editor.destroy();
					} );
			} );

			it( 'executes the command with forceValue=false when codeblock already has selected language set', () => {
				const executeSpy = sinon.stub( editor, 'execute' );
				const focusSpy = sinon.stub( editor.editing.view, 'focus' );
				const cSharpButton = languagesListView.items.get( 2 ).children.first;

				command.value = 'cs';

				expect( cSharpButton.label ).to.equal( 'C#' );
				cSharpButton.fire( 'execute' );

				sinon.assert.calledOnce( executeSpy );
				sinon.assert.calledOnce( focusSpy );
				sinon.assert.calledWithExactly( executeSpy.firstCall, 'codeBlock', {
					language: 'cs',
					forceValue: false
				} );
			} );
		} );
	} );

	describe( 'codeBlock dropdown', () => {
		it( 'has #class set', () => {
			const dropdown = editor.ui.componentFactory.create( 'codeBlock' );

			expect( dropdown.class ).to.equal( 'ck-code-block-dropdown' );
		} );

		it( 'has isEnabled bound to command\'s isEnabled', () => {
			const dropdown = editor.ui.componentFactory.create( 'codeBlock' );

			command.isEnabled = true;
			expect( dropdown ).to.have.property( 'isEnabled', true );

			command.isEnabled = false;
			expect( dropdown ).to.have.property( 'isEnabled', false );
		} );
	} );

	function testLanguagesList() {
		it( 'corresponds to the config', () => {
			expect( languagesListView.items
				.map( item => {
					const { label, withText } = item.children.first;

					return { label, withText };
				} ) )
				.to.deep.equal( [
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
			expect( languagesListView.items.get( 2 ).children.first.isOn ).to.be.false;

			command.value = 'cs';
			expect( languagesListView.items.get( 2 ).children.first.isOn ).to.be.true;
		} );

		it( 'should have properties set', () => {
			expect( languagesListView.element.role ).to.equal( 'menu' );
			expect( languagesListView.element.ariaLabel ).to.equal( 'Insert code block' );
		} );

		it( 'executes the command when executed one of the available language buttons from the list', () => {
			const executeSpy = sinon.stub( editor, 'execute' );
			const focusSpy = sinon.stub( editor.editing.view, 'focus' );
			const cSharpButton = languagesListView.items.get( 2 ).children.first;

			expect( cSharpButton.label ).to.equal( 'C#' );
			cSharpButton.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledOnce( focusSpy );
			sinon.assert.calledWithExactly( executeSpy.firstCall, 'codeBlock', {
				language: 'cs',
				forceValue: true
			} );
		} );
	}
} );
