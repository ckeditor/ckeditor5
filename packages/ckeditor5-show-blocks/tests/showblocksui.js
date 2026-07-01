/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IconShowBlocks } from '@ckeditor/ckeditor5-icons';
import { global } from '@ckeditor/ckeditor5-utils';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

import { ShowBlocksEditing } from '../src/showblocksediting.js';
import { ShowBlocksUI } from '../src/showblocksui.js';

describe( 'ShowBlocksUI', () => {
	let editor, element, button;

	beforeEach( () => {
		element = global.document.createElement( 'div' );
		global.document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ ShowBlocksEditing, ShowBlocksUI, SourceEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		element.remove();

		return editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( ShowBlocksUI.pluginName ).toBe( 'ShowBlocksUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ShowBlocksUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ShowBlocksUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'the "showBlocks" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'showBlocks' );
		} );

		testButton( 'showBlocks', 'Show blocks', ButtonView );

		it( 'should have tooltip', () => {
			expect( button.tooltip ).toBe( true );
		} );

		it( 'should have an icon', () => {
			expect( button.icon ).toBe( IconShowBlocks );
		} );
	} );

	describe( 'the menuBar:showBlocks menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:showBlocks' );
		} );

		testButton( 'showBlocks', 'Show blocks', MenuBarMenuListItemButtonView );

		it( 'should create button with `menuitemcheckbox` role', () => {
			expect( button.role ).toBe( 'menuitemcheckbox' );
		} );

		it( 'should bind `isOn` to `aria-checked` attribute', () => {
			button.render();

			button.isOn = true;
			expect( button.element.getAttribute( 'aria-checked' ) ).toBe( 'true' );

			button.isOn = false;
			expect( button.element.getAttribute( 'aria-checked' ) ).toBe( 'false' );
		} );
	} );

	function testButton( featureName, label, Component ) {
		it( 'should register feature component', () => {
			expect( button ).toBeInstanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).toBe( false );
			expect( button.isToggleable ).toBe( true );
			expect( button.label ).toBe( label );
		} );

		it( `should execute ${ featureName } command on model execute event and focus the view`, () => {
			const executeSpy = vi.spyOn( editor, 'execute' );
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

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

		it( `should bind #isOn to ${ featureName } command`, () => {
			const command = editor.commands.get( featureName );

			command.value = false;
			command.isEnabled = true;
			expect( button.isOn ).toBe( false );

			command.value = true;
			command.isEnabled = true;
			expect( button.isOn ).toBe( true );

			command.value = true;
			command.isEnabled = false;
			expect( button.isOn ).toBe( false );
		} );
	}
} );
