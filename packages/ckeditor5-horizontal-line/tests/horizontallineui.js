/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import HorizontalLineEditing from '../src/horizontallineediting.js';
import HorizontalLineUI from '../src/horizontallineui.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { IconHorizontalLine } from 'ckeditor5/src/icons.js';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

describe( 'HorizontalLineUI', () => {
	let editor, editorElement, button;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, HorizontalLineEditing, HorizontalLineUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		return editor.destroy()
			.then( () => {
				editorElement.remove();
			} );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HorizontalLineUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( HorizontalLineUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'the "horizontalLine" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'horizontalLine' );
		} );

		testButton( 'horizontalLine', 'Horizontal line', ButtonView );

		it( 'should have tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );
	} );

	describe( 'the "menuBar:horizontalLine" menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:horizontalLine' );
		} );

		testButton( 'horizontalLine', 'Horizontal line', MenuBarMenuListItemButtonView );
	} );

	function testButton( featureName, label, Component ) {
		it( 'should register feature component', () => {
			expect( button ).to.be.instanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).to.be.false;
			expect( button.label ).to.equal( label );
			expect( button.icon ).to.equal( IconHorizontalLine );
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
