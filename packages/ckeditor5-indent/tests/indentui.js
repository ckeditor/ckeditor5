/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconIndent, IconOutdent } from 'ckeditor5/src/icons.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';

import IndentEditing from '../src/indentediting.js';
import IndentUI from '../src/indentui.js';

describe( 'IndentUI', () => {
	let editor, rtlEditor, element, button, rtlButton;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor
			.create( element, { plugins: [ IndentUI, IndentEditing ] } );

		rtlEditor = await ClassicTestEditor
			.create( element, {
				plugins: [ IndentUI, IndentEditing ],
				language: 'ar'
			} );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
		await rtlEditor.destroy();
	} );

	it( 'should be named', () => {
		expect( IndentUI.pluginName ).to.equal( 'IndentUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( IndentUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( IndentUI.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( IndentUI ) ).to.be.instanceOf( IndentUI );
	} );

	describe( 'toolbar buttons', () => {
		describe( '"indent" button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'indent' );
				rtlButton = rtlEditor.ui.componentFactory.create( 'indent' );
			} );

			testButton( 'indent', 'Increase indent', {
				ltrIcon: IconIndent,
				rtlIcon: IconOutdent
			}, ButtonView );

			it( 'should have tooltip', () => {
				expect( button.tooltip ).to.be.true;
			} );
		} );

		describe( '"outdent" button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'outdent' );
				rtlButton = rtlEditor.ui.componentFactory.create( 'outdent' );
			} );

			testButton( 'outdent', 'Decrease indent', {
				ltrIcon: IconOutdent,
				rtlIcon: IconIndent
			}, ButtonView );

			it( 'should have tooltip', () => {
				expect( button.tooltip ).to.be.true;
			} );
		} );
	} );

	describe( 'menu bar buttons', () => {
		describe( '"menuBar:indent" button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'menuBar:indent' );
				rtlButton = rtlEditor.ui.componentFactory.create( 'menuBar:indent' );
			} );

			testButton( 'indent', 'Increase indent', {
				ltrIcon: IconIndent,
				rtlIcon: IconOutdent
			}, ButtonView );
		} );

		describe( '"menuBar:outdent" button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'menuBar:outdent' );
				rtlButton = rtlEditor.ui.componentFactory.create( 'menuBar:outdent' );
			} );

			testButton( 'outdent', 'Decrease indent', {
				ltrIcon: IconOutdent,
				rtlIcon: IconIndent
			}, ButtonView );
		} );
	} );

	function testButton( featureName, label, { ltrIcon, rtlIcon }, Component ) {
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

		describe( 'icons and UI language', () => {
			describe( 'left–to–right UI', () => {
				it( 'should display the correct icon', () => {
					expect( button.icon ).to.equal( ltrIcon );
				} );
			} );

			describe( 'right–to–left UI', () => {
				it( 'should display the correct icon', () => {
					expect( rtlButton.icon ).to.equal( rtlIcon );
				} );
			} );
		} );
	}
} );
