/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ButtonView, FormHeaderView } from '@ckeditor/ckeditor5-ui';
import { IconPreviousArrow } from '@ckeditor/ckeditor5-icons';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import { EmojiPickerFormView } from '../../src/ui/emojipickerformview.js';

describe( 'EmojiPickerFormView', () => {
	let view;

	beforeEach( () => {
		view = new EmojiPickerFormView( { t: str => str } );

		vi.spyOn( view.keystrokes, 'listenTo' );

		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-form' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-emoji-picker-form' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-responsive-form' ) ).toBe( true );
		} );

		it( 'should create child views', () => {
			expect( view.backButtonView ).toBeInstanceOf( ButtonView );
			expect( view.children.first ).toBeInstanceOf( FormHeaderView );
		} );

		it( 'should create back button with proper attributes', () => {
			expect( view.backButtonView.label ).toBe( 'Back' );
			expect( view.backButtonView.icon ).toBe( IconPreviousArrow );
			expect( view.backButtonView.class ).toBe( 'ck-button-back' );
			expect( view.backButtonView.tooltip ).toBe( true );
		} );

		it( 'should delegate back button execute event to cancel', () => {
			const spy = vi.fn();

			view.on( 'cancel', spy );
			view.backButtonView.fire( 'execute' );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should create header view with proper label', () => {
			expect( view.children.first ).toBeInstanceOf( FormHeaderView );
			expect( view.children.first.label ).toBe( 'Emoji picker' );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in _focusables collection', () => {
			expect( [ ...view._focusables ] ).toHaveLength( 1 );
		} );

		it( 'should register #element in keystrokes manager', () => {
			expect( view.keystrokes.listenTo ).toHaveBeenCalledTimes( 1 );
			expect( view.keystrokes.listenTo ).toHaveBeenCalledWith( view.element );
		} );

		describe( 'activates keyboard navigation in the form', () => {
			beforeEach( () => {
				view.element.remove();
				view.destroy();
			} );

			it( 'so "tab" focuses on the next focusable item', () => {
				view = new EmojiPickerFormView( { t: str => str } );

				const cancelButtonView = new ButtonView();

				view.children.add( cancelButtonView );
				view.render();
				document.body.appendChild( view.element );

				// Mock the cancel button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = cancelButtonView.element;

				// The back button is focused.
				const spy = vi.spyOn( view.backButtonView, 'focus' );

				// Fire tab event.
				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'so "shift + tab" focuses on the previous focusable item', () => {
				view = new EmojiPickerFormView( { t: str => str } );

				const cancelButtonView = new ButtonView();

				view.children.add( cancelButtonView );
				view.render();
				document.body.appendChild( view.element );

				// Mock the cancel button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.backButtonView.element;

				// The back button is focused.
				const spy = vi.spyOn( cancelButtonView, 'focus' );

				// Fire tab event.
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = vi.spyOn( view.focusTracker, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = vi.spyOn( view.keystrokes, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first focusable element in the form', () => {
			view.focus();

			expect( document.activeElement ).toBe( view.backButtonView.element );
		} );
	} );
} );
