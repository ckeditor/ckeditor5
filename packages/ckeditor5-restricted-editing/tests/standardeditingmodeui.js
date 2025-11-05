/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconContentUnlock } from 'ckeditor5/src/icons.js';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { ButtonView, DropdownView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { StandardEditingModeUI } from '../src/standardeditingmodeui.js';
import { StandardEditingModeEditing } from '../src/standardeditingmodeediting.js';

describe( 'StandardEditingModeUI', () => {
	let editor, button, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, StandardEditingModeEditing, StandardEditingModeUI ]
		} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( StandardEditingModeUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( StandardEditingModeUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'the "restrictedEditingException" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'restrictedEditingException' );
		} );

		testButton( 'restrictedEditingException', [ 'Enable inline editing', 'Disable inline editing' ], ButtonView );

		it( 'should have #tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );

		it( 'should have #isToggleable', () => {
			expect( button.isToggleable ).to.be.true;
		} );
	} );

	describe( 'the "restrictedEditingException:inline" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'restrictedEditingException:inline' );
		} );

		testButton( 'restrictedEditingException', [ 'Enable inline editing', 'Disable inline editing' ], ButtonView );

		it( 'should have #tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );

		it( 'should have #isToggleable', () => {
			expect( button.isToggleable ).to.be.true;
		} );
	} );

	describe( 'the "restrictedEditingException:block" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'restrictedEditingException:block' );
		} );

		testButton( 'restrictedEditingExceptionBlock', [ 'Enable block editing', 'Disable block editing' ], ButtonView );

		it( 'should have #tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );

		it( 'should have #isToggleable', () => {
			expect( button.isToggleable ).to.be.true;
		} );
	} );

	describe( 'the "menuBar:restrictedEditingException" menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:restrictedEditingException' );
		} );

		testButton( 'restrictedEditingException', [ 'Enable inline editing', 'Disable inline editing' ], MenuBarMenuListItemButtonView );
	} );

	describe( 'the "menuBar:restrictedEditingException:inline" menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:restrictedEditingException:inline' );
		} );

		testButton( 'restrictedEditingException', [ 'Enable inline editing', 'Disable inline editing' ], MenuBarMenuListItemButtonView );
	} );

	describe( 'the "menuBar:restrictedEditingException:block" menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:restrictedEditingException:block' );
		} );

		testButton( 'restrictedEditingExceptionBlock', [ 'Enable block editing', 'Disable block editing' ], MenuBarMenuListItemButtonView );
	} );

	describe( 'the restrictedEditingException:dropdown toolbar dropdown', () => {
		let component;

		beforeEach( () => {
			component = editor.ui.componentFactory.create( 'restrictedEditingException:dropdown' );
		} );

		it( 'should register feature component', () => {
			expect( component ).to.be.instanceOf( DropdownView );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( component.buttonView.label ).to.equal( 'Enable editing' );
			expect( component.buttonView.icon ).to.equal( IconContentUnlock );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			component.render();

			expect( component.element.classList.contains( 'ck-restricted-editing-dropdown' ) ).to.be.true;
		} );

		it( '#toolbarView has the basic properties', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			expect( component.toolbarView ).to.be.undefined;

			// Trigger toolbar view creation (lazy init).
			component.isOpen = true;

			const toolbarView = component.toolbarView;

			expect( toolbarView ).to.have.property( 'isVertical', true );
			expect( toolbarView ).to.have.property( 'ariaLabel', 'Enable editing' );
		} );

		it( 'should hold defined buttons', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			expect( component.toolbarView ).to.be.undefined;

			// Trigger toolbar view creation (lazy init).
			component.isOpen = true;

			const items = [ ...component.toolbarView.items ].map( item => item.label );

			expect( items ).to.have.length( 2 );

			expect( items.includes( 'Enable inline editing' ) ).to.be.true;
			expect( items.includes( 'Enable block editing' ) ).to.be.true;
		} );

		it( 'should be disabled if all commands are not enabled', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			expect( component.toolbarView ).to.be.undefined;

			// Trigger toolbar view creation (lazy init).
			component.isOpen = true;

			const inlineCommand = editor.commands.get( 'restrictedEditingException' );
			const blockCommand = editor.commands.get( 'restrictedEditingExceptionBlock' );

			inlineCommand.isEnabled = true;
			blockCommand.isEnabled = true;
			expect( component.isEnabled ).to.be.true;

			inlineCommand.isEnabled = true;
			blockCommand.isEnabled = false;
			expect( component.isEnabled ).to.be.true;

			inlineCommand.isEnabled = false;
			blockCommand.isEnabled = true;
			expect( component.isEnabled ).to.be.true;

			inlineCommand.isEnabled = false;
			blockCommand.isEnabled = false;
			expect( component.isEnabled ).to.be.false;
		} );

		it( 'should focus the first active button when dropdown is opened', () => {
			component.render();
			document.body.appendChild( component.element );

			// Make sure that toolbar view is not created before first dropdown open.
			expect( component.toolbarView ).to.be.undefined;

			// Trigger toolbar view creation (lazy init).
			component.isOpen = true;
			component.isOpen = false;

			const buttonInline = component.toolbarView.items.get( 0 );
			const buttonBlock = component.toolbarView.items.get( 1 );
			const spy = sinon.spy( buttonBlock, 'focus' );

			buttonInline.isOn = false;
			buttonBlock.isOn = true;
			component.isOpen = true;
			sinon.assert.calledOnce( spy );

			component.element.remove();
		} );

		it( 'should return focus to editable after executing a command', () => {
			// Make sure that toolbar view is not created before first dropdown open.
			expect( component.toolbarView ).to.be.undefined;

			// Trigger toolbar view creation (lazy init).
			component.isOpen = true;

			const buttonInline = component.toolbarView.items.get( 0 );
			const spy = sinon.spy( editor.editing.view, 'focus' );
			component.render();

			buttonInline.fire( 'execute' );

			// The focus is called twice - once by the button itself
			// and once by the dropdown it is in.
			sinon.assert.calledTwice( spy );
		} );
	} );

	function testButton( featureName, labels, Component ) {
		it( 'should register feature component', () => {
			expect( button ).to.be.instanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).to.be.false;
			expect( button.label ).to.equal( labels[ 0 ] );
			expect( button.icon ).to.equal( IconContentUnlock );
		} );

		it( `should execute ${ featureName } command on model execute event and focus the view`, () => {
			const executeSpy = testUtils.sinon.stub( editor, 'execute' );
			const focusSpy = testUtils.sinon.stub( editor.editing.view, 'focus' );

			button.fire( 'execute' );

			sinon.assert.calledOnceWithExactly( executeSpy, featureName );
			sinon.assert.calledOnce( focusSpy );
			sinon.assert.callOrder( executeSpy, focusSpy );
		} );

		it( `should bind #isEnabled to ${ featureName } command`, () => {
			const command = editor.commands.get( featureName );

			expect( button.isOn ).to.be.false;

			const initState = command.isEnabled;
			expect( button.isEnabled ).to.equal( initState );

			command.isEnabled = !initState;
			expect( button.isEnabled ).to.equal( !initState );
		} );

		it( `should bind #isOn to ${ featureName } command`, () => {
			const command = editor.commands.get( featureName );

			expect( button.isOn ).to.be.false;

			command.value = true;
			expect( button.isOn ).to.be.true;

			command.value = false;
			expect( button.isOn ).to.be.false;
		} );

		it( `should bind #label to ${ featureName } command`, () => {
			const command = editor.commands.get( featureName );

			expect( button.label ).to.equal( labels[ 0 ] );

			command.value = true;
			expect( button.label ).to.equal( labels[ 1 ] );

			command.value = false;
			expect( button.label ).to.equal( labels[ 0 ] );
		} );
	}
} );
