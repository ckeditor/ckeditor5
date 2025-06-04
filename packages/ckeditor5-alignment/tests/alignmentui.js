/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconAlignLeft, IconAlignRight } from 'ckeditor5/src/icons.js';

import AlignmentEditing from '../src/alignmentediting.js';
import AlignmentUI from '../src/alignmentui.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

describe( 'Alignment UI', () => {
	let editor, command, element, button;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ AlignmentEditing, AlignmentUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( AlignmentUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( AlignmentUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'localizedOptionTitles()', () => {
		it( 'should return localized titles of options', () => {
			const editorMock = { t: str => str };

			const plugin = new AlignmentUI( editorMock );

			expect( plugin.localizedOptionTitles ).to.deep.equal( {
				'left': 'Align left',
				'right': 'Align right',
				'center': 'Align center',
				'justify': 'Justify'
			} );
		} );
	} );

	describe( 'toolbar', () => {
		describe( 'alignment:left button', () => {
			beforeEach( () => {
				command = editor.commands.get( 'alignment' );
				button = editor.ui.componentFactory.create( 'alignment:left' );
			} );

			it( 'has the base properties', () => {
				expect( button ).to.have.property( 'label', 'Align left' );
				expect( button ).to.have.property( 'icon' );
				expect( button ).to.have.property( 'tooltip', true );
				expect( button ).to.have.property( 'isToggleable', true );
				expect( button ).to.have.property( 'tooltipPosition', 's' );
			} );

			it( 'has isOn bound to command\'s value', () => {
				command.value = false;
				expect( button ).to.have.property( 'isOn', false );

				command.value = 'left';
				expect( button ).to.have.property( 'isOn', true );

				command.value = 'justify';
				expect( button ).to.have.property( 'isOn', false );
			} );

			it( 'has isEnabled bound to command\'s isEnabled', () => {
				command.isEnabled = true;
				expect( button ).to.have.property( 'isEnabled', true );

				command.isEnabled = false;
				expect( button ).to.have.property( 'isEnabled', false );
			} );

			it( 'executes command when it\'s executed', () => {
				const spy = sinon.stub( editor, 'execute' );

				button.fire( 'execute' );

				expect( spy.calledOnce ).to.be.true;
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'alignment' );
				expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( { value: 'left' } );
			} );
		} );

		describe( 'alignment:right button', () => {
			beforeEach( () => {
				command = editor.commands.get( 'alignment' );
				button = editor.ui.componentFactory.create( 'alignment:right' );
			} );

			it( 'has the base properties', () => {
				expect( button ).to.have.property( 'label', 'Align right' );
				expect( button ).to.have.property( 'icon' );
				expect( button ).to.have.property( 'tooltip', true );
				expect( button ).to.have.property( 'tooltipPosition', 's' );
			} );

			it( 'has isOn bound to command\'s value', () => {
				command.value = false;
				expect( button ).to.have.property( 'isOn', false );

				command.value = 'right';
				expect( button ).to.have.property( 'isOn', true );

				command.value = 'justify';
				expect( button ).to.have.property( 'isOn', false );
			} );

			it( 'has isEnabled bound to command\'s isEnabled', () => {
				command.isEnabled = true;
				expect( button ).to.have.property( 'isEnabled', true );

				command.isEnabled = false;
				expect( button ).to.have.property( 'isEnabled', false );
			} );

			it( 'executes command when it\'s executed', () => {
				const spy = sinon.stub( editor, 'execute' );

				button.fire( 'execute' );

				expect( spy.calledOnce ).to.be.true;
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'alignment' );
				expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( { value: 'right' } );
			} );
		} );

		describe( 'alignment:center button', () => {
			beforeEach( () => {
				command = editor.commands.get( 'alignment' );
				button = editor.ui.componentFactory.create( 'alignment:center' );
			} );

			it( 'has the base properties', () => {
				expect( button ).to.have.property( 'label', 'Align center' );
				expect( button ).to.have.property( 'icon' );
				expect( button ).to.have.property( 'tooltip', true );
				expect( button ).to.have.property( 'tooltipPosition', 's' );
			} );

			it( 'has isOn bound to command\'s value', () => {
				command.value = false;
				expect( button ).to.have.property( 'isOn', false );

				command.value = 'center';
				expect( button ).to.have.property( 'isOn', true );

				command.value = 'justify';
				expect( button ).to.have.property( 'isOn', false );
			} );

			it( 'has isEnabled bound to command\'s isEnabled', () => {
				command.isEnabled = true;
				expect( button ).to.have.property( 'isEnabled', true );

				command.isEnabled = false;
				expect( button ).to.have.property( 'isEnabled', false );
			} );

			it( 'executes command when it\'s executed', () => {
				const spy = sinon.stub( editor, 'execute' );

				button.fire( 'execute' );

				expect( spy.calledOnce ).to.be.true;
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'alignment' );
				expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( { value: 'center' } );
			} );
		} );

		describe( 'alignment:justify button', () => {
			beforeEach( () => {
				command = editor.commands.get( 'alignment' );
				button = editor.ui.componentFactory.create( 'alignment:justify' );
			} );

			it( 'has the base properties', () => {
				expect( button ).to.have.property( 'label', 'Justify' );
				expect( button ).to.have.property( 'icon' );
				expect( button ).to.have.property( 'tooltip', true );
				expect( button ).to.have.property( 'tooltipPosition', 's' );
			} );

			it( 'has isOn bound to command\'s value', () => {
				command.value = false;
				expect( button ).to.have.property( 'isOn', false );

				command.value = 'justify';
				expect( button ).to.have.property( 'isOn', true );

				command.value = 'center';
				expect( button ).to.have.property( 'isOn', false );
			} );

			it( 'has isEnabled bound to command\'s isEnabled', () => {
				command.isEnabled = true;
				expect( button ).to.have.property( 'isEnabled', true );

				command.isEnabled = false;
				expect( button ).to.have.property( 'isEnabled', false );
			} );

			it( 'executes command when it\'s executed', () => {
				const spy = sinon.stub( editor, 'execute' );

				button.fire( 'execute' );

				expect( spy.calledOnce ).to.be.true;
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'alignment' );
				expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( { value: 'justify' } );
			} );
		} );

		describe( 'alignment', () => {
			let dropdown;

			beforeEach( () => {
				command = editor.commands.get( 'alignment' );
				dropdown = editor.ui.componentFactory.create( 'alignment' );
			} );

			it( '#buttonView has the base properties', () => {
				const button = dropdown.buttonView;

				expect( button ).to.have.property( 'label', 'Text alignment' );
				expect( button ).to.have.property( 'icon' );
				expect( button ).to.have.property( 'tooltip', true );
			} );

			it( 'should add custom CSS class to dropdown', () => {
				dropdown.render();

				expect( dropdown.element.classList.contains( 'ck-alignment-dropdown' ) ).to.be.true;
			} );

			it( '#toolbarView has the basic properties', () => {
				// Make sure that toolbar view is not created before first dropdown open.
				expect( dropdown.toolbarView ).to.be.undefined;

				// Trigger toolbar view creation (lazy init).
				dropdown.isOpen = true;

				const toolbarView = dropdown.toolbarView;

				expect( toolbarView ).to.have.property( 'isVertical', true );
				expect( toolbarView ).to.have.property( 'ariaLabel', 'Text alignment toolbar' );
			} );

			it( 'should hold defined buttons', () => {
				// Make sure that toolbar view is not created before first dropdown open.
				expect( dropdown.toolbarView ).to.be.undefined;

				// Trigger toolbar view creation (lazy init).
				dropdown.isOpen = true;

				const items = [ ...dropdown.toolbarView.items ].map( item => item.label );

				expect( items ).to.have.length( 4 );

				expect( items.includes( 'Align left' ) ).to.be.true;
				expect( items.includes( 'Align right' ) ).to.be.true;
				expect( items.includes( 'Align center' ) ).to.be.true;
				expect( items.includes( 'Justify' ) ).to.be.true;
			} );

			it( 'tooltips pinned to buttons should be aligned on east', () => {
				// Make sure that toolbar view is not created before first dropdown open.
				expect( dropdown.toolbarView ).to.be.undefined;

				// Trigger toolbar view creation (lazy init).
				dropdown.isOpen = true;

				const items = [ ...dropdown.toolbarView.items ].map( item => item.tooltipPosition );

				expect( items ).to.have.length( 4 );
				expect( items.every( item => item === 'e' ) ).to.be.true;
			} );

			it( 'tooltips pinned to buttons should be aligned on west (RTL ui)', async () => {
				// Clean up the editor created in main test suite hook.
				await editor.destroy();

				const newEditor = await ClassicTestEditor.create( element, {
					language: {
						content: 'ar',
						ui: 'ar'
					},
					plugins: [ AlignmentEditing, AlignmentUI ]
				} );

				dropdown = newEditor.ui.componentFactory.create( 'alignment' );
				dropdown.isOpen = true;

				const items = [ ...dropdown.toolbarView.items ].map( item => item.tooltipPosition );

				expect( items ).to.have.length( 4 );
				expect( items.every( item => item === 'w' ) ).to.be.true;

				await newEditor.destroy();
			} );

			it( 'should use icon related to current command value', () => {
				// Make sure that toolbar view is not created before first dropdown open.
				expect( dropdown.toolbarView ).to.be.undefined;

				// Trigger toolbar view creation (lazy init).
				dropdown.isOpen = true;

				expect( dropdown.buttonView.icon ).to.equal( IconAlignLeft );

				command.value = 'right';

				expect( dropdown.buttonView.icon ).to.equal( IconAlignRight );
			} );

			it( 'should be disabled if command is not enabled', () => {
				// Make sure that toolbar view is not created before first dropdown open.
				expect( dropdown.toolbarView ).to.be.undefined;

				// Trigger toolbar view creation (lazy init).
				dropdown.isOpen = true;

				command.isEnabled = true;
				expect( dropdown.isEnabled ).to.be.true;

				command.isEnabled = false;
				expect( dropdown.isEnabled ).to.be.false;
			} );

			it( 'should focus the first active button when dropdown is opened', () => {
				dropdown.render();
				document.body.appendChild( dropdown.element );

				// Make sure that toolbar view is not created before first dropdown open.
				expect( dropdown.toolbarView ).to.be.undefined;

				// Trigger toolbar view creation (lazy init).
				dropdown.isOpen = true;
				dropdown.isOpen = false;

				const buttonAlignLeft = dropdown.toolbarView.items.get( 0 );
				const buttonAlignRight = dropdown.toolbarView.items.get( 1 );
				const spy = sinon.spy( buttonAlignRight, 'focus' );

				buttonAlignLeft.isOn = false;
				buttonAlignRight.isOn = true;
				dropdown.isOpen = true;
				sinon.assert.calledOnce( spy );

				dropdown.element.remove();
			} );

			it( 'should return focus to editable after executing a command', () => {
				// Make sure that toolbar view is not created before first dropdown open.
				expect( dropdown.toolbarView ).to.be.undefined;

				// Trigger toolbar view creation (lazy init).
				dropdown.isOpen = true;

				const buttonAlignLeft = dropdown.toolbarView.items.get( 0 );
				const spy = sinon.spy( editor.editing.view, 'focus' );
				dropdown.render();

				buttonAlignLeft.fire( 'execute' );

				// The focus is called twice - once by the button itself
				// and once by the dropdown it is in.
				sinon.assert.calledTwice( spy );
			} );
		} );

		describe( 'config', () => {
			let dropdown;

			beforeEach( async () => {
				// Clean up the editor created in main test suite hook.
				await editor.destroy();

				return ClassicTestEditor
					.create( element, {
						plugins: [ AlignmentEditing, AlignmentUI ],
						alignment: { options: [ 'center', 'justify' ] }
					} )
					.then( newEditor => {
						editor = newEditor;

						dropdown = editor.ui.componentFactory.create( 'alignment' );
						command = editor.commands.get( 'alignment' );
						button = editor.ui.componentFactory.create( 'alignment:center' );
					} );
			} );

			it( 'should hold only defined buttons', () => {
				// Make sure that toolbar view is not created before first dropdown open.
				expect( dropdown.toolbarView ).to.be.undefined;

				// Trigger toolbar view creation (lazy init).
				dropdown.isOpen = true;

				const items = [ ...dropdown.toolbarView.items ].map( item => item.label );

				expect( items ).to.have.length( 2 );

				expect( items.includes( 'Align center' ) ).to.be.true;
				expect( items.includes( 'Justify' ) ).to.be.true;
			} );

			it( 'should have default icon set (LTR content)', () => {
				command.value = undefined;
				expect( dropdown.buttonView.icon ).to.equal( IconAlignLeft );
			} );

			it( 'should have default icon set (RTL content)', async () => {
				// Clean up the editor created in main test suite hook.
				await editor.destroy();

				return ClassicTestEditor
					.create( element, {
						language: {
							content: 'ar'
						},
						plugins: [ AlignmentEditing, AlignmentUI ],
						alignment: { options: [ 'center', 'justify' ] }
					} )
					.then( newEditor => {
						dropdown = newEditor.ui.componentFactory.create( 'alignment' );
						editor.commands.get( 'alignment' ).value = undefined;

						expect( dropdown.buttonView.icon ).to.equal( IconAlignRight );

						return newEditor.destroy();
					} );
			} );

			it( 'should change icon to active alignment', () => {
				command.value = 'center';

				expect( dropdown.buttonView.icon ).to.equal( button.icon );
			} );
		} );
	} );

	describe( 'menu bar', () => {
		let submenu;

		beforeEach( () => {
			command = editor.commands.get( 'alignment' );
			submenu = editor.ui.componentFactory.create( 'menuBar:alignment' );
		} );

		it( 'has isEnabled bound to command\'s isEnabled', () => {
			command.isEnabled = true;
			expect( submenu ).to.have.property( 'isEnabled', true );

			command.isEnabled = false;
			expect( submenu ).to.have.property( 'isEnabled', false );
		} );

		testMenuBarButton( 0, 'left', 'right', 'Align left' );
		testMenuBarButton( 1, 'right', 'left', 'Align right' );
		testMenuBarButton( 2, 'center', 'left', 'Align center' );
		testMenuBarButton( 3, 'justify', 'left', 'Justify' );

		it( '#buttonView has the base properties', () => {
			const button = submenu.buttonView;

			expect( button ).to.have.property( 'label', 'Text alignment' );
			expect( button ).to.have.property( 'icon' );
		} );

		it( 'should hold defined buttons', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			const listView = submenu.panelView.children.get( 0 );

			expect( listView ).not.to.be.undefined;

			const items = [ ...listView.items ].map( item => item.children.get( 0 ).label );

			expect( items ).to.have.length( 4 );

			expect( items.includes( 'Align left' ) ).to.be.true;
			expect( items.includes( 'Align right' ) ).to.be.true;
			expect( items.includes( 'Align center' ) ).to.be.true;
			expect( items.includes( 'Justify' ) ).to.be.true;
		} );

		function testMenuBarButton( index, commandValue, anotherCommandValue, label ) {
			let button;

			describe( 'alignment:' + commandValue + ' button', () => {
				beforeEach( () => {
					command = editor.commands.get( 'alignment' );
					const submenu = editor.ui.componentFactory.create( 'menuBar:alignment' );
					button = submenu.panelView.children.get( 0 ).items.get( index ).children.get( 0 );
				} );

				it( 'has the base properties', () => {
					expect( button ).to.have.property( 'label', label );
					expect( button ).to.have.property( 'icon' );
				} );

				it( 'has isOn bound to command\'s value', () => {
					command.value = false;
					expect( button ).to.have.property( 'isOn', false );

					command.value = commandValue;
					expect( button ).to.have.property( 'isOn', true );

					command.value = anotherCommandValue;
					expect( button ).to.have.property( 'isOn', false );
				} );

				it( 'has isEnabled bound to command\'s isEnabled', () => {
					command.isEnabled = true;
					expect( button ).to.have.property( 'isEnabled', true );

					command.isEnabled = false;
					expect( button ).to.have.property( 'isEnabled', false );
				} );

				it( 'executes command when it\'s executed', () => {
					const spy = sinon.stub( editor, 'execute' );

					button.fire( 'execute' );

					expect( spy.calledOnce ).to.be.true;
					expect( spy.args[ 0 ][ 0 ] ).to.equal( 'alignment' );
					expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( { value: commandValue } );
				} );

				it( 'should return focus to editable after executing a command', () => {
					const spy = sinon.spy( editor.editing.view, 'focus' );

					button.fire( 'execute' );

					sinon.assert.calledOnce( spy );
				} );
			} );
		}
	} );
} );
