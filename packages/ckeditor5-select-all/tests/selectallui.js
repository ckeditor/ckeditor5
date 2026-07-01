/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { SelectAllEditing } from '../src/selectallediting.js';
import { SelectAllUI } from '../src/selectallui.js';

describe( 'SelectAllUI', () => {
	let editor, editorElement, button;

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
		vi.restoreAllMocks();

		return editor.destroy();
	} );

	it( 'should have a name', () => {
		expect( SelectAllUI.pluginName ).toBe( 'SelectAllUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( SelectAllUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( SelectAllUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'the "selectAll" button', () => {
		it( 'should be an instance of ButtonView', () => {
			expect( button ).toBeInstanceOf( ButtonView );
		} );

		it( 'should have a label', () => {
			expect( button.label ).toBe( 'Select all' );
		} );

		it( 'should have an icon', () => {
			expect( button.icon ).toMatch( /^<svg/ );
		} );

		it( 'should have a keystroke', () => {
			expect( button.keystroke ).toBe( 'Ctrl+A' );
		} );

		it( 'should have a tooltip', () => {
			expect( button.tooltip ).toBe( true );
		} );

		it( 'should have #isEnabled bound to the command state', () => {
			expect( button.isEnabled ).toBe( true );

			editor.commands.get( 'selectAll' ).isEnabled = false;

			expect( button.isEnabled ).toBe( false );
		} );

		it( 'should execute the "selectAll" command and focus the editing view', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

			button.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledTimes( 1 );
			expect( executeSpy ).toHaveBeenCalledWith( 'selectAll' );
			expect( focusSpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'the "selectAll" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'selectAll' );
		} );

		testButton( 'selectAll', 'Select all', ButtonView );

		it( 'should have tooltip', () => {
			expect( button.tooltip ).toBe( true );
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
			expect( button ).toBeInstanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).toBe( false );
			expect( button.label ).toBe( label );
		} );

		it( `should execute ${ featureName } command on model execute event and focus the view`, () => {
			const executeSpy = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' ).mockImplementation( () => {} );

			button.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledTimes( 1 );
			expect( executeSpy ).toHaveBeenCalledWith( featureName );
			expect( focusSpy ).toHaveBeenCalledTimes( 1 );
			expect( executeSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( focusSpy.mock.invocationCallOrder[ 0 ] );
		} );

		it( `should bind #isEnabled to ${ featureName } command`, () => {
			const command = editor.commands.get( featureName );

			expect( button.isOn ).toBe( false );

			const initState = command.isEnabled;
			expect( button.isEnabled ).toBe( initState );

			command.isEnabled = !initState;
			expect( button.isEnabled ).toBe( !initState );
		} );
	}
} );
