/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconPilcrow } from '@ckeditor/ckeditor5-icons';
import { global } from '@ckeditor/ckeditor5-utils';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { ShowWhitespaceEditing } from '../src/showwhitespaceediting.js';
import { ShowWhitespaceUI } from '../src/showwhitespaceui.js';

describe( 'ShowWhitespaceUI', () => {
	let editor, element, button;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = global.document.createElement( 'div' );
		global.document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ ShowWhitespaceEditing, ShowWhitespaceUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( ShowWhitespaceUI.pluginName ).to.equal( 'ShowWhitespaceUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ShowWhitespaceUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ShowWhitespaceUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'the "showWhitespace" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'showWhitespace' );
		} );

		testButton( 'showWhitespace', 'Show whitespace', ButtonView );

		it( 'should have tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );

		it( 'should have an icon', () => {
			expect( button.icon ).to.equal( IconPilcrow );
		} );
	} );

	describe( 'the menuBar:showWhitespace menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:showWhitespace' );
		} );

		testButton( 'showWhitespace', 'Show whitespace', MenuBarMenuListItemButtonView );

		it( 'should create button with `menuitemcheckbox` role', () => {
			expect( button.role ).to.equal( 'menuitemcheckbox' );
		} );

		it( 'should bind `isOn` to `aria-checked` attribute', () => {
			button.render();

			button.isOn = true;
			expect( button.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'true' );

			button.isOn = false;
			expect( button.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'false' );
		} );
	} );

	function testButton( featureName, label, Component ) {
		it( 'should register feature component', () => {
			expect( button ).to.be.instanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).to.be.false;
			expect( button.isToggleable ).to.be.true;
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

		it( `should bind #isOn to ${ featureName } command`, () => {
			const command = editor.commands.get( featureName );

			command.value = false;
			command.isEnabled = true;
			expect( button.isOn ).to.be.false;

			command.value = true;
			command.isEnabled = true;
			expect( button.isOn ).to.be.true;

			command.value = true;
			command.isEnabled = false;
			expect( button.isOn ).to.be.false;
		} );
	}
} );
