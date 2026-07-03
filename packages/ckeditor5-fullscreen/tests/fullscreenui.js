/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { global, env } from '@ckeditor/ckeditor5-utils';
import { IconFullscreenEnter, IconFullscreenLeave } from '@ckeditor/ckeditor5-icons';

import { FullscreenEditing } from '../src/fullscreenediting.js';
import { FullscreenUI } from '../src/fullscreenui.js';

describe( 'FullscreenUI', () => {
	let domElement, editor;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Essentials,
				FullscreenUI
			]
		} );
	} );

	afterEach( () => {
		domElement.remove();
		return editor.destroy();
	} );

	it( 'should have proper "requires" value', () => {
		expect( FullscreenUI.requires ).toEqual( [ FullscreenEditing ] );
	} );

	it( 'should have proper name', () => {
		expect( FullscreenUI.pluginName ).toBe( 'FullscreenUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FullscreenUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should register UI components', () => {
		expect( editor.ui.componentFactory.has( 'fullscreen' ) ).toBe( true );
		expect( editor.ui.componentFactory.has( 'menuBar:fullscreen' ) ).toBe( true );
	} );

	describe( 'Fullscreen mode toolbar button', () => {
		let button;

		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'fullscreen' );
		} );

		it( 'should have the base properties', () => {
			expect( button ).toHaveProperty( 'tooltip', true );
			expect( button ).toHaveProperty( 'isToggleable', true );
		} );

		it( '#isEnabled, #icon and #label should be bound to the `toggleFullscreen` command', () => {
			const fullscreenCommand = editor.commands.get( 'toggleFullscreen' );

			fullscreenCommand.isEnabled = false;

			expect( button.isEnabled ).toBe( false );

			fullscreenCommand.isEnabled = true;

			expect( button.isEnabled ).toBe( true );

			fullscreenCommand.value = true;

			expect( button.icon ).toBe( IconFullscreenLeave );
			expect( button.label ).toBe( 'Leave fullscreen mode' );

			fullscreenCommand.value = false;

			expect( button.icon ).toBe( IconFullscreenEnter );
			expect( button.label ).toBe( 'Enter fullscreen mode' );
		} );

		describe( 'on #execute', () => {
			it( 'should call the `fullscreen` command', () => {
				const spy = vi.spyOn( editor.commands.get( 'toggleFullscreen' ), 'execute' );

				button.fire( 'execute' );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should force toolbar blur on non-Chromium browsers', () => {
				vi.spyOn( env, 'isBlink', 'get' ).mockReturnValue( false );

				editor.ui.view.toolbar.items.add( button );

				// Focus the toolbar button when entering fullscreen mode.
				editor.ui.view.toolbar.focusTracker.focusedElement = editor.ui.view.toolbar.items.first.element;

				button.fire( 'execute' );

				expect( editor.ui.view.toolbar.focusTracker.focusedElement ).toBeNull();

				// Focus the toolbar button when leaving fullscreen mode.
				editor.ui.view.toolbar.focusTracker.focusedElement = editor.ui.view.toolbar.items.first.element;

				button.fire( 'execute' );

				expect( editor.ui.view.toolbar.focusTracker.focusedElement ).toBeNull();
			} );

			it( 'should focus the editable element', () => {
				const spy = vi.spyOn( editor.editing.view, 'focus' );

				button.fire( 'execute' );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should scroll to the selection', () => {
				const spy = vi.spyOn( editor.editing.view, 'scrollToTheSelection' );

				button.fire( 'execute' );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );

	describe( 'Fullscreen mode menu bar button', () => {
		let button;

		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:fullscreen' );
		} );

		it( 'should have the base properties', () => {
			expect( button ).toHaveProperty( 'tooltip', false );
			expect( button ).toHaveProperty( 'isToggleable', true );
			expect( button ).toHaveProperty( 'role', 'menuitemcheckbox' );
			expect( button ).toHaveProperty( 'label', 'Fullscreen mode' );
		} );

		it( '#isEnabled and #isOn should be bound to the `toggleFullscreen` command', () => {
			const fullscreenCommand = editor.commands.get( 'toggleFullscreen' );

			fullscreenCommand.isEnabled = false;

			expect( button.isEnabled ).toBe( false );

			fullscreenCommand.isEnabled = true;

			expect( button.isEnabled ).toBe( true );

			fullscreenCommand.value = true;

			expect( button.isOn ).toBe( true );

			fullscreenCommand.value = false;

			expect( button.isOn ).toBe( false );
		} );

		describe( 'on #execute', () => {
			it( 'should call the `fullscreen` command', () => {
				const spy = vi.spyOn( editor.commands.get( 'toggleFullscreen' ), 'execute' );

				button.fire( 'execute' );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			// This test is purely technical. It's currently impossible to reproduce such a situation
			// in the browser.
			it( 'should force toolbar blur on non-Chromium browsers', () => {
				vi.spyOn( env, 'isBlink', 'get' ).mockReturnValue( false );

				editor.ui.view.toolbar.items.add( button );

				// Focus the toolbar button when entering fullscreen mode.
				editor.ui.view.toolbar.focusTracker.focusedElement = editor.ui.view.toolbar.items.first.element;

				button.fire( 'execute' );

				expect( editor.ui.view.toolbar.focusTracker.focusedElement ).toBeNull();

				// Focus the toolbar button when leaving fullscreen mode.
				editor.ui.view.toolbar.focusTracker.focusedElement = editor.ui.view.toolbar.items.first.element;

				button.fire( 'execute' );

				expect( editor.ui.view.toolbar.focusTracker.focusedElement ).toBeNull();
			} );

			it( 'should focus the editable element', () => {
				const spy = vi.spyOn( editor.editing.view, 'focus' );

				button.fire( 'execute' );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should scroll to the selection', () => {
				const spy = vi.spyOn( editor.editing.view, 'scrollToTheSelection' );

				button.fire( 'execute' );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );
} );
