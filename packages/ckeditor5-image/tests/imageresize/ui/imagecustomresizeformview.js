/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { keyCodes, KeystrokeHandler, FocusTracker } from '@ckeditor/ckeditor5-utils';
import { ImageCustomResizeFormView } from '../../../src/imageresize/ui/imagecustomresizeformview.js';
import { View, FocusCycler, ViewCollection } from '@ckeditor/ckeditor5-ui';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'ImageCustomResizeFormView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new ImageCustomResizeFormView( { t: () => {} }, '%', [] );
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			view.render();

			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-form' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-image-custom-resize-form' ) ).toBe( true );
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

		it( 'should create header element at the top', () => {
			view.render();

			const header = view.children.first;

			expect( header.children.last.element.classList.contains( 'ck-form__header__label' ) ).toBe( true );
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

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'render()', () => {
		it( 'starts listening for #keystrokes coming from #element', () => {
			const spy = vi.spyOn( view.keystrokes, 'listenTo' );

			view.render();
			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy ).toHaveBeenCalledWith( view.element );
		} );

		describe( 'focus cycling and management', () => {
			it( 'should register child views in #_focusables', () => {
				view.render();

				expect( view._focusables.map( f => f ) ).toEqual( [
					view.backButtonView,
					view.labeledInput,
					view.saveButtonView
				] );
			} );

			it( 'should register child views\' #element in #focusTracker', () => {
				const spy = vi.spyOn( view.focusTracker, 'add' );

				view.render();

				expect( spy.mock.calls[ 0 ][ 0 ] ).toBe( view.backButtonView.element );
				expect( spy.mock.calls[ 1 ][ 0 ] ).toBe( view.labeledInput.element );
				expect( spy.mock.calls[ 2 ][ 0 ] ).toBe( view.saveButtonView.element );
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
					expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
					expect( spy ).toHaveBeenCalledTimes( 1 );
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
					expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );
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

	describe( 'isValid()', () => {
		it( 'should reset error after successful validation', () => {
			const view = new ImageCustomResizeFormView( { t: () => {} }, '%', [
				() => undefined
			] );

			expect( view.isValid() ).toBe( true );
			expect( view.labeledInput.errorText ).toBeNull();
		} );

		it( 'should display first error returned from validators list', () => {
			const view = new ImageCustomResizeFormView( { t: () => {} }, '%', [
				() => undefined,
				() => 'Foo bar',
				() => 'Another error'
			] );

			expect( view.isValid() ).toBe( false );
			expect( view.labeledInput.errorText ).toBe( 'Foo bar' );
		} );

		it( 'should pass view reference as argument to validator', () => {
			const validatorSpy = vi.fn();
			const view = new ImageCustomResizeFormView( { t: () => {} }, '%', [ validatorSpy ] );

			view.isValid();

			expect( validatorSpy ).toHaveBeenCalledTimes( 1 );
			expect( validatorSpy ).toHaveBeenCalledWith( view );
		} );
	} );

	describe( 'rawSize getter', () => {
		beforeEach( () => {
			view.render();
		} );

		it( 'should return null `rawSize` if element is `null`', () => {
			view.labeledInput.fieldView.element = null;

			expect( view.rawSize ).toBe( null );
		} );

		it( 'should return raw unparsed value of input element in `rawSize`', () => {
			view.labeledInput.fieldView.element.value = '1234';

			expect( view.rawSize ).toBe( '1234' );
		} );
	} );

	describe( 'parsedSize getter', () => {
		beforeEach( () => {
			view.render();
		} );

		it( 'should return null `parsedSize` if element is `null`', () => {
			view.labeledInput.fieldView.element = null;

			expect( view.parsedSize ).toBe( null );
		} );

		it( 'should return parsed value of input element in `parsedSize`', () => {
			view.labeledInput.fieldView.element.value = '1234';
			expect( view.parsedSize ).toBe( 1234 );

			view.labeledInput.fieldView.element.value = '1234.5';
			expect( view.parsedSize ).toBe( 1234.5 );
		} );

		it( 'should null if `rawSize` is not a number', () => {
			view.labeledInput.fieldView.element.value = '1234';
			vi.spyOn( view, 'rawSize', 'get' ).mockReturnValue( 'Foo' );

			expect( view.parsedSize ).toBe( null );
		} );
	} );

	describe( 'sizeWithUnits getter', () => {
		beforeEach( () => {
			view.render();
		} );

		it( 'should return null `sizeWithUnits` if element is `null`', () => {
			view.labeledInput.fieldView.element = null;

			expect( view.sizeWithUnits ).toBe( null );
		} );

		it( 'should return parsed value of input element in `parsedSize`', () => {
			view.labeledInput.fieldView.element.value = '1234';
			expect( view.sizeWithUnits ).toBe( '1234%' );

			view.labeledInput.fieldView.element.value = '1234.5';
			expect( view.sizeWithUnits ).toBe( '1234.5%' );
		} );

		it( 'should null if `rawSize` is not a number', () => {
			view.labeledInput.fieldView.element.value = '1234';
			vi.spyOn( view, 'rawSize', 'get' ).mockReturnValue( 'Foo' );

			expect( view.sizeWithUnits ).toBe( null );
		} );
	} );

	describe( 'resetFormStatus()', () => {
		it( 'should clear form input errors', () => {
			view.labeledInput.errorText = 'Error';
			view.resetFormStatus();
			expect( view.labeledInput.errorText ).toBeNull();
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'submit event', () => {
			it( 'should trigger submit event', () => {
				const spy = vi.fn();

				view.render();
				view.on( 'submit', spy );
				view.element.dispatchEvent( new Event( 'submit' ) );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );
} );
