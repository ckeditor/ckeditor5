/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeAll, afterAll, beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { IconRemoveFormat } from '@ckeditor/ckeditor5-icons';
import { RemoveFormat } from '../src/removeformat.js';
import { RemoveFormatUI } from '../src/removeformatui.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import {
	_clearTranslations,
	add as addTranslations
} from '@ckeditor/ckeditor5-utils';

describe( 'RemoveFormatUI', () => {
	let editor, element, button;

	beforeAll( () => {
		addTranslations( 'en', {
			'Remove Format': 'Remove Format'
		} );

		addTranslations( 'pl', {
			'Remove Format': 'Usuń formatowanie'
		} );
	} );

	afterAll( () => {
		_clearTranslations();
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
		expect( RemoveFormatUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( RemoveFormatUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'the "removeFormat" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'removeFormat' );
		} );

		testButton( 'removeFormat', 'Remove Format', ButtonView );

		it( 'should have tooltip', () => {
			expect( button.tooltip ).toBe( true );
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
			expect( button.isOn ).toBe( false );
			expect( button.label ).toEqual( label );
			expect( button.icon ).toEqual( IconRemoveFormat );
		} );

		it( `should execute ${ featureName } command on model execute event and focus the view`, () => {
			const executeSpy = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' ).mockImplementation( () => {} );

			button.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledExactlyOnceWith( featureName );
			expect( focusSpy ).toHaveBeenCalledOnce();
			expect( executeSpy.mock.invocationCallOrder[ 0 ] )
				.toBeLessThan( focusSpy.mock.invocationCallOrder[ 0 ] );
		} );

		it( `should bind #isEnabled to ${ featureName } command`, () => {
			const command = editor.commands.get( featureName );

			expect( button.isOn ).toBe( false );

			const initState = command.isEnabled;
			expect( button.isEnabled ).toEqual( initState );

			command.isEnabled = !initState;
			expect( button.isEnabled ).toEqual( !initState );
		} );
	}
} );
