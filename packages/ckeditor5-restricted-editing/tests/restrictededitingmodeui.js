/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconContentLock } from 'ckeditor5/src/icons.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';

import RestrictedEditingModeEditing from './../src/restrictededitingmodeediting.js';
import RestrictedEditingModeUI from './../src/restrictededitingmodeui.js';

describe( 'RestrictedEditingModeUI', () => {
	let editor, element, goToPreviousCommand, goToNextCommand;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ RestrictedEditingModeEditing, RestrictedEditingModeUI, ClipboardPipeline ]
		} );

		goToPreviousCommand = editor.commands.get( 'goToPreviousRestrictedEditingException' );
		goToNextCommand = editor.commands.get( 'goToNextRestrictedEditingException' );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	describe( 'plugin', () => {
		it( 'should be named', () => {
			expect( RestrictedEditingModeUI.pluginName ).to.equal( 'RestrictedEditingModeUI' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( RestrictedEditingModeUI.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( RestrictedEditingModeUI.isPremiumPlugin ).to.be.false;
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( RestrictedEditingModeUI ) ).to.be.instanceOf( RestrictedEditingModeUI );
		} );
	} );

	describe( 'restricted editing toolbar dropdown', () => {
		let dropdown;

		beforeEach( () => {
			dropdown = editor.ui.componentFactory.create( 'restrictedEditing' );
		} );

		it( 'the button should have basic properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'label', 'Navigate editable regions' );
			expect( button ).to.have.property( 'tooltip', true );
			expect( button ).to.have.property( 'icon', IconContentLock );
			expect( button ).to.have.property( 'isEnabled', true );
			expect( button ).to.have.property( 'isOn', false );
		} );

		it( 'has role="menu" attribute set in items list', () => {
			dropdown.isOpen = true;

			expect( dropdown.panelView.children.first.role ).to.be.equal( 'menu' );
		} );

		describe( 'exceptions navigation buttons', () => {
			beforeEach( () => {
				dropdown.render();
				document.body.appendChild( dropdown.element );

				dropdown.isOpen = true;
			} );

			afterEach( () => {
				dropdown.element.remove();
			} );

			it( 'should have one that goes backward', () => {
				const list = dropdown.listView;
				const button = list.items.first.children.first;

				expect( button.isOn ).to.be.false;
				expect( button.withText ).to.be.true;
				expect( button.withKeystroke ).to.be.true;
				expect( button.label ).to.equal( 'Previous editable region' );
				expect( button.keystroke ).to.equal( 'Shift+Tab' );
				expect( button.role ).to.equal( 'menuitem' );
			} );

			it( 'should have one that goes forward', () => {
				const list = dropdown.listView;
				const button = list.items.last.children.first;

				expect( button.isOn ).to.be.false;
				expect( button.withText ).to.be.true;
				expect( button.withKeystroke ).to.be.true;
				expect( button.label ).to.equal( 'Next editable region' );
				expect( button.keystroke ).to.equal( 'Tab' );
				expect( button.role ).to.equal( 'menuitem' );
			} );

			it( 'should focus the view after executing the command', () => {
				const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
				const list = dropdown.listView;
				const goToPreviousButton = list.items.first.children.first;

				goToPreviousButton.fire( 'execute' );
				sinon.assert.calledOnce( focusSpy );
			} );

			it( 'be enabled just like their corresponding commands', () => {
				const listView = dropdown.listView;

				goToPreviousCommand.isEnabled = false;
				goToNextCommand.isEnabled = false;

				expect( listView.items.map( item => item.children.first.isEnabled ) ).to.deep.equal( [ false, false ] );

				goToPreviousCommand.isEnabled = true;
				expect( listView.items.map( item => item.children.first.isEnabled ) ).to.deep.equal( [ true, false ] );

				goToNextCommand.isEnabled = true;
				expect( listView.items.map( item => item.children.first.isEnabled ) ).to.deep.equal( [ true, true ] );
			} );

			it( 'should execute their corresponding commands', () => {
				const list = dropdown.listView;
				const goToPreviousButton = list.items.first.children.first;
				const goToNextButton = list.items.last.children.first;

				goToPreviousCommand.isEnabled = true;
				goToNextCommand.isEnabled = true;

				const spy = sinon.spy( editor, 'execute' );

				goToPreviousButton.fire( 'execute' );
				sinon.assert.calledWith( spy.firstCall, 'goToPreviousRestrictedEditingException' );

				goToNextButton.fire( 'execute' );
				sinon.assert.calledWith( spy.secondCall, 'goToNextRestrictedEditingException' );
			} );
		} );
	} );

	describe( 'restricted editing menu bar menu', () => {
		let menuView;

		beforeEach( () => {
			menuView = editor.ui.componentFactory.create( 'menuBar:restrictedEditing' );
		} );

		it( 'the button should have basic properties', () => {
			const button = menuView.buttonView;

			expect( button ).to.have.property( 'label', 'Navigate editable regions' );
			expect( button ).to.have.property( 'icon', IconContentLock );
			expect( button ).to.have.property( 'isEnabled', true );
			expect( button ).to.have.property( 'isOn', false );
		} );

		it( 'should set basic properties on the list', () => {
			const listView = menuView.panelView.children.first;

			expect( listView ).to.have.property( 'ariaLabel', 'Navigate editable regions' );
			expect( listView ).to.have.property( 'role', 'menu' );
		} );

		describe( 'exceptions navigation buttons', () => {
			let backwardButton, forwardButton;

			beforeEach( () => {
				menuView.render();
				document.body.appendChild( menuView.element );

				menuView.isOpen = true;

				backwardButton = menuView.panelView.children.first.items.first.children.first;
				forwardButton = menuView.panelView.children.first.items.last.children.first;
			} );

			afterEach( () => {
				menuView.element.remove();
			} );

			it( 'should delegate #execute to the menu view', () => {
				const executeSpy = sinon.spy();

				menuView.on( 'execute', executeSpy );

				backwardButton.fire( 'execute' );
				sinon.assert.calledOnce( executeSpy );

				forwardButton.fire( 'execute' );
				sinon.assert.calledTwice( executeSpy );
			} );

			it( 'should have #isEnabled bound to their respective commands to the command', () => {
				goToPreviousCommand.isEnabled = true;
				goToNextCommand.isEnabled = true;

				expect( backwardButton.isEnabled ).to.be.true;
				expect( forwardButton.isEnabled ).to.be.true;

				goToPreviousCommand.isEnabled = false;
				goToNextCommand.isEnabled = true;

				expect( backwardButton.isEnabled ).to.be.false;
				expect( forwardButton.isEnabled ).to.be.true;

				goToPreviousCommand.isEnabled = false;
				goToNextCommand.isEnabled = false;

				expect( backwardButton.isEnabled ).to.be.false;
				expect( forwardButton.isEnabled ).to.be.false;
			} );

			it( 'should have one that goes backward', () => {
				expect( backwardButton.isOn ).to.be.false;
				expect( backwardButton.withText ).to.be.true;
				expect( backwardButton.withKeystroke ).to.be.true;
				expect( backwardButton.label ).to.equal( 'Previous editable region' );
				expect( backwardButton.keystroke ).to.equal( 'Shift+Tab' );
			} );

			it( 'should have one that goes forward', () => {
				expect( forwardButton.isOn ).to.be.false;
				expect( forwardButton.withText ).to.be.true;
				expect( forwardButton.withKeystroke ).to.be.true;
				expect( forwardButton.label ).to.equal( 'Next editable region' );
				expect( forwardButton.keystroke ).to.equal( 'Tab' );
			} );

			it( 'should focus the view after executing the command', () => {
				const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				backwardButton.fire( 'execute' );
				sinon.assert.calledOnce( focusSpy );

				forwardButton.fire( 'execute' );
				sinon.assert.calledTwice( focusSpy );
			} );

			it( 'should execute their corresponding commands', () => {
				goToPreviousCommand.isEnabled = true;
				goToNextCommand.isEnabled = true;

				const spy = sinon.spy( editor, 'execute' );

				backwardButton.fire( 'execute' );
				sinon.assert.calledWith( spy.firstCall, 'goToPreviousRestrictedEditingException' );

				forwardButton.fire( 'execute' );
				sinon.assert.calledWith( spy.secondCall, 'goToNextRestrictedEditingException' );
			} );
		} );
	} );
} );
