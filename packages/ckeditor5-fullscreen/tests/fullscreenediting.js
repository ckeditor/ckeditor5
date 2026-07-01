/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { global, keyCodes, env } from '@ckeditor/ckeditor5-utils';

import { FullscreenEditing } from '../src/fullscreenediting.js';
import { FullscreenCommand } from '../src/fullscreencommand.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

describe( 'FullscreenEditing', () => {
	let domElement, editor;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Essentials,
				FullscreenEditing
			]
		} );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		domElement.remove();
		return editor.destroy();
	} );

	it( 'should have proper name', () => {
		expect( FullscreenEditing.pluginName ).toBe( 'FullscreenEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FullscreenEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should register the `fullscreen` command', () => {
		expect( editor.commands.get( 'toggleFullscreen' ) ).toBeInstanceOf( FullscreenCommand );
	} );

	it( 'should define the `fullscreen.menuBar.isVisible` config option to `true`', () => {
		expect( editor.config.get( 'fullscreen.menuBar.isVisible' ) ).toBe( true );
	} );

	it( 'should set the `fullscreen.toolbar.shouldNotGroupWhenFull` config to value of `toolbar.shouldNotGroupWhenFull`', async () => {
		expect( editor.config.get( 'fullscreen.toolbar.shouldNotGroupWhenFull' ) ).toBe( false );

		const tempDomElement = global.document.createElement( 'div' );
		global.document.body.appendChild( tempDomElement );

		const tempEditor = await ClassicEditor.create( tempDomElement, {
			plugins: [
				Paragraph,
				Essentials,
				FullscreenEditing
			],
			toolbar: {
				shouldNotGroupWhenFull: true
			}
		} );

		expect( tempEditor.config.get( 'fullscreen.toolbar.shouldNotGroupWhenFull' ) ).toBe( true );

		tempDomElement.remove();
		return tempEditor.destroy();
	} );

	it( 'should register keystrokes on init', () => {
		const spy = vi.spyOn( editor.keystrokes, 'set' );
		editor.plugins.get( 'FullscreenEditing' ).init();

		expect( spy ).toHaveBeenCalledTimes( 1 );
	} );

	describe( 'on Ctrl+Shift+F keystroke combination', () => {
		const keyEventData = {
			keyCode: keyCodes.f,
			ctrlKey: !env.isMac,
			metaKey: env.isMac,
			shiftKey: true,
			preventDefault: vi.fn(),
			stopPropagation: vi.fn()
		};

		it( 'should toggle fullscreen mode', () => {
			const spy = vi.spyOn( editor, 'execute' );

			editor.keystrokes.press( keyEventData );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy ).toHaveBeenCalledWith( 'toggleFullscreen' );

			editor.keystrokes.press( keyEventData );

			expect( spy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should force editable and toolbar blur on non-Chromium browsers', () => {
			vi.spyOn( env, 'isBlink', 'get' ).mockReturnValue( false );

			// Add button to the toolbar.
			const buttonView = new ButtonView();
			buttonView.render();
			editor.ui.view.toolbar.items.add( buttonView );

			// Focus the toolbar button when entering fullscreen mode.
			editor.ui.view.toolbar.focusTracker.focusedElement = editor.ui.view.toolbar.items.first.element;

			editor.keystrokes.press( keyEventData );

			expect( global.document.activeElement ).toBe( editor.ui.getEditableElement() );
			expect( editor.ui.view.toolbar.focusTracker.focusedElement ).toBeNull();

			// Focus the toolbar button when leaving fullscreen mode.
			editor.ui.view.toolbar.focusTracker.focusedElement = editor.ui.view.toolbar.items.first.element;
			editor.keystrokes.press( keyEventData );

			expect( global.document.activeElement ).toBe( editor.ui.getEditableElement() );
			expect( editor.ui.view.toolbar.focusTracker.focusedElement ).toBeNull();
		} );

		it( 'should focus the editable element', () => {
			const spy = vi.spyOn( editor.editing.view, 'focus' );

			editor.keystrokes.press( keyEventData );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should scroll to the selection', () => {
			const spy = vi.spyOn( editor.editing.view, 'scrollToTheSelection' );

			editor.keystrokes.press( keyEventData );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
