/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { HorizontalLineEditing } from '../src/horizontallineediting.js';
import { HorizontalLineUI } from '../src/horizontallineui.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { IconHorizontalLine } from '@ckeditor/ckeditor5-icons';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

describe( 'HorizontalLineUI', () => {
	let editor, editorElement, button;

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
		expect( HorizontalLineUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( HorizontalLineUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'the "horizontalLine" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'horizontalLine' );
		} );

		testButton( 'horizontalLine', 'Horizontal line', ButtonView );

		it( 'should have tooltip', () => {
			expect( button.tooltip ).toBe( true );
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
			expect( button.isOn ).toBe( false );
			expect( button.label ).toEqual( label );
			expect( button.icon ).toEqual( IconHorizontalLine );
		} );

		it( `should execute ${ featureName } command on model execute event and focus the view`, () => {
			const executeSpy = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' ).mockImplementation( () => {} );

			button.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( featureName );
			expect( focusSpy ).toHaveBeenCalledOnce();
			expect( executeSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( focusSpy.mock.invocationCallOrder[ 0 ] );
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
