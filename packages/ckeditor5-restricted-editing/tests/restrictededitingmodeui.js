/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import RestrictedEditingModeEditing from './../src/restrictededitingmodeediting';
import RestrictedEditingModeUI from './../src/restrictededitingmodeui';
import lockIcon from '../theme/icons/contentlock.svg';

describe( 'RestrictedEditingModeUI', () => {
	let editor, element, goToPreviousCommand, goToNextCommand;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ RestrictedEditingModeEditing, RestrictedEditingModeUI ]
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

		it( 'should be loaded', () => {
			expect( editor.plugins.get( RestrictedEditingModeUI ) ).to.be.instanceOf( RestrictedEditingModeUI );
		} );
	} );

	describe( 'restricted editing dropdown', () => {
		let dropdown;

		beforeEach( () => {
			dropdown = editor.ui.componentFactory.create( 'restrictedEditing' );
		} );

		it( 'the button should have basic properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'label', 'Navigate editable regions' );
			expect( button ).to.have.property( 'tooltip', true );
			expect( button ).to.have.property( 'icon', lockIcon );
			expect( button ).to.have.property( 'isEnabled', true );
			expect( button ).to.have.property( 'isOn', false );
		} );

		describe( 'exceptions navigation buttons', () => {
			it( 'should have one that goes backward', () => {
				const list = dropdown.listView;
				const button = list.items.first.children.first;

				expect( button.isOn ).to.be.false;
				expect( button.withText ).to.be.true;
				expect( button.withKeystroke ).to.be.true;
				expect( button.label ).to.equal( 'Previous editable region' );
				expect( button.keystroke ).to.equal( 'Shift+Tab' );
			} );

			it( 'should have one that goes forward', () => {
				const list = dropdown.listView;
				const button = list.items.last.children.first;

				expect( button.isOn ).to.be.false;
				expect( button.withText ).to.be.true;
				expect( button.withKeystroke ).to.be.true;
				expect( button.label ).to.equal( 'Next editable region' );
				expect( button.keystroke ).to.equal( 'Tab' );
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
} );
