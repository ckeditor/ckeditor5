/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconRemoveFormat } from 'ckeditor5/src/icons.js';
import RemoveFormat from '../src/removeformat.js';
import RemoveFormatUI from '../src/removeformatui.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import {
	_clear as clearTranslations,
	add as addTranslations
} from '@ckeditor/ckeditor5-utils/src/translation-service.js';

describe( 'RemoveFormatUI', () => {
	let editor, element, button;

	testUtils.createSinonSandbox();

	before( () => {
		addTranslations( 'en', {
			'Remove Format': 'Remove Format'
		} );

		addTranslations( 'pl', {
			'Remove Format': 'Usuń formatowanie'
		} );
	} );

	after( () => {
		clearTranslations();
	} );

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ RemoveFormat, RemoveFormatUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
				button = editor.ui.componentFactory.create( 'removeFormat' );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( RemoveFormatUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( RemoveFormatUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'the "removeFormat" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'removeFormat' );
		} );

		testButton( 'removeFormat', 'Remove Format', ButtonView );

		it( 'should have tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );
	} );

	describe( 'the "menuBar:removeFormat" menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:removeFormat' );
		} );

		testButton( 'removeFormat', 'Remove Format', MenuBarMenuListItemButtonView );
	} );

	function testButton( featureName, label, Component ) {
		it( 'should register feature component', () => {
			expect( button ).to.be.instanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).to.be.false;
			expect( button.label ).to.equal( label );
			expect( button.icon ).to.equal( IconRemoveFormat );
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
