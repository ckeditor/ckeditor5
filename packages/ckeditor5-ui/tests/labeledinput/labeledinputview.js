/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { View } from '../../src/view.js';
import { LabeledInputView } from '../../src/labeledinput/labeledinputview.js';
import { InputTextView } from '../../src/inputtext/inputtextview.js';
import { LabelView } from '../../src/label/labelview.js';

describe( 'LabeledInputView', () => {
	const locale = {};

	let view;

	beforeEach( () => {
		view = new LabeledInputView( locale, InputTextView );

		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'should set view#locale', () => {
			expect( view.locale ).toEqual( locale );
		} );

		it( 'should set view#errorText', () => {
			expect( view.errorText ).toBeNull();
		} );

		it( 'should set view#infoText', () => {
			expect( view.infoText ).toBeNull();
		} );

		it( 'should create view#inputView', () => {
			expect( view.inputView ).toBeInstanceOf( InputTextView );
		} );

		it( 'should create view#labelView', () => {
			expect( view.labelView ).toBeInstanceOf( LabelView );
		} );

		it( 'should create view#statusView', () => {
			expect( view.statusView ).toBeInstanceOf( View );

			expect( view.statusView.element.tagName ).toBe( 'DIV' );
			expect( view.statusView.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.statusView.element.classList.contains( 'ck-labeled-input__status' ) ).toBe( true );
		} );

		it( 'should pair #inputView and #labelView by unique id', () => {
			expect( view.labelView.for ).toBe( view.inputView.id );
		} );

		it( 'should pair #inputView and #statusView by unique id', () => {
			expect( view.inputView.ariaDescribedById ).toBe( view.statusView.element.id );
		} );
	} );

	describe( 'template', () => {
		it( 'should have the CSS class', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-labeled-input' ) ).toBe( true );
		} );

		it( 'should have label view', () => {
			expect( view.template.children[ 0 ] ).toBe( view.labelView );
		} );

		it( 'should have input view', () => {
			expect( view.template.children[ 1 ] ).toBe( view.inputView );
		} );

		it( 'should have the status container', () => {
			expect( view.template.children[ 2 ] ).toBe( view.statusView );
		} );

		describe( 'DOM bindings', () => {
			describe( 'class', () => {
				it( 'should react on view#isReadOnly', () => {
					view.isReadOnly = false;
					expect( view.element.classList.contains( 'ck-disabled' ) ).toBe( false );

					view.isReadOnly = true;
					expect( view.element.classList.contains( 'ck-disabled' ) ).toBe( true );
				} );
			} );

			describe( 'status container', () => {
				it( 'should react on view#errorText', () => {
					const statusElement = view.statusView.element;

					view.errorText = '';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).toBe( true );
					expect( statusElement.classList.contains( 'ck-labeled-input__status_error' ) ).toBe( false );
					expect( statusElement.hasAttribute( 'role' ) ).toBe( false );
					expect( statusElement.innerHTML ).toBe( '' );

					view.errorText = 'foo';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).toBe( false );
					expect( statusElement.classList.contains( 'ck-labeled-input__status_error' ) ).toBe( true );
					expect( statusElement.getAttribute( 'role' ) ).toBe( 'alert' );
					expect( statusElement.innerHTML ).toBe( 'foo' );
				} );

				it( 'should react on view#infoText', () => {
					const statusElement = view.statusView.element;

					view.infoText = '';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).toBe( true );
					expect( statusElement.classList.contains( 'ck-labeled-input__status_error' ) ).toBe( false );
					expect( statusElement.hasAttribute( 'role' ) ).toBe( false );
					expect( statusElement.innerHTML ).toBe( '' );

					view.infoText = 'foo';
					expect( statusElement.classList.contains( 'ck-hidden' ) ).toBe( false );
					expect( statusElement.classList.contains( 'ck-labeled-input__status_error' ) ).toBe( false );
					expect( statusElement.hasAttribute( 'role' ) ).toBe( false );
					expect( statusElement.innerHTML ).toBe( 'foo' );
				} );
			} );
		} );
	} );

	describe( 'binding', () => {
		it( 'should bind view#text to view.labelView#label', () => {
			view.label = 'Foo bar';

			expect( view.labelView.text ).toBe( 'Foo bar' );
		} );

		it( 'should bind view#value to view.inputView#value', () => {
			view.value = 'Lorem ipsum';

			expect( view.inputView.value ).toBe( 'Lorem ipsum' );
		} );

		it( 'should bind view#isreadOnly to view.inputView#isReadOnly', () => {
			view.isReadOnly = false;

			expect( view.inputView.isReadOnly ).toBe( false );

			view.isReadOnly = true;

			expect( view.inputView.isReadOnly ).toBe( true );
		} );

		it( 'should bind view#errorText to view.inputView#hasError', () => {
			view.errorText = '';
			expect( view.inputView.hasError ).toBe( false );

			view.errorText = 'foo';
			expect( view.inputView.hasError ).toBe( true );
		} );

		it( 'should clear view#errorText upon view.inputView#input', () => {
			view.errorText = 'foo';

			view.inputView.fire( 'input' );
			expect( view.errorText ).toBeNull();
		} );
	} );

	describe( 'select()', () => {
		it( 'should select input value', () => {
			const spy = vi.spyOn( view.inputView, 'select' );

			view.select();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the input in DOM', () => {
			const spy = vi.spyOn( view.inputView, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );
} );
