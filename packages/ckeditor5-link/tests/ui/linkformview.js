/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LinkFormView } from '../../src/ui/linkformview.js';
import { LinkButtonView } from '../../src/ui/linkbuttonview.js';
import { ListView, View, FocusCycler, ViewCollection } from '@ckeditor/ckeditor5-ui';
import { keyCodes, KeystrokeHandler, FocusTracker } from '@ckeditor/ckeditor5-utils';

describe( 'LinkFormView', () => {
	let view;

	beforeEach( () => {
		view = new LinkFormView( { t: val => val } );
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
			expect( view.element.classList.contains( 'ck-link-form' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-responsive-form' ) ).toBe( true );
		} );

		it( 'should create child views', () => {
			expect( view.backButtonView ).toBeInstanceOf( View );
			expect( view.saveButtonView ).toBeInstanceOf( View );
			expect( view.displayedTextInputView ).toBeInstanceOf( View );
			expect( view.urlInputView ).toBeInstanceOf( View );
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

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should fire `cancel` event on backButtonView#execute', () => {
			const spy = vi.fn();

			view.on( 'cancel', spy );

			view.backButtonView.fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should create url input with inputmode=url', () => {
			expect( view.urlInputView.fieldView.inputMode ).toBe( 'url' );
		} );

		describe( 'template', () => {
			/**
				 * form
				 * 	header
				 * 		backButtonView
				 * 		label
				 * 	formRow
				 * 		displayedTextInputView
				 * 	formRow
				 * 		urlInputView
				 * 		saveButtonView
				 * 	linksButton
				 */

			it( 'has url input view', () => {
				const firstFormRow = view.template.children[ 0 ].get( 1 );
				const secondFormRow = view.template.children[ 0 ].get( 2 );

				expect( firstFormRow.template.children[ 0 ].get( 0 ) ).toBe( view.displayedTextInputView );
				expect( secondFormRow.template.children[ 0 ].get( 0 ) ).toBe( view.urlInputView );
			} );

			it( 'has button views', () => {
				const headerChildren = view.template.children[ 0 ].get( 0 ).template.children[ 0 ];
				const secondFormRow = view.template.children[ 0 ].get( 2 );

				expect( headerChildren.get( 0 ) ).toBe( view.backButtonView );
				expect( secondFormRow.template.children[ 0 ].get( 1 ) ).toBe( view.saveButtonView );
			} );

			it( 'should `saveButtonView` has no tooltip', () => {
				expect( view.saveButtonView.tooltip ).toBe( false );
			} );

			it( 'should `backButtonView` has correct label', () => {
				const headerChildren = view.template.children[ 0 ].get( 0 ).template.children[ 0 ];
				const backButton = headerChildren.get( 0 );

				expect( backButton.template.children[ 0 ].get( 1 ).text ).toBe( 'Back' );
			} );

			it( 'should `backButtonView` has correct CSS class', () => {
				const headerChildren = view.template.children[ 0 ].get( 0 ).template.children[ 0 ];
				const backButton = headerChildren.get( 0 );

				expect( backButton.class ).toBe( 'ck-button-back' );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).toEqual( expect.arrayContaining( [
				view.urlInputView,
				view.saveButtonView,
				view.backButtonView,
				view.displayedTextInputView
			] ) );
		} );

		it( 'should register child views #element in #focusTracker', () => {
			const view = new LinkFormView( { t: () => {} } );
			const spy = vi.spyOn( view.focusTracker, 'add' );

			view.render();

			expect( spy ).toHaveBeenNthCalledWith( 1, view.urlInputView.element );
			expect( spy ).toHaveBeenNthCalledWith( 2, view.saveButtonView.element );
			expect( spy ).toHaveBeenNthCalledWith( 3, view.backButtonView.element );
			expect( spy ).toHaveBeenNthCalledWith( 4, view.displayedTextInputView.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new LinkFormView( { t: () => {} } );
			const spy = vi.spyOn( view.keystrokes, 'listenTo' );

			view.render();

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( view.element );

			view.destroy();
		} );

		describe( 'activates keyboard navigation for the toolbar', () => {
			it( 'so "tab" focuses the next focusable item', () => {
				const spy = vi.spyOn( view.saveButtonView, 'focus' );

				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// Mock the url input is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.urlInputView.element;
				view.keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'so "shift + tab" focuses the previous focusable item', () => {
				const spy = vi.spyOn( view.saveButtonView, 'focus' );

				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// Mock the cancel button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.backButtonView.element;
				view.keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'isValid()', () => {
		it( 'should reset error after successful validation', () => {
			const view = new LinkFormView( { t: () => {} }, [
				() => undefined
			] );

			expect( view.isValid() ).toBe( true );
			expect( view.urlInputView.errorText ).toBeNull();
		} );

		it( 'should display first error returned from validators list', () => {
			const view = new LinkFormView( { t: () => {} }, [
				() => undefined,
				() => 'Foo bar',
				() => 'Another error'
			] );

			expect( view.isValid() ).toBe( false );
			expect( view.urlInputView.errorText ).toBe( 'Foo bar' );
		} );

		it( 'should pass view reference as argument to validator', () => {
			const validatorSpy = vi.fn();
			const view = new LinkFormView( { t: () => {} }, [ validatorSpy ] );

			view.isValid();

			expect( validatorSpy ).toHaveBeenCalledExactlyOnceWith( view );
		} );
	} );

	describe( 'resetFormStatus()', () => {
		it( 'should clear form input errors', () => {
			view.urlInputView.errorText = 'Error';
			view.resetFormStatus();
			expect( view.urlInputView.errorText ).toBeNull();
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
		it( 'focuses the #urlInputView', () => {
			const spy = vi.spyOn( view.urlInputView, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'URL getter', () => {
		it( 'null value should be returned in URL getter if element is null', () => {
			view.urlInputView.fieldView.element = null;

			expect( view.url ).toBe( null );
		} );

		it( 'trimmed DOM input value should be returned in URL getter', () => {
			view.urlInputView.fieldView.element.value = '  https://cksource.com/  ';

			expect( view.url ).toBe( 'https://cksource.com/' );
		} );
	} );

	describe( 'allows adding more form views', () => {
		let button;

		beforeEach( () => {
			button = new LinkButtonView();

			button.set( {
				label: 'Button'
			} );

			view.providersListChildren.add( button );
		} );

		afterEach( () => {
			button.destroy();
		} );

		it( 'adds list view', () => {
			const listView = view.children.get( 3 );
			const button = listView.template.children[ 0 ].get( 0 ).template.children[ 0 ].get( 0 );

			expect( button ).toBeInstanceOf( LinkButtonView );
			expect( listView ).toBeInstanceOf( ListView );
		} );

		it( 'should register list view items in #focusTracker', () => {
			const view = new LinkFormView( { t: () => { } } );
			const button = new LinkButtonView();

			button.set( {
				label: 'Button'
			} );

			view.providersListChildren.add( button );

			const spy = vi.spyOn( view.focusTracker, 'add' );
			const listView = view.children.get( 3 );
			const { element } = listView.template.children[ 0 ].get( 0 ).template.children[ 0 ].get( 0 );

			view.render();

			expect( spy ).toHaveBeenNthCalledWith( 1, view.urlInputView.element );
			expect( spy ).toHaveBeenNthCalledWith( 2, view.saveButtonView.element );
			expect( spy ).toHaveBeenNthCalledWith( 3, element );
			expect( spy ).toHaveBeenNthCalledWith( 4, view.backButtonView.element );
			expect( spy ).toHaveBeenNthCalledWith( 5, view.displayedTextInputView.element );

			view.destroy();
		} );
	} );
} );
