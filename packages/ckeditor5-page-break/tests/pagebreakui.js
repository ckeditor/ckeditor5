/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IconPageBreak } from '@ckeditor/ckeditor5-icons';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { PageBreakEditing } from '../src/pagebreakediting.js';
import { PageBreakUI } from '../src/pagebreakui.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

describe( 'PageBreakUI', () => {
	let editor, editorElement, button;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, PageBreakEditing, PageBreakUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
		editorElement.remove();
		vi.restoreAllMocks();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( PageBreakUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( PageBreakUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'the "pageBreak" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'pageBreak' );
		} );

		testButton( 'pageBreak', 'Page break', ButtonView );

		it( 'should have tooltip', () => {
			expect( button.tooltip ).toBe( true );
		} );
	} );

	describe( 'the "menuBar:pageBreak" menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:pageBreak' );
		} );

		testButton( 'pageBreak', 'Page break', MenuBarMenuListItemButtonView );
	} );

	function testButton( featureName, label, Component ) {
		it( 'should register feature component', () => {
			expect( button ).toBeInstanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).toBe( false );
			expect( button.label ).toBe( label );
			expect( button.icon ).toBe( IconPageBreak );
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
	}
} );
