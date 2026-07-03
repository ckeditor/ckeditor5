/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Heading } from '../src/heading.js';
import { HeadingEditing } from '../src/headingediting.js';
import { HeadingUI } from '../src/headingui.js';
import { DropdownView, MenuBarMenuListItemView, MenuBarMenuView } from '@ckeditor/ckeditor5-ui';
import { add as addTranslations, _clearTranslations } from '@ckeditor/ckeditor5-utils';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

describe( 'HeadingUI', () => {
	let editor, editorElement;

	beforeAll( () => {
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

	afterAll( () => {
		_clearTranslations();
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
				_setModelData( editor.model, '<paragraph>f{}oo</paragraph>' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HeadingUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( HeadingUI.isPremiumPlugin ).toBe( false );
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
				expect( dropdown ).toBeInstanceOf( DropdownView );
				expect( dropdown.buttonView.isEnabled ).toBe( true );
				expect( dropdown.buttonView.isOn ).toBe( false );
				expect( dropdown.buttonView.label ).toEqual( 'Paragraph' );
				expect( dropdown.buttonView.tooltip ).toEqual( 'Heading' );
				expect( dropdown.buttonView.ariaLabel ).toEqual( 'Paragraph, Heading' );
				expect( dropdown.buttonView.ariaLabelledBy ).toBeUndefined();
			} );

			it( 'should execute format command on model execute event for paragraph', () => {
				const executeSpy = vi.spyOn( editor, 'execute' );

				dropdown.commandName = 'paragraph';
				dropdown.fire( 'execute' );

				expect( executeSpy ).toHaveBeenCalledOnce();
				expect( executeSpy ).toHaveBeenCalledWith( 'paragraph', undefined );
			} );

			it( 'should execute format command on model execute event for heading', () => {
				const executeSpy = vi.spyOn( editor, 'execute' );

				dropdown.commandName = 'heading';
				dropdown.commandValue = 'heading1';
				dropdown.fire( 'execute' );

				expect( executeSpy ).toHaveBeenCalledOnce();
				expect( executeSpy ).toHaveBeenCalledWith( 'heading', { value: 'heading1' } );
			} );

			it( 'should focus view after command execution', () => {
				const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

				dropdown.commandName = 'paragraph';
				dropdown.fire( 'execute' );

				expect( focusSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should add custom CSS class to dropdown', () => {
				dropdown.render();

				expect( dropdown.element.classList.contains( 'ck-heading-dropdown' ) ).toBe( true );
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

					expect( dropdown.buttonView.isEnabled ).toBe( false );

					command.isEnabled = true;
					expect( dropdown.buttonView.isEnabled ).toBe( true );

					command.isEnabled = false;
					expect( dropdown.buttonView.isEnabled ).toBe( false );

					paragraphCommand.isEnabled = true;
					expect( dropdown.buttonView.isEnabled ).toBe( true );
				} );

				it( 'label', () => {
					command.value = false;
					paragraphCommand.value = false;

					expect( dropdown.buttonView.label ).toEqual( 'Choose heading' );

					command.value = 'heading2';
					expect( dropdown.buttonView.label ).toEqual( 'Heading 2' );
					command.value = false;

					paragraphCommand.value = true;
					expect( dropdown.buttonView.label ).toEqual( 'Paragraph' );
				} );

				it( 'label when heading and paragraph commands active', () => {
					command.value = 'heading2';
					paragraphCommand.value = true;

					expect( dropdown.buttonView.label ).toEqual( 'Paragraph' );
				} );

				it( 'ariaLabel', () => {
					command.value = false;
					paragraphCommand.value = false;

					expect( dropdown.buttonView.ariaLabel ).toEqual( 'Heading' );

					command.value = 'heading2';
					expect( dropdown.buttonView.ariaLabel ).toEqual( 'Heading 2, Heading' );
					command.value = false;

					paragraphCommand.value = true;
					expect( dropdown.buttonView.ariaLabel ).toEqual( 'Paragraph, Heading' );
				} );

				it( 'ariaLabel when heading and paragraph commands active', () => {
					command.value = 'heading2';
					paragraphCommand.value = true;

					expect( dropdown.buttonView.ariaLabel ).toEqual( 'Paragraph, Heading' );
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
					expect( editor.config.get( 'heading.options' ) ).toEqual( [
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
					expect( buttonView.label ).toEqual( 'Wybierz nagłówek' );
					expect( buttonView.tooltip ).toEqual( 'Nagłówek' );

					paragraphCommand.value = true;
					expect( buttonView.label ).toEqual( 'Akapit' );

					paragraphCommand.value = false;
					command.value = 'heading1';
					expect( buttonView.label ).toEqual( 'Nagłówek 1' );
				} );

				it( 'works for the listView#items in the panel', () => {
					const listView = dropdown.listView;

					expect( listView.items.map( item => item.children.first.label ) ).toEqual( [
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

						expect( listView.items.map( item => item.children.first.label ) ).toEqual( [
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

						expect( listView.items.map( item => item.children.first.label ) ).toEqual( [
							'Akapit'
						] );
					} );
				} );

				it( 'display default title if none of the commands is active', () => {
					return localizedEditor( [] ).then( () => {
						expect( dropdown.buttonView.label ).toEqual( 'Wybierz nagłówek' );
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

					expect( listView.items.map( item => item.children.first.class ) ).toEqual( [
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

					_setModelData( editor.model, '<heading2>f{}oo</heading2>' );

					expect( listView.items.map( item => item.children.first.isOn ) ).toEqual( [
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

					expect( listView.element.role ).toEqual( 'menu' );
					expect( listView.element.ariaLabel ).toEqual( 'Heading' );
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
				expect( menuView ).toBeInstanceOf( MenuBarMenuView );
			} );

			it( 'should have correct property values set on various components', () => {
				expect( menuView.class ).toEqual( 'ck-heading-dropdown' );
				expect( menuView.buttonView.label ).toEqual( 'Heading' );
				expect( menuView.panelView.children.first.role ).toEqual( 'menu' );
				expect( menuView.panelView.children.first.ariaLabel ).toEqual( 'Heading' );
			} );

			it( 'should set correct button attributes', () => {
				expect( dumpItems( 'role' ) ).toEqual( [
					[ 'Paragraph', 'menuitemradio' ],
					[ 'Heading 1', 'menuitemradio' ],
					[ 'Heading 2', 'menuitemradio' ],
					[ 'Heading 3', 'menuitemradio' ]
				] );

				expect( dumpItems( 'class' ) ).toEqual( [
					[ 'Paragraph', 'ck-heading_paragraph' ],
					[ 'Heading 1', 'ck-heading_heading1' ],
					[ 'Heading 2', 'ck-heading_heading2' ],
					[ 'Heading 3', 'ck-heading_heading3' ]
				] );
			} );

			it( 'should bind #isOn to the value of the command', () => {
				command.value = 'heading2';
				paragraphCommand.value = false;

				expect( dumpItems( 'isOn' ) ).toEqual( [
					[ 'Paragraph', false ],
					[ 'Heading 1', false ],
					[ 'Heading 2', true ],
					[ 'Heading 3', false ]
				] );

				command.value = false;
				paragraphCommand.value = true;

				expect( dumpItems( 'isOn' ) ).toEqual( [
					[ 'Paragraph', true ],
					[ 'Heading 1', false ],
					[ 'Heading 2', false ],
					[ 'Heading 3', false ]
				] );
			} );

			it( 'should bind `aria-checked` element attribute to #isOn', () => {
				command.value = 'heading2';
				paragraphCommand.value = false;

				expect( dumpItems( item => item.element.getAttribute( 'aria-checked' ) ) ).toEqual( [
					[ 'Paragraph', 'false' ],
					[ 'Heading 1', 'false' ],
					[ 'Heading 2', 'true' ],
					[ 'Heading 3', 'false' ]
				] );

				command.value = false;
				paragraphCommand.value = true;

				expect( dumpItems( item => item.element.getAttribute( 'aria-checked' ) ) ).toEqual( [
					[ 'Paragraph', 'true' ],
					[ 'Heading 1', 'false' ],
					[ 'Heading 2', 'false' ],
					[ 'Heading 3', 'false' ]
				] );
			} );

			it( 'should execute editor command and focus editing view upon #execute', () => {
				const execSpy = vi.spyOn( editor, 'execute' );
				const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

				// Paragraph.
				menuView.panelView.children.first.items.first.children.first.fire( 'execute' );

				expect( execSpy ).toHaveBeenCalledOnce();
				expect( execSpy ).toHaveBeenCalledWith( 'paragraph', { value: 'paragraph' } );
				expect( focusSpy ).toHaveBeenCalledOnce();
				expect( execSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( focusSpy.mock.invocationCallOrder[ 0 ] );

				// Heading.
				menuView.panelView.children.first.items.last.children.first.fire( 'execute' );

				expect( execSpy ).toHaveBeenNthCalledWith( 2, 'heading', { value: 'heading3' } );
				expect( focusSpy ).toHaveBeenCalledTimes( 2 );
			} );

			it( 'should be disabled if all related commands are disabled', () => {
				expect( menuView.isEnabled ).toBe( true );

				command.forceDisabled( 'foo' );
				expect( menuView.isEnabled ).toBe( true );

				paragraphCommand.forceDisabled( 'foo' );
				expect( menuView.isEnabled ).toBe( false );
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
