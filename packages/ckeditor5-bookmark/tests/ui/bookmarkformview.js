/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { BookmarkFormView } from '../../src/ui/bookmarkformview.js';
import { View, FocusCycler, FormHeaderView, FormRowView, ViewCollection } from '@ckeditor/ckeditor5-ui';
import { keyCodes, KeystrokeHandler, FocusTracker } from '@ckeditor/ckeditor5-utils';

describe( 'BookmarkFormView', () => {
	let view;

	beforeEach( () => {
		view = new BookmarkFormView( { t: val => val } );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-form' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-responsive-form' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-bookmark-form' ) ).toBe( true );
			expect( view.element.getAttribute( 'tabindex' ) ).toEqual( '-1' );
		} );

		it( 'should create child views', () => {
			expect( view.idInputView ).toBeInstanceOf( View );
			expect( view.saveButtonView ).toBeInstanceOf( View );
			expect( view.backButtonView ).toBeInstanceOf( View );

			expect( view.saveButtonView.element.classList.contains( 'ck-button-action' ) ).toBe( true );
			expect( view.saveButtonView.element.classList.contains( 'ck-button-bold' ) ).toBe( true );

			expect( view.children.get( 0 ) ).toBeInstanceOf( FormHeaderView );
			expect( view.children.get( 1 ) ).toBeInstanceOf( View );

			const formRowView = view.children.get( 1 );

			expect( formRowView ).toBeInstanceOf( FormRowView );
			expect( formRowView.element.classList.contains( 'ck' ) ).toBe( true );
			expect( formRowView.element.classList.contains( 'ck-form__row' ) ).toBe( true );
			expect( formRowView.element.classList.contains( 'ck-form__row_with-submit' ) ).toBe( true );
			expect( formRowView.element.classList.contains( 'ck-form__row_large-top-padding' ) ).toBe( true );
			expect( formRowView.children.get( 0 ) ).toEqual( view.idInputView );
			expect( formRowView.children.get( 1 ) ).toEqual( view.saveButtonView );

			const formHeaderView = view.children.get( 0 );

			expect( formHeaderView.element.classList.contains( 'ck' ) ).toBe( true );
			expect( formHeaderView.element.classList.contains( 'ck-form__header' ) ).toBe( true );
			expect( formHeaderView.children.get( 0 ) ).toEqual( view.backButtonView );
		} );

		it( 'should create back button view with proper classes', () => {
			expect( view.backButtonView.element.classList.contains( 'ck-button' ) ).toBe( true );
			expect( view.backButtonView.element.classList.contains( 'ck-button-back' ) ).toBe( true );
		} );

		it( 'should create #focusTracker instance', () => {
			expect( view.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( view._focusCycler ).toBeInstanceOf( FocusCycler );
		} );

		it( 'should fire `cancel` event on backButtonView#execute', () => {
			const spy = vi.fn();
			view.on( 'cancel', spy );
			view.backButtonView.fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should create id input with inputmode=text', () => {
			expect( view.idInputView.fieldView.inputMode ).toEqual( 'text' );
		} );

		it( 'should have proper label', () => {
			expect( view.idInputView.label ).toEqual( 'Bookmark name' );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).toEqual( expect.arrayContaining( [
				view.backButtonView,
				view.idInputView,
				view.saveButtonView
			] ) );
		} );

		it( 'should register child views\' #element in #focusTracker', () => {
			const view = new BookmarkFormView( { t: () => {} } );

			const spy = vi.spyOn( view.focusTracker, 'add' );

			view.render();

			expect( spy.mock.calls[ 0 ] ).toEqual( [ view.backButtonView.element ] );
			expect( spy.mock.calls[ 1 ] ).toEqual( [ view.idInputView.element ] );
			expect( spy.mock.calls[ 2 ] ).toEqual( [ view.saveButtonView.element ] );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new BookmarkFormView( { t: () => {} } );

			const spy = vi.spyOn( view.keystrokes, 'listenTo' );

			view.render();
			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( view.element );

			view.destroy();
		} );

		describe( 'activates keyboard navigation for the form', () => {
			it( 'so "tab" focuses the next focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// Mock the url input is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.idInputView.element;

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
				view.focusTracker.focusedElement = view.idInputView.element;

				const spy = vi.spyOn( view.backButtonView, 'focus' );

				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'isValid()', () => {
		it( 'should reset error after successful validation', () => {
			const view = new BookmarkFormView( { t: () => {} }, [
				() => undefined
			] );

			expect( view.isValid() ).toBe( true );
			expect( view.idInputView.errorText ).toBeNull();
		} );

		it( 'should display first error returned from validators list', () => {
			const view = new BookmarkFormView( { t: () => {} }, [
				() => undefined,
				() => 'Foo bar',
				() => 'Another error'
			] );

			expect( view.isValid() ).toBe( false );
			expect( view.idInputView.errorText ).toEqual( 'Foo bar' );
		} );

		it( 'should pass view reference as argument to validator', () => {
			const validatorSpy = vi.fn();
			const view = new BookmarkFormView( { t: () => {} }, [ validatorSpy ] );

			view.isValid();

			expect( validatorSpy ).toHaveBeenCalledOnce();
			expect( validatorSpy ).toHaveBeenCalledWith( view );
		} );
	} );

	describe( 'resetFormStatus()', () => {
		it( 'should clear form input errors', () => {
			view.idInputView.errorText = 'Error';
			view.resetFormStatus();
			expect( view.idInputView.errorText ).toBeNull();
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

				view.on( 'submit', spy );
				view.element.dispatchEvent( new Event( 'submit' ) );

				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the #idInputView', () => {
			const spy = vi.spyOn( view.idInputView, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'ID getter', () => {
		it( 'null value should be returned in ID getter if element is null', () => {
			view.idInputView.fieldView.element = null;

			expect( view.id ).toEqual( null );
		} );

		it( 'trimmed DOM input value should be returned in ID getter', () => {
			view.idInputView.fieldView.element.value = '  foobar  ';

			expect( view.id ).toEqual( 'foobar' );
		} );
	} );
} );
