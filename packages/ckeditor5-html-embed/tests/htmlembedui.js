/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HtmlEmbedEditing } from '../src/htmlembedediting.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { HtmlEmbedUI } from '../src/htmlembedui.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { IconHtml } from '@ckeditor/ckeditor5-icons';

describe( 'HtmlEmbedUI', () => {
	let element, editor, button;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ HtmlEmbedUI, HtmlEmbedEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();
		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HtmlEmbedUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( HtmlEmbedUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'the "htmlEmbed" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'htmlEmbed' );
		} );

		testButton( 'htmlEmbed', 'Insert HTML', ButtonView );

		it( 'should have #tooltip', () => {
			expect( button.tooltip ).toBe( true );
		} );
	} );

	describe( 'the "menuBar:htmlEmbed" menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:htmlEmbed' );
		} );

		testButton( 'htmlEmbed', 'HTML snippet', MenuBarMenuListItemButtonView );
	} );

	function testButton( featureName, label, Component ) {
		it( 'should register feature component', () => {
			expect( button ).toBeInstanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).toBe( false );
			expect( button.label ).toBe( label );
			expect( button.icon ).toBe( IconHtml );
		} );

		it( `should execute ${ featureName } command on model execute event and focus the view then switch to edit source mode` +
			'after inserting the element', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

			button.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledTimes( 1 );
			expect( executeSpy ).toHaveBeenCalledWith( featureName );
			expect( focusSpy ).toHaveBeenCalledTimes( 1 );
			expect( executeSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( focusSpy.mock.invocationCallOrder[ 0 ] );

			expect( document.activeElement.tagName ).toBe( 'TEXTAREA' );
			expect( document.activeElement.classList.contains( 'raw-html-embed__source' ) ).toBe( true );
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
