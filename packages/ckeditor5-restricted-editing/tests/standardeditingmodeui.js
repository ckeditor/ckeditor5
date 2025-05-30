/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconContentUnlock } from 'ckeditor5/src/icons.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

import StandardEditingModeUI from '../src/standardeditingmodeui.js';
import StandardEditingModeEditing from '../src/standardeditingmodeediting.js';

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

		testButton( 'restrictedEditingException', [ 'Enable editing', 'Disable editing' ], ButtonView );

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

		testButton( 'restrictedEditingException', [ 'Enable editing', 'Disable editing' ], MenuBarMenuListItemButtonView );
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

	// it( 'should register a button', () => {
	// 	expect( button ).to.be.instanceOf( ButtonView );
	// 	expect( button.isOn ).to.be.false;
	// 	expect( button.label ).to.equal( 'Enable editing' );
	// 	expect( button.icon ).to.match( /<svg / );
	// 	expect( button.isToggleable ).to.be.true;
	// } );

	// it( 'should execute a command on the button "execute" event', () => {
	// 	const executeSpy = testUtils.sinon.spy( editor, 'execute' );

	// 	button.fire( 'execute' );

	// 	sinon.assert.calledOnce( executeSpy );
	// } );

	// it( 'should bind a button to the command', () => {
	// 	const command = editor.commands.get( 'restrictedEditingException' );

	// 	expect( button.isOn ).to.be.false;
	// 	expect( button.isEnabled ).to.be.true;

	// 	command.value = true;
	// 	expect( button.isOn ).to.be.true;

	// 	command.isEnabled = false;
	// 	expect( button.isEnabled ).to.be.false;
	// } );
} );
