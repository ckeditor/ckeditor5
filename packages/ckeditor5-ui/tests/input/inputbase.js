/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FocusTracker } from '@ckeditor/ckeditor5-utils';
import { InputBase } from '../../src/input/inputbase.js';
import { InputView } from '../../src/input/inputview.js';

describe( 'InputBase', () => {
	let view, ariaDescribedById;

	class Input extends InputBase {}

	beforeEach( () => {
		view = new Input();
		ariaDescribedById = 'ck-error-1234567890';

		view.render();
	} );

	afterEach( () => {
		view.destroy();
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		it( 'should set the #isFocused observable property', () => {
			expect( view.isFocused ).toBe( false );
		} );

		it( 'should set the #isEmpty observable property', () => {
			expect( view.isEmpty ).toBe( true );
		} );

		it( 'should set the #hasError observable property', () => {
			expect( view.hasError ).toBe( false );
		} );

		it( 'should set the #isReadOnly observable property', () => {
			expect( view.isReadOnly ).toBe( false );
		} );

		it( 'should create an instance of FocusTracker under #focusTracker property', () => {
			expect( view.focusTracker ).toBeInstanceOf( FocusTracker );
		} );
	} );

	describe( 'render()', () => {
		it( 'registers #element in the #focusTracker', () => {
			expect( view.isFocused ).toBe( false );

			view.element.dispatchEvent( new Event( 'focus' ) );

			expect( view.isFocused ).toBe( true );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = vi.spyOn( view.focusTracker, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'select()', () => {
		it( 'should select input value', () => {
			const selectSpy = vi.spyOn( view.element, 'select' );

			view.select();

			expect( selectSpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the input in DOM', () => {
			const spy = vi.spyOn( view.element, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'reset()', () => {
		it( 'should reset the #value and the DOM element\'s value too', () => {
			view.value = 'foo';

			view.reset();

			expect( view.value ).toBe( '' );
			expect( view.element.value ).toBe( '' );
			expect( view.element.classList.contains( 'ck-input-text_empty' ) ).toBe( true );
		} );
	} );

	describe( 'DOM bindings', () => {
		beforeEach( () => {
			view.value = 'foo';
			view.id = 'bar';
		} );

		describe( 'value', () => {
			it( 'should react on view#value', () => {
				expect( view.element.value ).toBe( 'foo' );

				view.value = 'baz';

				expect( view.element.value ).toBe( 'baz' );

				// To be sure that value can be changed multiple times using inline value attribute.
				// There was a related bug in Chrome.
				view.value = 'biz';

				expect( view.element.value ).toBe( 'biz' );
			} );

			it( 'should set to empty string when using `falsy` values', () => {
				[ undefined, false, null ].forEach( value => {
					view.value = value;

					expect( view.element.value ).toBe( '' );
				} );
			} );

			// See ckeditor5-ui/issues/335.
			it( 'should set element value when value was defined before view#render', () => {
				view = new InputView();

				view.value = 'baz';

				view.render();

				expect( view.element.value ).toBe( 'baz' );
			} );

			it( 'should update along with the #isEmpty property', () => {
				view.value = 'foo';

				expect( view.isEmpty ).toBe( false );

				view.value = '';
				expect( view.isEmpty ).toBe( true );
			} );
		} );

		describe( 'id', () => {
			it( 'should react on view#id', () => {
				expect( view.element.id ).toBe( 'bar' );

				view.id = 'baz';

				expect( view.element.id ).toBe( 'baz' );
			} );
		} );

		describe( 'placeholder', () => {
			it( 'should react on view#placeholder', () => {
				expect( view.element.placeholder ).toBe( '' );

				view.placeholder = 'baz';

				expect( view.element.placeholder ).toBe( 'baz' );
			} );
		} );

		describe( 'isReadOnly', () => {
			it( 'should react on view#isReadOnly', () => {
				expect( view.element.readOnly ).toBe( false );

				view.isReadOnly = true;

				expect( view.element.readOnly ).toBe( true );
			} );
		} );

		describe( 'class', () => {
			it( 'should react on view#hasErrors', () => {
				expect( view.element.classList.contains( 'ck-error' ) ).toBe( false );

				view.hasError = true;

				expect( view.element.classList.contains( 'ck-error' ) ).toBe( true );
			} );

			it( 'should react on view#isFocused', () => {
				expect( view.element.classList.contains( 'ck-input_focused' ) ).toBe( false );

				view.isFocused = true;

				expect( view.element.classList.contains( 'ck-input_focused' ) ).toBe( true );
			} );

			it( 'should react on view#isEmpty', () => {
				view.value = '';

				expect( view.element.classList.contains( 'ck-input-text_empty' ) ).toBe( true );

				view.value = 'bar';

				expect( view.element.classList.contains( 'ck-input-text_empty' ) ).toBe( false );
			} );
		} );

		describe( 'aria-invalid', () => {
			it( 'should react on view#hasError', () => {
				expect( view.element.getAttribute( 'aria-invalid' ) ).toBeNull();

				view.hasError = true;

				expect( view.element.getAttribute( 'aria-invalid' ) ).toBe( 'true' );
			} );
		} );

		describe( 'tabIndex', () => {
			it( 'should react on view#tabIndex', () => {
				expect( view.element.getAttribute( 'tabIndex' ) ).toBeNull();

				view.tabIndex = 123;

				expect( view.element.getAttribute( 'tabIndex' ) ).toBe( '123' );
			} );
		} );

		describe( 'aria-label', () => {
			it( 'should react on view#ariaLabel', () => {
				expect( view.element.getAttribute( 'aria-label' ) ).toBeNull();

				view.ariaLabel = 'reader text';

				expect( view.element.getAttribute( 'aria-label' ) ).toBe( 'reader text' );
			} );
		} );

		describe( 'aria-describedby', () => {
			it( 'should react on view#hasError', () => {
				expect( view.element.getAttribute( 'aria-describedby' ) ).toBeNull();

				view.ariaDescribedById = ariaDescribedById;

				expect( view.element.getAttribute( 'aria-describedby' ) ).toBe( ariaDescribedById );
			} );
		} );

		describe( 'input event', () => {
			it( 'triggers view#input', () => {
				const spy = vi.fn();

				view.on( 'input', spy );

				view.element.dispatchEvent( new Event( 'input' ) );
				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledWith( expect.any( Object ), expect.anything() );
			} );

			// https://github.com/ckeditor/ckeditor5/issues/10431
			it( 'should trigger update of the #isEmpty property', () => {
				view.element.value = 'foo';
				view.element.dispatchEvent( new Event( 'input' ) );

				expect( view.isEmpty ).toBe( false );

				view.element.value = '';
				view.element.dispatchEvent( new Event( 'input' ) );

				expect( view.isEmpty ).toBe( true );
			} );
		} );
	} );
} );
