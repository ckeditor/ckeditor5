/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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

testUtils.createSinonSandbox();

describe( 'HeadingUI', () => {
	let editor, editorElement, dropdown;

	before( () => {
		addTranslations( 'en', {
			'Choose heading': 'Choose heading',
			'Paragraph': 'Paragraph',
			'Heading': 'Heading',
			'Heading 1': 'Heading 1',
			'Heading 2': 'Heading 2',
		} );

		addTranslations( 'pl', {
			'Choose heading': 'Wybierz nagłówek',
			'Paragraph': 'Akapit',
			'Heading': 'Nagłówek',
			'Heading 1': 'Nagłówek 1',
			'Heading 2': 'Nagłówek 2',
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

		it( 'should execute format command on model execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );
			const dropdown = editor.ui.componentFactory.create( 'heading' );

			dropdown.commandName = 'paragraph';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'paragraph' );
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
			let commands;

			beforeEach( () => {
				commands = {};

				editor.config.get( 'heading.options' ).forEach( ( { model } ) => {
					commands[ model ] = editor.commands.get( model );
				} );
			} );

			it( 'isEnabled', () => {
				for ( const name in commands ) {
					commands[ name ].isEnabled = false;
				}

				expect( dropdown.buttonView.isEnabled ).to.be.false;

				commands.heading2.isEnabled = true;
				expect( dropdown.buttonView.isEnabled ).to.be.true;
			} );

			it( 'label', () => {
				for ( const name in commands ) {
					commands[ name ].value = false;
				}

				expect( dropdown.buttonView.label ).to.equal( 'Choose heading' );

				commands.heading2.value = true;
				expect( dropdown.buttonView.label ).to.equal( 'Heading 2' );
			} );
		} );

		describe( 'localization', () => {
			let commands, editor, dropdown;

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
				commands.paragraph.value = false;
				expect( buttonView.label ).to.equal( 'Wybierz nagłówek' );
				expect( buttonView.tooltip ).to.equal( 'Nagłówek' );

				commands.paragraph.value = true;
				expect( buttonView.label ).to.equal( 'Akapit' );

				commands.paragraph.value = false;
				commands.heading1.value = true;
				expect( buttonView.label ).to.equal( 'Nagłówek 1' );
			} );

			it( 'works for the listView#items in the panel', () => {
				const listView = dropdown.listView;

				expect( listView.items.map( item => item.label ) ).to.deep.equal( [
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

					expect( listView.items.map( item => item.label ) ).to.deep.equal( [
						'Custom paragraph title',
						'Custom heading1 title',
					] );
				} );
			} );

			it( 'translates default using the the locale', () => {
				return localizedEditor( [
					{ model: 'paragraph', title: 'Paragraph' }
				] ).then( () => {
					const listView = dropdown.listView;

					expect( listView.items.map( item => item.label ) ).to.deep.equal( [
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
						commands = {};

						editor.config.get( 'heading.options' ).forEach( ( { model } ) => {
							commands[ model ] = editor.commands.get( model );
						} );

						editorElement.remove();

						return editor.destroy();
					} );
			}
		} );

		describe( 'class', () => {
			it( 'is set for the listView#items in the panel', () => {
				const listView = dropdown.listView;

				expect( listView.items.map( item => item.class ) ).to.deep.equal( [
					'ck-heading_paragraph',
					'ck-heading_heading1',
					'ck-heading_heading2',
					'ck-heading_heading3'
				] );
			} );

			it( 'reflects the #value of the commands', () => {
				const listView = dropdown.listView;

				setData( editor.model, '<heading2>f{}oo</heading2>' );

				expect( listView.items.map( item => item.isActive ) ).to.deep.equal( [
					false,
					false,
					true,
					false
				] );
			} );
		} );
	} );
} );
