/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeAll, afterAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { IconMarker, IconPen, IconEraser } from '@ckeditor/ckeditor5-icons';
import { HighlightEditing } from '../src/highlightediting.js';
import { HighlightUI } from '../src/highlightui.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { _clearTranslations, add as addTranslations } from '@ckeditor/ckeditor5-utils';
import { ListSeparatorView, MenuBarMenuListItemView, MenuBarMenuView } from '@ckeditor/ckeditor5-ui';

describe( 'HighlightUI', () => {
	let editor, command, element;

	beforeAll( () => {
		addTranslations( 'en', {
			'Highlight': 'Highlight',
			'Yellow marker': 'Yellow marker',
			'Green marker': 'Green marker',
			'Pink marker': 'Pink marker',
			'Red pen': 'Red pen',
			'Blue pen': 'Blue pen',
			'Remove highlight': 'Remove highlight'
		} );

		addTranslations( 'pl', {
			'Highlight': 'Zakreślacz',
			'Yellow marker': 'Żółty marker',
			'Green marker': 'Zielony marker',
			'Pink marker': 'Różowy marker',
			'Blue marker': 'Niebieski marker',
			'Red pen': 'Czerwony długopis',
			'Green pen': 'Zielony długopis',
			'Remove highlight': 'Usuń zaznaczenie'
		} );
	} );

	afterAll( () => {
		_clearTranslations();
	} );

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ HighlightEditing, HighlightUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
				command = editor.commands.get( 'highlight' );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HighlightUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( HighlightUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'highlight toolbar dropdown', () => {
		let dropdown;

		beforeEach( () => {
			dropdown = editor.ui.componentFactory.create( 'highlight' );
		} );

		it( 'button has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).toHaveProperty( 'label', 'Highlight' );
			expect( button ).toHaveProperty( 'tooltip', true );
			expect( button ).toHaveProperty( 'icon', IconMarker );
			expect( button ).toHaveProperty( 'isToggleable', true );
		} );

		it( 'toolbar nas the basic properties', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			expect( dropdown.toolbarView ).toBeUndefined();

			// Trigger toolbar view creation (lazy init).
			dropdown.isOpen = true;

			const toolbarView = dropdown.toolbarView;

			expect( toolbarView ).toHaveProperty( 'ariaLabel', 'Text highlight toolbar' );
		} );

		it( 'should have proper icons in dropdown', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			expect( dropdown.toolbarView ).toBeUndefined();

			// Trigger toolbar view creation (lazy init).
			dropdown.isOpen = true;

			const toolbar = dropdown.toolbarView;

			// Not in a selection with highlight.
			command.value = undefined;

			expect( toolbar.items.map( item => item.icon ) )
				.toEqual( [ IconMarker, IconMarker, IconMarker, IconMarker, IconPen, IconPen, undefined, IconEraser ] );
		} );

		it( 'should have proper colors in dropdown', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			expect( dropdown.toolbarView ).toBeUndefined();

			// Trigger toolbar view creation (lazy init).
			dropdown.isOpen = true;

			const toolbar = dropdown.toolbarView;

			expect( toolbar.items.map( item => item.iconView && item.iconView.fillColor ) ).toEqual( [
				'var(--ck-content-highlight-marker-yellow)',
				'var(--ck-content-highlight-marker-green)',
				'var(--ck-content-highlight-marker-pink)',
				'var(--ck-content-highlight-marker-blue)',
				'var(--ck-content-highlight-pen-red)',
				'var(--ck-content-highlight-pen-green)',
				undefined,
				''
			] );
		} );

		it( 'should activate current option in dropdown', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			expect( dropdown.toolbarView ).toBeUndefined();

			// Trigger toolbar view creation (lazy init).
			dropdown.isOpen = true;

			const toolbar = dropdown.toolbarView;

			// Not in a selection with highlight.
			command.value = undefined;

			expect( toolbar.items.map( item => item.isOn ) )
				.toEqual( [ false, false, false, false, false, false, undefined, false ] );

			// Inside a selection with highlight.
			command.value = 'greenMarker';

			// The second item is 'greenMarker' highlighter.
			expect( toolbar.items.map( item => item.isOn ) )
				.toEqual( [ false, true, false, false, false, false, undefined, false ] );
		} );

		it( 'should focus the first active button when dropdown is opened', () => {
			dropdown.render();
			document.body.appendChild( dropdown.element );

			// Make sure that toolbar view is not created before first dropdown open.
			expect( dropdown.toolbarView ).toBeUndefined();

			// Trigger toolbar view creation (lazy init).
			dropdown.isOpen = true;
			dropdown.isOpen = false;

			const greenMarker = dropdown.toolbarView.items.get( 1 );
			const spy = vi.spyOn( greenMarker, 'focus' );

			greenMarker.isOn = true;
			dropdown.isOpen = true;
			expect( spy ).toHaveBeenCalledOnce();

			dropdown.element.remove();
		} );

		it( 'should mark as toggleable all markers and pens', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			expect( dropdown.toolbarView ).toBeUndefined();

			// Trigger toolbar view creation (lazy init).
			dropdown.isOpen = true;

			const toolbar = dropdown.toolbarView;

			expect( toolbar.items.map( item => item.isToggleable ) )
				.toEqual( [ true, true, true, true, true, true, undefined, false ] );
		} );

		describe( 'toolbar button behavior', () => {
			let button, buttons, options;

			beforeEach( () => {
				dropdown.render();
				document.body.appendChild( dropdown.element );

				// Make sure that toolbar view is not created before first dropdown open.
				expect( dropdown.toolbarView ).toBeUndefined();

				// Trigger toolbar view creation (lazy init).
				dropdown.isOpen = true;

				button = dropdown.buttonView;
				buttons = dropdown.toolbarView.items.map( b => b );
				options = editor.config.get( 'highlight.options' );
			} );

			afterEach( () => {
				dropdown.element.remove();
			} );

			function validateButton( which ) {
				expect( button.icon ).toBe( buttons[ which ].icon );
				expect( button.actionView.iconView.fillColor ).toBe( options[ which ].color );
			}

			it( 'should have properties of first defined highlighter', () => {
				validateButton( 0 );
			} );

			it( 'should change button on selection', () => {
				command.value = 'redPen';

				validateButton( 4 );

				command.value = undefined;

				validateButton( 0 );
			} );

			it( 'should change button on execute option', () => {
				command.value = 'yellowMarker';
				validateButton( 0 );

				buttons[ 5 ].fire( 'execute' );
				command.value = 'greenPen';

				// Simulate selection moved to not highlighted text.
				command.value = undefined;

				validateButton( 5 );
			} );

			it( 'should execute the command only once', () => {
				const executeSpy = vi.spyOn( command, 'execute' );

				buttons[ 5 ].fire( 'execute' );

				expect( executeSpy ).toHaveBeenCalledOnce();
				expect( executeSpy ).toHaveBeenCalledWith( { value: 'greenPen' } );
			} );

			it( 'should focus view after command execution', () => {
				const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

				dropdown.buttonView.commandName = 'highlight';
				dropdown.buttonView.fire( 'execute' );

				expect( focusSpy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'model to command binding', () => {
			it( 'isEnabled', () => {
				command.isEnabled = false;

				expect( dropdown.buttonView.isEnabled ).toBe( false );

				command.isEnabled = true;
				expect( dropdown.buttonView.isEnabled ).toBe( true );
			} );
		} );

		describe( 'localization', () => {
			beforeEach( () => {
				return localizedEditor();
			} );

			it( 'works for the #buttonView', () => {
				const buttonView = dropdown.buttonView;

				expect( buttonView.label ).toBe( 'Zakreślacz' );
			} );

			it( 'works for the listView#items in the panel', () => {
				// Make sure that toolbar view is not created before first dropdown open.
				expect( dropdown.toolbarView ).toBeUndefined();

				// Trigger toolbar view creation (lazy init).
				dropdown.isOpen = true;

				const listView = dropdown.toolbarView;

				expect( listView.items.map( item => item.label ).filter( label => !!label ) ).toEqual( [
					'Żółty marker',
					'Zielony marker',
					'Różowy marker',
					'Niebieski marker',
					'Czerwony długopis',
					'Zielony długopis',
					'Usuń zaznaczenie'
				] );
			} );

			function localizedEditor() {
				const editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ HighlightEditing, HighlightUI ],
						toolbar: [ 'highlight' ],
						language: 'pl'
					} )
					.then( newEditor => {
						dropdown = newEditor.ui.componentFactory.create( 'highlight' );
						command = newEditor.commands.get( 'highlight' );

						editorElement.remove();

						return newEditor.destroy();
					} );
			}
		} );
	} );

	describe( 'hightlight menu bar menu', () => {
		let menuView;

		beforeEach( () => {
			menuView = editor.ui.componentFactory.create( 'menuBar:highlight' );
		} );

		it( 'should be created', () => {
			expect( menuView ).toBeInstanceOf( MenuBarMenuView );
		} );

		it( 'should have correct attribute values', () => {
			expect( menuView.buttonView.label ).toBe( 'Highlight' );
			expect( menuView.buttonView.icon ).toBe( IconMarker );
			expect( menuView.buttonView.iconView.fillColor ).toBe( 'transparent' );
		} );

		it( 'has isEnabled bound to command\'s isEnabled', () => {
			command.isEnabled = true;
			expect( menuView ).toHaveProperty( 'isEnabled', true );

			command.isEnabled = false;
			expect( menuView ).toHaveProperty( 'isEnabled', false );
		} );

		describe( 'list of options', () => {
			it( 'should use correct components to create options', () => {
				expect(
					Array.from( menuView.panelView.children.first.items )
						.every( item => item instanceof MenuBarMenuListItemView || item instanceof ListSeparatorView )
				).toBe( true );
			} );

			it( 'should set #label and #icon of an option', () => {
				expect( dumpItems( 'icon' ) ).toEqual( [
					[ 'Yellow marker', IconMarker ],
					[ 'Green marker', IconMarker ],
					[ 'Pink marker', IconMarker ],
					[ 'Blue marker', IconMarker ],
					[ 'Red pen', IconPen ],
					[ 'Green pen', IconPen ],
					[ 'Remove highlight', IconEraser ]
				] );
			} );

			it( 'should bind #isOn to the command', () => {
				command.value = 'pinkMarker';

				expect( dumpItems( 'isOn' ) ).toEqual( [
					[ 'Yellow marker', false ],
					[ 'Green marker', false ],
					[ 'Pink marker', true ],
					[ 'Blue marker', false ],
					[ 'Red pen', false ],
					[ 'Green pen', false ],
					[ 'Remove highlight', false ]
				] );

				command.value = 'redPen';

				expect( dumpItems( 'isOn' ) ).toEqual( [
					[ 'Yellow marker', false ],
					[ 'Green marker', false ],
					[ 'Pink marker', false ],
					[ 'Blue marker', false ],
					[ 'Red pen', true ],
					[ 'Green pen', false ],
					[ 'Remove highlight', false ]
				] );
			} );

			it( 'should bind `aria-checked` attribute to the command', () => {
				command.value = 'pinkMarker';

				expect( dumpItems( item => item.element.getAttribute( 'aria-checked' ) ) ).toEqual( [
					[ 'Yellow marker', 'false' ],
					[ 'Green marker', 'false' ],
					[ 'Pink marker', 'true' ],
					[ 'Blue marker', 'false' ],
					[ 'Red pen', 'false' ],
					[ 'Green pen', 'false' ],
					[ 'Remove highlight', null ]
				] );

				command.value = 'redPen';

				expect( dumpItems( item => item.element.getAttribute( 'aria-checked' ) ) ).toEqual( [
					[ 'Yellow marker', 'false' ],
					[ 'Green marker', 'false' ],
					[ 'Pink marker', 'false' ],
					[ 'Blue marker', 'false' ],
					[ 'Red pen', 'true' ],
					[ 'Green pen', 'false' ],
					[ 'Remove highlight', null ]
				] );
			} );

			it( 'should delegate #execute from an item to the menu', () => {
				const spy = vi.fn();

				menuView.on( 'execute', spy );

				menuView.panelView.children.first.items.last.children.first.fire( 'execute' );

				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should execute the command upon #execute and focus the editing view', () => {
				const execSpy = vi.spyOn( editor, 'execute' );
				const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

				// Add highlight.
				menuView.panelView.children.first.items.first.children.first.fire( 'execute' );

				expect( execSpy ).toHaveBeenCalledExactlyOnceWith( 'highlight', { value: 'yellowMarker' } );
				expect( focusSpy ).toHaveBeenCalledOnce();
				expect( execSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( focusSpy.mock.invocationCallOrder[ 0 ] );

				// Remove highlight.
				menuView.panelView.children.first.items.last.children.first.fire( 'execute' );

				expect( execSpy ).toHaveBeenNthCalledWith( 2, 'highlight', { value: null } );
				expect( focusSpy ).toHaveBeenCalledTimes( 2 );
			} );
		} );

		it( 'should diplay the remove highlight button at the end', () => {
			expect( menuView.panelView.children.first.items.get( 6 ) ).toBeInstanceOf( ListSeparatorView );
			expect( menuView.panelView.children.first.items.last.children.first.icon ).toBe( IconEraser );
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

	describe( 'highlight remove button', () => {
		let removeHighlightButton;

		beforeEach( () => {
			removeHighlightButton = editor.ui.componentFactory.create( 'removeHighlight' );
		} );

		it( 'removeButton has the base properties', () => {
			expect( editor.ui.componentFactory.has( 'removeHighlight' ) ).toBe( true );
			expect( removeHighlightButton ).toHaveProperty( 'tooltip', true );
			expect( removeHighlightButton ).toHaveProperty( 'label', 'Remove highlight' );
			expect( removeHighlightButton ).toHaveProperty( 'icon', IconEraser );
		} );

		it( 'should execute the command only once', () => {
			const executeSpy = vi.spyOn( command, 'execute' );

			removeHighlightButton.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( { value: null } );
		} );

		describe( 'model to command binding', () => {
			it( 'isEnabled', () => {
				command.isEnabled = false;
				expect( removeHighlightButton.isEnabled ).toBe( false );

				command.isEnabled = true;
				expect( removeHighlightButton.isEnabled ).toBe( true );
			} );
		} );
	} );
} );
