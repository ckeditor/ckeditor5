/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import RestrictedEditingEditing from './../src/restrictededitingediting';
import RestrictedEditingUI from './../src/restrictededitingui';
import lockIcon from '../theme/icons/contentlock.svg';

describe( 'RestrictedEditingUI', () => {
	let editor, element, goToPreviousCommand, goToNextCommand;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ RestrictedEditingEditing, RestrictedEditingUI ]
			} )
			.then( newEditor => {
				editor = newEditor;

				goToPreviousCommand = editor.commands.get( 'goToPreviousRestrictedEditingRegion' );
				goToNextCommand = editor.commands.get( 'goToNextRestrictedEditingRegion' );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'plugin', () => {
		it( 'should be named', () => {
			expect( RestrictedEditingUI.pluginName ).to.equal( 'RestrictedEditingUI' );
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( RestrictedEditingUI ) ).to.be.instanceOf( RestrictedEditingUI );
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
				expect( button.label ).to.equal( 'Previous editable region' );
			} );

			it( 'should have one that goes forward', () => {
				const list = dropdown.listView;
				const button = list.items.last.children.first;

				expect( button.isOn ).to.be.false;
				expect( button.withText ).to.be.true;
				expect( button.label ).to.equal( 'Next editable region' );
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
				sinon.assert.calledWith( spy.firstCall, 'goToPreviousRestrictedEditingRegion' );

				goToNextButton.fire( 'execute' );
				sinon.assert.calledWith( spy.secondCall, 'goToNextRestrictedEditingRegion' );
			} );
		} );
	} );
} );
