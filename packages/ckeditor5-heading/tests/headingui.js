/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Heading from '../src/heading.js';
import HeadingEditing from '../src/headingediting.js';
import HeadingUI from '../src/headingui.js';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview.js';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { MenuBarMenuListItemView, MenuBarMenuView } from '@ckeditor/ckeditor5-ui';

describe( 'HeadingUI', () => {
	let editor, editorElement;

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

				// Set data so the commands will be enabled.
				setData( editor.model, '<paragraph>f{}oo</paragraph>' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'init()', () => {
		describe( 'toolbar dropdown', () => {
			let dropdown;

			beforeEach( () => {
				dropdown = editor.ui.componentFactory.create( 'heading' );
			} );

			afterEach( () => {
				dropdown.destroy();
			} );

			it( 'should register options feature component', () => {
				expect( dropdown ).to.be.instanceOf( DropdownView );
				expect( dropdown.buttonView.isEnabled ).to.be.true;
				expect( dropdown.buttonView.isOn ).to.be.false;
				expect( dropdown.buttonView.label ).to.equal( 'Paragraph' );
				expect( dropdown.buttonView.tooltip ).to.equal( 'Heading' );
				expect( dropdown.buttonView.ariaLabel ).to.equal( 'Paragraph, Heading' );
				expect( dropdown.buttonView.ariaLabelledBy ).to.be.undefined;
			} );

			it( 'should execute format command on model execute event for paragraph', () => {
				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				dropdown.commandName = 'paragraph';
				dropdown.fire( 'execute' );

				sinon.assert.calledOnce( executeSpy );
				sinon.assert.calledWithExactly( executeSpy, 'paragraph', undefined );
			} );

			it( 'should execute format command on model execute event for heading', () => {
				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				dropdown.commandName = 'heading';
				dropdown.commandValue = 'heading1';
				dropdown.fire( 'execute' );

				sinon.assert.calledOnce( executeSpy );
				sinon.assert.calledWithExactly( executeSpy, 'heading', { value: 'heading1' } );
			} );

			it( 'should focus view after command execution', () => {
				const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				dropdown.commandName = 'paragraph';
				dropdown.fire( 'execute' );

				sinon.assert.calledOnce( focusSpy );
			} );

			it( 'should add custom CSS class to dropdown', () => {
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

				it( 'label when heading and paragraph commands active', () => {
					command.value = 'heading2';
					paragraphCommand.value = true;

					expect( dropdown.buttonView.label ).to.equal( 'Paragraph' );
				} );

				it( 'ariaLabel', () => {
					command.value = false;
					paragraphCommand.value = false;

					expect( dropdown.buttonView.ariaLabel ).to.equal( 'Heading' );

					command.value = 'heading2';
					expect( dropdown.buttonView.ariaLabel ).to.equal( 'Heading 2, Heading' );
					command.value = false;

					paragraphCommand.value = true;
					expect( dropdown.buttonView.ariaLabel ).to.equal( 'Paragraph, Heading' );
				} );

				it( 'ariaLabel when heading and paragraph commands active', () => {
					command.value = 'heading2';
					paragraphCommand.value = true;

					expect( dropdown.buttonView.ariaLabel ).to.equal( 'Paragraph, Heading' );
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

				it( 'display default title if none of the commands is active', () => {
					return localizedEditor( [] ).then( () => {
						expect( dropdown.buttonView.label ).to.equal( 'Wybierz nagłówek' );
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

							// Trigger lazy init.
							dropdown.isOpen = true;

							editorElement.remove();

							return editor.destroy();
						} );
				}
			} );

			describe( 'class', () => {
				it( 'is set for the listView#items in the panel', () => {
					// Trigger lazy init.
					dropdown.isOpen = true;

					const listView = dropdown.listView;

					expect( listView.items.map( item => item.children.first.class ) ).to.deep.equal( [
						'ck-heading_paragraph',
						'ck-heading_heading1',
						'ck-heading_heading2',
						'ck-heading_heading3'
					] );
				} );

				it( 'reflects the #value of the commands', () => {
					// Trigger lazy init.
					dropdown.isOpen = true;

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

			describe( 'listview', () => {
				it( 'should have properties set', () => {
					// Trigger lazy init.
					dropdown.isOpen = true;

					const listView = dropdown.listView;

					expect( listView.element.role ).to.equal( 'menu' );
					expect( listView.element.ariaLabel ).to.equal( 'Heading' );
				} );
			} );
		} );

		describe( 'menu bar menu', () => {
			let menuView, command, paragraphCommand;

			beforeEach( () => {
				menuView = editor.ui.componentFactory.create( 'menuBar:heading' );
				command = editor.commands.get( 'heading' );
				paragraphCommand = editor.commands.get( 'paragraph' );
				menuView.isOpen = true;
			} );

			afterEach( () => {
				menuView.destroy();
			} );

			it( 'should be created', () => {
				expect( menuView ).to.be.instanceof( MenuBarMenuView );
			} );

			it( 'should have correct property values set on various components', () => {
				expect( menuView.class ).to.equal( 'ck-heading-dropdown' );
				expect( menuView.buttonView.label ).to.equal( 'Heading' );
				expect( menuView.panelView.children.first.role ).to.equal( 'menu' );
				expect( menuView.panelView.children.first.ariaLabel ).to.equal( 'Heading' );
			} );

			it( 'should set correct button attributes', () => {
				expect( dumpItems( 'role' ) ).to.have.deep.ordered.members( [
					[ 'Paragraph', 'menuitemradio' ],
					[ 'Heading 1', 'menuitemradio' ],
					[ 'Heading 2', 'menuitemradio' ],
					[ 'Heading 3', 'menuitemradio' ]
				] );

				expect( dumpItems( 'class' ) ).to.have.deep.ordered.members( [
					[ 'Paragraph', 'ck-heading_paragraph' ],
					[ 'Heading 1', 'ck-heading_heading1' ],
					[ 'Heading 2', 'ck-heading_heading2' ],
					[ 'Heading 3', 'ck-heading_heading3' ]
				] );
			} );

			it( 'should bind #isOn to the value of the command', () => {
				command.value = 'heading2';
				paragraphCommand.value = false;

				expect( dumpItems( 'isOn' ) ).to.have.deep.ordered.members( [
					[ 'Paragraph', false ],
					[ 'Heading 1', false ],
					[ 'Heading 2', true ],
					[ 'Heading 3', false ]
				] );

				command.value = false;
				paragraphCommand.value = true;

				expect( dumpItems( 'isOn' ) ).to.have.deep.ordered.members( [
					[ 'Paragraph', true ],
					[ 'Heading 1', false ],
					[ 'Heading 2', false ],
					[ 'Heading 3', false ]
				] );
			} );

			it( 'should bind `aria-checked` element attribute to #isOn', () => {
				command.value = 'heading2';
				paragraphCommand.value = false;

				expect( dumpItems( item => item.element.getAttribute( 'aria-checked' ) ) ).to.have.deep.ordered.members( [
					[ 'Paragraph', 'false' ],
					[ 'Heading 1', 'false' ],
					[ 'Heading 2', 'true' ],
					[ 'Heading 3', 'false' ]
				] );

				command.value = false;
				paragraphCommand.value = true;

				expect( dumpItems( item => item.element.getAttribute( 'aria-checked' ) ) ).to.have.deep.ordered.members( [
					[ 'Paragraph', 'true' ],
					[ 'Heading 1', 'false' ],
					[ 'Heading 2', 'false' ],
					[ 'Heading 3', 'false' ]
				] );
			} );

			it( 'should execute editor command and focus editing view upon #execute', () => {
				const execSpy = sinon.spy( editor, 'execute' );
				const focusSpy = sinon.spy( editor.editing.view, 'focus' );

				// Paragraph.
				menuView.panelView.children.first.items.first.children.first.fire( 'execute' );

				sinon.assert.calledOnceWithExactly( execSpy, 'paragraph', { value: 'paragraph' } );
				sinon.assert.calledOnce( focusSpy );
				sinon.assert.callOrder( execSpy, focusSpy );

				// Heading.
				menuView.panelView.children.first.items.last.children.first.fire( 'execute' );

				sinon.assert.calledWithExactly( execSpy.secondCall, 'heading', { value: 'heading3' } );
				sinon.assert.calledTwice( focusSpy );
			} );

			it( 'should be disabled if all related commands are disabled', () => {
				expect( menuView.isEnabled ).to.be.true;

				command.forceDisabled( 'foo' );
				expect( menuView.isEnabled ).to.be.true;

				paragraphCommand.forceDisabled( 'foo' );
				expect( menuView.isEnabled ).to.be.false;
			} );

			function dumpItems( propertyName ) {
				return Array.from( menuView.panelView.children.first.items )
					.filter( item => item instanceof MenuBarMenuListItemView )
					.map( item => [
						item.children.first.label,
						typeof propertyName == 'function' ? propertyName( item.children.first ) : item.children.first[ propertyName ]
					] );
			}
		} );
	} );
} );
