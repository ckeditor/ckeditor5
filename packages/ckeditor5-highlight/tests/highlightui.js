/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import HighlightEditing from '../src/highlightediting.js';
import HighlightUI from '../src/highlightui.js';

import markerIcon from '../theme/icons/marker.svg';
import penIcon from '../theme/icons/pen.svg';
import eraserIcon from '@ckeditor/ckeditor5-core/theme/icons/eraser.svg';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { _clear as clearTranslations, add as addTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service.js';
import { ListSeparatorView, MenuBarMenuListItemView, MenuBarMenuView } from '@ckeditor/ckeditor5-ui';

describe( 'HighlightUI', () => {
	let editor, command, element;

	testUtils.createSinonSandbox();

	before( () => {
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

	after( () => {
		clearTranslations();
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

	describe( 'highlight toolbar dropdown', () => {
		let dropdown;

		beforeEach( () => {
			dropdown = editor.ui.componentFactory.create( 'highlight' );
		} );

		it( 'button has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'label', 'Highlight' );
			expect( button ).to.have.property( 'tooltip', true );
			expect( button ).to.have.property( 'icon', markerIcon );
			expect( button ).to.have.property( 'isToggleable', true );
		} );

		it( 'toolbar nas the basic properties', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			expect( dropdown.toolbarView ).to.be.undefined;

			// Trigger toolbar view creation (lazy init).
			dropdown.isOpen = true;

			const toolbarView = dropdown.toolbarView;

			expect( toolbarView ).to.have.property( 'ariaLabel', 'Text highlight toolbar' );
		} );

		it( 'should have proper icons in dropdown', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			expect( dropdown.toolbarView ).to.be.undefined;

			// Trigger toolbar view creation (lazy init).
			dropdown.isOpen = true;

			const toolbar = dropdown.toolbarView;

			// Not in a selection with highlight.
			command.value = undefined;

			expect( toolbar.items.map( item => item.icon ) )
				.to.deep.equal( [ markerIcon, markerIcon, markerIcon, markerIcon, penIcon, penIcon, undefined, eraserIcon ] );
		} );

		it( 'should have proper colors in dropdown', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			expect( dropdown.toolbarView ).to.be.undefined;

			// Trigger toolbar view creation (lazy init).
			dropdown.isOpen = true;

			const toolbar = dropdown.toolbarView;

			expect( toolbar.items.map( item => item.iconView && item.iconView.fillColor ) ).to.deep.equal( [
				'var(--ck-highlight-marker-yellow)',
				'var(--ck-highlight-marker-green)',
				'var(--ck-highlight-marker-pink)',
				'var(--ck-highlight-marker-blue)',
				'var(--ck-highlight-pen-red)',
				'var(--ck-highlight-pen-green)',
				undefined,
				''
			] );
		} );

		it( 'should activate current option in dropdown', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			expect( dropdown.toolbarView ).to.be.undefined;

			// Trigger toolbar view creation (lazy init).
			dropdown.isOpen = true;

			const toolbar = dropdown.toolbarView;

			// Not in a selection with highlight.
			command.value = undefined;

			expect( toolbar.items.map( item => item.isOn ) )
				.to.deep.equal( [ false, false, false, false, false, false, undefined, false ] );

			// Inside a selection with highlight.
			command.value = 'greenMarker';

			// The second item is 'greenMarker' highlighter.
			expect( toolbar.items.map( item => item.isOn ) )
				.to.deep.equal( [ false, true, false, false, false, false, undefined, false ] );
		} );

		it( 'should focus the first active button when dropdown is opened', () => {
			dropdown.render();
			document.body.appendChild( dropdown.element );

			// Make sure that toolbar view is not created before first dropdown open.
			expect( dropdown.toolbarView ).to.be.undefined;

			// Trigger toolbar view creation (lazy init).
			dropdown.isOpen = true;
			dropdown.isOpen = false;

			const greenMarker = dropdown.toolbarView.items.get( 1 );
			const spy = sinon.spy( greenMarker, 'focus' );

			greenMarker.isOn = true;
			dropdown.isOpen = true;
			sinon.assert.calledOnce( spy );

			dropdown.element.remove();
		} );

		it( 'should mark as toggleable all markers and pens', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			expect( dropdown.toolbarView ).to.be.undefined;

			// Trigger toolbar view creation (lazy init).
			dropdown.isOpen = true;

			const toolbar = dropdown.toolbarView;

			expect( toolbar.items.map( item => item.isToggleable ) )
				.to.deep.equal( [ true, true, true, true, true, true, undefined, false ] );
		} );

		describe( 'toolbar button behavior', () => {
			let button, buttons, options;

			beforeEach( () => {
				dropdown.render();
				document.body.appendChild( dropdown.element );

				// Make sure that toolbar view is not created before first dropdown open.
				expect( dropdown.toolbarView ).to.be.undefined;

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
				expect( button.icon ).to.equal( buttons[ which ].icon );
				expect( button.actionView.iconView.fillColor ).to.equal( options[ which ].color );
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
				const executeSpy = sinon.spy( command, 'execute' );

				buttons[ 5 ].fire( 'execute' );

				sinon.assert.calledOnce( executeSpy );
				sinon.assert.calledWith( executeSpy, { value: 'greenPen' } );
			} );

			it( 'should focus view after command execution', () => {
				const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				dropdown.buttonView.commandName = 'highlight';
				dropdown.buttonView.fire( 'execute' );

				sinon.assert.calledOnce( focusSpy );
			} );
		} );

		describe( 'model to command binding', () => {
			it( 'isEnabled', () => {
				command.isEnabled = false;

				expect( dropdown.buttonView.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( dropdown.buttonView.isEnabled ).to.be.true;
			} );
		} );

		describe( 'localization', () => {
			beforeEach( () => {
				return localizedEditor();
			} );

			it( 'works for the #buttonView', () => {
				const buttonView = dropdown.buttonView;

				expect( buttonView.label ).to.equal( 'Zakreślacz' );
			} );

			it( 'works for the listView#items in the panel', () => {
				// Make sure that toolbar view is not created before first dropdown open.
				expect( dropdown.toolbarView ).to.be.undefined;

				// Trigger toolbar view creation (lazy init).
				dropdown.isOpen = true;

				const listView = dropdown.toolbarView;

				expect( listView.items.map( item => item.label ).filter( label => !!label ) ).to.deep.equal( [
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
			expect( menuView ).to.be.instanceof( MenuBarMenuView );
		} );

		it( 'should have correct attribute values', () => {
			expect( menuView.buttonView.label ).to.equal( 'Highlight' );
			expect( menuView.buttonView.icon ).to.equal( markerIcon );
			expect( menuView.buttonView.iconView.fillColor ).to.equal( 'transparent' );
		} );

		it( 'has isEnabled bound to command\'s isEnabled', () => {
			command.isEnabled = true;
			expect( menuView ).to.have.property( 'isEnabled', true );

			command.isEnabled = false;
			expect( menuView ).to.have.property( 'isEnabled', false );
		} );

		describe( 'list of options', () => {
			it( 'should use correct components to create options', () => {
				expect(
					Array.from( menuView.panelView.children.first.items )
						.every( item => item instanceof MenuBarMenuListItemView || item instanceof ListSeparatorView )
				).to.be.true;
			} );

			it( 'should set #label and #icon of an option', () => {
				expect( dumpItems( 'icon' ) ).to.have.deep.ordered.members( [
					[ 'Yellow marker', markerIcon ],
					[ 'Green marker', markerIcon ],
					[ 'Pink marker', markerIcon ],
					[ 'Blue marker', markerIcon ],
					[ 'Red pen', penIcon ],
					[ 'Green pen', penIcon ],
					[ 'Remove highlight', eraserIcon ]
				] );
			} );

			it( 'should bind #isOn to the command', () => {
				command.value = 'pinkMarker';

				expect( dumpItems( 'isOn' ) ).to.have.deep.ordered.members( [
					[ 'Yellow marker', false ],
					[ 'Green marker', false ],
					[ 'Pink marker', true ],
					[ 'Blue marker', false ],
					[ 'Red pen', false ],
					[ 'Green pen', false ],
					[ 'Remove highlight', false ]
				] );

				command.value = 'redPen';

				expect( dumpItems( 'isOn' ) ).to.have.deep.ordered.members( [
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

				expect( dumpItems( item => item.element.getAttribute( 'aria-checked' ) ) ).to.have.deep.ordered.members( [
					[ 'Yellow marker', 'false' ],
					[ 'Green marker', 'false' ],
					[ 'Pink marker', 'true' ],
					[ 'Blue marker', 'false' ],
					[ 'Red pen', 'false' ],
					[ 'Green pen', 'false' ],
					[ 'Remove highlight', null ]
				] );

				command.value = 'redPen';

				expect( dumpItems( item => item.element.getAttribute( 'aria-checked' ) ) ).to.have.deep.ordered.members( [
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
				const spy = sinon.spy();

				menuView.on( 'execute', spy );

				menuView.panelView.children.first.items.last.children.first.fire( 'execute' );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should execute the command upon #execute and focus the editing view', () => {
				const execSpy = sinon.spy( editor, 'execute' );
				const focusSpy = sinon.spy( editor.editing.view, 'focus' );

				// Add highlight.
				menuView.panelView.children.first.items.first.children.first.fire( 'execute' );

				sinon.assert.calledOnceWithExactly( execSpy, 'highlight', { value: 'yellowMarker' } );
				sinon.assert.calledOnce( focusSpy );
				sinon.assert.callOrder( execSpy, focusSpy );

				// Remove highlight.
				menuView.panelView.children.first.items.last.children.first.fire( 'execute' );

				sinon.assert.calledWithExactly( execSpy.secondCall, 'highlight', { value: null } );
				sinon.assert.calledTwice( focusSpy );
			} );
		} );

		it( 'should diplay the remove highlight button at the end', () => {
			expect( menuView.panelView.children.first.items.get( 6 ) ).to.be.instanceOf( ListSeparatorView );
			expect( menuView.panelView.children.first.items.last.children.first.icon ).to.equal( eraserIcon );
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
			expect( editor.ui.componentFactory.has( 'removeHighlight' ) ).to.be.true;
			expect( removeHighlightButton ).to.have.property( 'tooltip', true );
			expect( removeHighlightButton ).to.have.property( 'label', 'Remove highlight' );
			expect( removeHighlightButton ).to.have.property( 'icon', eraserIcon );
		} );

		it( 'should execute the command only once', () => {
			const executeSpy = sinon.spy( command, 'execute' );

			removeHighlightButton.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWith( executeSpy, { value: null } );
		} );

		describe( 'model to command binding', () => {
			it( 'isEnabled', () => {
				command.isEnabled = false;
				expect( removeHighlightButton.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( removeHighlightButton.isEnabled ).to.be.true;
			} );
		} );
	} );
} );
