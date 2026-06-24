/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { keyCodes, KeystrokeHandler, FocusTracker } from '@ckeditor/ckeditor5-utils';
import { TextAlternativeFormView } from '../../../src/imagetextalternative/ui/textalternativeformview.js';
import { View, FocusCycler, ViewCollection } from '@ckeditor/ckeditor5-ui';

describe( 'TextAlternativeFormView', () => {
	let view;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		view = new TextAlternativeFormView( { t: () => {} } );
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			view.render();

			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-form' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-text-alternative-form' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-responsive-form' ) ).toBe( true );
			expect( view.element.getAttribute( 'tabindex' ) ).toBe( '-1' );
		} );

		it( 'should create #focusTracker instance', () => {
			expect( view.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'should create child views', () => {
			expect( view.labeledInput ).toBeInstanceOf( View );
			expect( view.saveButtonView ).toBeInstanceOf( View );
			expect( view.backButtonView ).toBeInstanceOf( View );

			view.render();
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( view._focusCycler ).toBeInstanceOf( FocusCycler );
		} );

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should create header element at the top', () => {
			view.render();

			const header = view.children.first;

			expect( header.children.last.element.classList.contains( 'ck-form__header__label' ) ).toBe( true );
		} );

		it( 'should fire `cancel` event on backButtonView#execute', () => {
			const spy = vi.fn();
			view.on( 'cancel', spy );
			view.backButtonView.fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'render()', () => {
		it( 'starts listening for #keystrokes coming from #element', () => {
			const spy = vi.spyOn( view.keystrokes, 'listenTo' );

			view.render();
			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( view.element );
		} );

		describe( 'focus cycling and management', () => {
			it( 'should register child views in #_focusables', () => {
				view.render();

				expect( view._focusables.map( f => f ) ).toEqual(
					expect.arrayContaining( [
						view.backButtonView,
						view.labeledInput,
						view.saveButtonView
					] )
				);
			} );

			it( 'should register child views\' #element in #focusTracker', () => {
				const spy = vi.spyOn( view.focusTracker, 'add' );

				view.render();

				expect( spy ).toHaveBeenNthCalledWith( 1, view.backButtonView.element );
				expect( spy ).toHaveBeenNthCalledWith( 2, view.labeledInput.element );
				expect( spy ).toHaveBeenNthCalledWith( 3, view.saveButtonView.element );
			} );

			describe( 'activates keyboard navigation in the form', () => {
				beforeEach( () => {
					view.render();
					document.body.appendChild( view.element );
				} );

				afterEach( () => {
					view.element.remove();
					view.destroy();
				} );

				it( 'so "tab" focuses the next focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the url input is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.labeledInput.element;

					const spy = vi.spyOn( view.saveButtonView, 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( 'so "shift + tab" focuses the previous focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the cancel button is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.backButtonView.element;

					const spy = vi.spyOn( view.saveButtonView, 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
					expect( spy ).toHaveBeenCalledOnce();
				} );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = vi.spyOn( view.focusTracker, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = vi.spyOn( view.keystrokes, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'submit event', () => {
			it( 'should trigger submit event', () => {
				const spy = vi.fn();

				view.render();
				view.on( 'submit', spy );
				view.element.dispatchEvent( new Event( 'submit' ) );

				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );
} );
