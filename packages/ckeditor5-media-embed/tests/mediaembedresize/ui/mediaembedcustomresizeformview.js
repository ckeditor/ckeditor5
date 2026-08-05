/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { ButtonView, LabeledFieldView } from '@ckeditor/ckeditor5-ui';
import { MediaEmbedCustomResizeFormView } from '../../../src/mediaembedresize/ui/mediaembedcustomresizeformview.js';

describe( 'MediaEmbedCustomResizeFormView', () => {
	let view, locale;

	beforeEach( () => {
		locale = new Locale();

		view = new MediaEmbedCustomResizeFormView( locale, '%', [
			form => {
				if ( !form.rawSize || form.rawSize.trim() === '' ) {
					return 'The value must not be empty.';
				}

				if ( form.parsedSize === null ) {
					return 'The value should be a plain number.';
				}
			}
		] );

		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.destroy();
		view.element.remove();
	} );

	it( 'should render as a form element', () => {
		expect( view.element.tagName ).toBe( 'FORM' );
	} );

	it( 'should have the `ck-media-embed-custom-resize-form` CSS class', () => {
		expect( view.element.classList.contains( 'ck-media-embed-custom-resize-form' ) ).toBe( true );
	} );

	it( 'should have unit set from constructor', () => {
		expect( view.unit ).toBe( '%' );
	} );

	describe( 'backButtonView', () => {
		it( 'should be an instance of ButtonView', () => {
			expect( view.backButtonView ).toBeInstanceOf( ButtonView );
		} );

		it( 'should delegate execute to cancel event', () => {
			const spy = vi.fn();

			view.on( 'cancel', spy );
			view.backButtonView.fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'saveButtonView', () => {
		it( 'should be an instance of ButtonView', () => {
			expect( view.saveButtonView ).toBeInstanceOf( ButtonView );
		} );

		it( 'should fire submit event on form submit', () => {
			const spy = vi.fn();

			view.on( 'submit', spy );
			view.element.dispatchEvent( new Event( 'submit' ) );

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'labeledInput', () => {
		it( 'should be an instance of LabeledFieldView', () => {
			expect( view.labeledInput ).toBeInstanceOf( LabeledFieldView );
		} );

		it( 'should have the label "Resize media (in %)"', () => {
			expect( view.labeledInput.label ).toBe( 'Resize media (in %)' );
		} );
	} );

	describe( 'rawSize getter', () => {
		it( 'should return the value from the input element', () => {
			view.labeledInput.fieldView.element.value = '42';
			expect( view.rawSize ).toBe( '42' );
		} );

		it( 'should return null when the input element is null', () => {
			vi.spyOn( view.labeledInput.fieldView, 'element', 'get' ).mockReturnValue( null );
			expect( view.rawSize ).toBeNull();
		} );
	} );

	describe( 'parsedSize getter', () => {
		it( 'should return a number for valid input', () => {
			view.labeledInput.fieldView.element.type = '';
			view.labeledInput.fieldView.element.value = '42.5';
			expect( view.parsedSize ).toBe( 42.5 );
		} );

		it( 'should return null when rawSize is null', () => {
			vi.spyOn( view, 'rawSize', 'get' ).mockReturnValue( null );
			expect( view.parsedSize ).toBeNull();
		} );

		it( 'should return null for non-numeric input', () => {
			view.labeledInput.fieldView.element.type = '';
			view.labeledInput.fieldView.element.value = 'abc';
			expect( view.parsedSize ).toBeNull();
		} );
	} );

	describe( 'sizeWithUnits getter', () => {
		it( 'should return size with unit suffix', () => {
			view.labeledInput.fieldView.element.type = '';
			view.labeledInput.fieldView.element.value = '50';
			expect( view.sizeWithUnits ).toBe( '50%' );
		} );

		it( 'should return null for non-numeric input', () => {
			view.labeledInput.fieldView.element.type = '';
			view.labeledInput.fieldView.element.value = 'abc';
			expect( view.sizeWithUnits ).toBeNull();
		} );
	} );

	describe( 'isValid()', () => {
		it( 'should return false for empty value', () => {
			view.labeledInput.fieldView.element.type = '';
			view.labeledInput.fieldView.element.value = '';
			expect( view.isValid() ).toBe( false );
			expect( view.labeledInput.errorText ).toBe( 'The value must not be empty.' );
		} );

		it( 'should return false for non-numeric value', () => {
			view.labeledInput.fieldView.element.type = '';
			view.labeledInput.fieldView.element.value = 'abc';
			expect( view.isValid() ).toBe( false );
			expect( view.labeledInput.errorText ).toBe( 'The value should be a plain number.' );
		} );

		it( 'should return true for valid numeric value', () => {
			view.labeledInput.fieldView.element.type = '';
			view.labeledInput.fieldView.element.value = '50';
			expect( view.isValid() ).toBe( true );
			expect( view.labeledInput.errorText ).toBeNull();
		} );
	} );

	describe( 'resetFormStatus()', () => {
		it( 'should clear the error text', () => {
			view.labeledInput.errorText = 'Some error';
			view.resetFormStatus();
			expect( view.labeledInput.errorText ).toBeNull();
		} );
	} );

	describe( 'Esc key handling', () => {
		it( 'should fire cancel event on Esc', () => {
			const spy = vi.fn();

			view.on( 'cancel', spy );

			const keyEvtData = {
				keyCode: 27, // Esc
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			};

			view.keystrokes.press( keyEvtData );

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'focus tracker', () => {
		it( 'should track focus on back button, input, and save button', () => {
			const trackedElements = [ ...view.focusTracker._elements ];

			expect( trackedElements ).toContain( view.backButtonView.element );
			expect( trackedElements ).toContain( view.labeledInput.element );
			expect( trackedElements ).toContain( view.saveButtonView.element );
		} );
	} );
} );
