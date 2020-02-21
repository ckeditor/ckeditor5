/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Heading from '../src/heading';
import HeadingEditing from '../src/headingediting';
import HeadingUI from '../src/headingui';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'HeadingUI', () => {
	let editor, editorElement, dropdown;

	testUtils.createSinonSandbox();

	before( () => {
		addTranslations( 'en', {
			'Choose heading': 'Choose heading',
			'Paragraph': 'Paragraph',
			'Heading': 'Heading',
			'Heading 1': 'Heading 1',
			'Heading 2': 'Heading 2'
		} );

		addTranslations( 'pl', {
			'Choose heading': 'Wybierz nagłówek',
			'Paragraph': 'Akapit',
			'Heading': 'Nagłówek',
			'Heading 1': 'Nagłówek 1',
			'Heading 2': 'Nagłówek 2'
		} );
	} );

	after( () => {
		clearTranslations();
	} );

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ HeadingUI, HeadingEditing ],
				toolbar: [ 'heading' ]
			} )
			.then( newEditor => {
				editor = newEditor;
				dropdown = editor.ui.componentFactory.create( 'heading' );

				// Set data so the commands will be enabled.
				setData( editor.model, '<paragraph>f{}oo</paragraph>' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'init()', () => {
		it( 'should register options feature component', () => {
			const dropdown = editor.ui.componentFactory.create( 'heading' );

			expect( dropdown ).to.be.instanceOf( DropdownView );
			expect( dropdown.buttonView.isEnabled ).to.be.true;
			expect( dropdown.buttonView.isOn ).to.be.false;
			expect( dropdown.buttonView.label ).to.equal( 'Paragraph' );
			expect( dropdown.buttonView.tooltip ).to.equal( 'Heading' );
		} );

		it( 'should execute format command on model execute event for paragraph', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );
			const dropdown = editor.ui.componentFactory.create( 'heading' );

			dropdown.commandName = 'paragraph';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'paragraph', undefined );
		} );

		it( 'should execute format command on model execute event for heading', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );
			const dropdown = editor.ui.componentFactory.create( 'heading' );

			dropdown.commandName = 'heading';
			dropdown.commandValue = 'heading1';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'heading', { value: 'heading1' } );
		} );

		it( 'should focus view after command execution', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const dropdown = editor.ui.componentFactory.create( 'heading' );

			dropdown.commandName = 'paragraph';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( focusSpy );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			const dropdown = editor.ui.componentFactory.create( 'heading' );

			dropdown.render();

			expect( dropdown.element.classList.contains( 'ck-heading-dropdown' ) ).to.be.true;
		} );

		describe( 'model to command binding', () => {
			let command, paragraphCommand;

			beforeEach( () => {
				command = editor.commands.get( 'heading' );
				paragraphCommand = editor.commands.get( 'paragraph' );
			} );

			it( 'isEnabled', () => {
				command.isEnabled = false;
				paragraphCommand.isEnabled = false;

				expect( dropdown.buttonView.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( dropdown.buttonView.isEnabled ).to.be.true;

				command.isEnabled = false;
				expect( dropdown.buttonView.isEnabled ).to.be.false;

				paragraphCommand.isEnabled = true;
				expect( dropdown.buttonView.isEnabled ).to.be.true;
			} );

			it( 'label', () => {
				command.value = false;
				paragraphCommand.value = false;

				expect( dropdown.buttonView.label ).to.equal( 'Choose heading' );

				command.value = 'heading2';
				expect( dropdown.buttonView.label ).to.equal( 'Heading 2' );
				command.value = false;

				paragraphCommand.value = true;
				expect( dropdown.buttonView.label ).to.equal( 'Paragraph' );
			} );
		} );

		describe( 'localization', () => {
			let command, paragraphCommand, editor, dropdown;

			beforeEach( () => {
				return localizedEditor( [
					{ model: 'paragraph', title: 'Paragraph' },
					{ model: 'heading1', view: { name: 'h2' }, title: 'Heading 1' },
					{ model: 'heading2', view: { name: 'h3' }, title: 'Heading 2' }
				] );
			} );

			it( 'does not alter the original config', () => {
				expect( editor.config.get( 'heading.options' ) ).to.deep.equal( [
					{ model: 'paragraph', title: 'Paragraph' },
					{ model: 'heading1', view: { name: 'h2' }, title: 'Heading 1' },
					{ model: 'heading2', view: { name: 'h3' }, title: 'Heading 2' }
				] );
			} );

			it( 'works for the #buttonView', () => {
				const buttonView = dropdown.buttonView;

				// Setting manually paragraph.value to `false` because there might be some content in editor
				// after initialisation (for example empty <p></p> inserted when editor is empty).
				paragraphCommand.value = false;
				expect( buttonView.label ).to.equal( 'Wybierz nagłówek' );
				expect( buttonView.tooltip ).to.equal( 'Nagłówek' );

				paragraphCommand.value = true;
				expect( buttonView.label ).to.equal( 'Akapit' );

				paragraphCommand.value = false;
				command.value = 'heading1';
				expect( buttonView.label ).to.equal( 'Nagłówek 1' );
			} );

			it( 'works for the listView#items in the panel', () => {
				const listView = dropdown.listView;

				expect( listView.items.map( item => item.children.first.label ) ).to.deep.equal( [
					'Akapit',
					'Nagłówek 1',
					'Nagłówek 2'
				] );
			} );

			it( 'allows custom titles', () => {
				return localizedEditor( [
					{ model: 'paragraph', title: 'Custom paragraph title' },
					{ model: 'heading1', view: { name: 'h1' }, title: 'Custom heading1 title' }
				] ).then( () => {
					const listView = dropdown.listView;

					expect( listView.items.map( item => item.children.first.label ) ).to.deep.equal( [
						'Custom paragraph title',
						'Custom heading1 title'
					] );
				} );
			} );

			it( 'translates default using the the locale', () => {
				return localizedEditor( [
					{ model: 'paragraph', title: 'Paragraph' }
				] ).then( () => {
					const listView = dropdown.listView;

					expect( listView.items.map( item => item.children.first.label ) ).to.deep.equal( [
						'Akapit'
					] );
				} );
			} );

			function localizedEditor( options ) {
				const editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ Heading ],
						toolbar: [ 'heading' ],
						language: 'pl',
						heading: {
							options
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						dropdown = editor.ui.componentFactory.create( 'heading' );
						command = editor.commands.get( 'heading' );
						paragraphCommand = editor.commands.get( 'paragraph' );

						editorElement.remove();

						return editor.destroy();
					} );
			}
		} );

		describe( 'class', () => {
			it( 'is set for the listView#items in the panel', () => {
				const listView = dropdown.listView;

				expect( listView.items.map( item => item.children.first.class ) ).to.deep.equal( [
					'ck-heading_paragraph',
					'ck-heading_heading1',
					'ck-heading_heading2',
					'ck-heading_heading3'
				] );
			} );

			it( 'reflects the #value of the commands', () => {
				const listView = dropdown.listView;

				setData( editor.model, '<heading2>f{}oo</heading2>' );

				expect( listView.items.map( item => item.children.first.isOn ) ).to.deep.equal( [
					false,
					false,
					true,
					false
				] );
			} );
		} );
	} );
} );
