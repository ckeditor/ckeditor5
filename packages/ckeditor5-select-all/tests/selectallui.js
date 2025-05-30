/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import SelectAllEditing from '../src/selectallediting.js';
import SelectAllUI from '../src/selectallui.js';
import { MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'SelectAllUI', () => {
	let editor, editorElement, button;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ SelectAllEditing, SelectAllUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
				button = editor.ui.componentFactory.create( 'selectAll' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have a name', () => {
		expect( SelectAllUI.pluginName ).to.equal( 'SelectAllUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( SelectAllUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( SelectAllUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'the "selectAll" button', () => {
		it( 'should be an instance of ButtonView', () => {
			expect( button ).to.be.instanceOf( ButtonView );
		} );

		it( 'should have a label', () => {
			expect( button.label ).to.equal( 'Select all' );
		} );

		it( 'should have an icon', () => {
			expect( button.icon ).to.match( /^<svg/ );
		} );

		it( 'should have a keystroke', () => {
			expect( button.keystroke ).to.equal( 'Ctrl+A' );
		} );

		it( 'should have a tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );

		it( 'should have #isEnabled bound to the command state', () => {
			expect( button.isEnabled ).to.be.true;

			editor.commands.get( 'selectAll' ).isEnabled = false;

			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should execute the "selectAll" command and focus the editing view', () => {
			sinon.spy( editor, 'execute' );
			sinon.spy( editor.editing.view, 'focus' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'selectAll' );
			sinon.assert.calledOnce( editor.editing.view.focus );
		} );
	} );

	describe( 'the "selectAll" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'selectAll' );
		} );

		testButton( 'selectAll', 'Select all', ButtonView );

		it( 'should have tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );
	} );

	describe( 'the "menuBar:selectAll" menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:selectAll' );
		} );

		testButton( 'selectAll', 'Select all', MenuBarMenuListItemButtonView );
	} );

	function testButton( featureName, label, Component ) {
		it( 'should register feature component', () => {
			expect( button ).to.be.instanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).to.be.false;
			expect( button.label ).to.equal( label );
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
	}
} );
