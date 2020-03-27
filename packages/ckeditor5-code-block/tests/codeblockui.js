/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import CodeBlockEditing from '../src/codeblockediting';
import CodeBlockUI from '../src/codeblockui';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import codeBlockIcon from '../theme/icons/codeblock.svg';
import { _clear as clearTranslations, add as addTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';

describe( 'CodeBlockUI', () => {
	let editor, command, element;

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

		it( 'executes the command when executed one of the available language buttons from the list', () => {
			const dropdown = editor.ui.componentFactory.create( 'codeBlock' );
			const executeSpy = sinon.stub( editor, 'execute' );
			const focusSpy = sinon.stub( editor.editing.view, 'focus' );
			const listView = dropdown.panelView.children.first;
			const cSharpButton = listView.items.get( 2 ).children.first;

			expect( cSharpButton.label ).to.equal( 'C#' );
			cSharpButton.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledOnce( focusSpy );
			sinon.assert.calledWithExactly( executeSpy.firstCall, 'codeBlock', {
				language: 'cs',
				forceValue: true
			} );
		} );

		describe( 'language list', () => {
			it( 'corresponds to the config', () => {
				const dropdown = editor.ui.componentFactory.create( 'codeBlock' );
				const listView = dropdown.panelView.children.first;

				expect( listView.items
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
				const dropdown = editor.ui.componentFactory.create( 'codeBlock' );
				const listView = dropdown.panelView.children.first;

				expect( listView.items.get( 2 ).children.first.isOn ).to.be.false;

				command.value = 'cs';
				expect( listView.items.get( 2 ).children.first.isOn ).to.be.true;
			} );

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
						const listView = dropdown.panelView.children.first;

						expect( listView.items.first.children.first.label ).to.equal( 'Zwykły tekst' );

						return editor.destroy();
					} );
			} );
		} );

		describe( 'button', () => {
			it( 'has the base properties', () => {
				const dropdown = editor.ui.componentFactory.create( 'codeBlock' );
				const button = dropdown.buttonView;

				expect( button ).to.have.property( 'label', 'Insert code block' );
				expect( button ).to.have.property( 'icon', codeBlockIcon );
				expect( button ).to.have.property( 'tooltip', true );
				expect( button ).to.have.property( 'isToggleable', true );
			} );

			it( 'has #isOn bound to command\'s value', () => {
				const dropdown = editor.ui.componentFactory.create( 'codeBlock' );
				const button = dropdown.buttonView;

				command.value = false;
				expect( button ).to.have.property( 'isOn', false );

				command.value = true;
				expect( button ).to.have.property( 'isOn', true );
			} );

			it( 'should execute the command with the first configured language', () => {
				const dropdown = editor.ui.componentFactory.create( 'codeBlock' );
				const button = dropdown.buttonView;
				const executeSpy = sinon.stub( editor, 'execute' );
				const focusSpy = sinon.stub( editor.editing.view, 'focus' );

				button.fire( 'execute' );

				sinon.assert.calledOnce( executeSpy );
				sinon.assert.calledOnce( focusSpy );
				sinon.assert.calledWithExactly( executeSpy.firstCall, 'codeBlock', {
					language: 'plaintext'
				} );
			} );
		} );
	} );
} );
