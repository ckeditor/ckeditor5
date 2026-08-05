/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { LabeledFieldView, InputTextView } from '@ckeditor/ckeditor5-ui';

import { ImageInsertUrlView } from '../../../src/imageinsert/ui/imageinserturlview.js';

import { KeystrokeHandler } from '@ckeditor/ckeditor5-utils';

describe( 'ImageInsertUrlView', () => {
	let view;

	beforeEach( () => {
		view = new ImageInsertUrlView( { t: val => val } );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should have #imageURLInputValue', () => {
			expect( view.imageURLInputValue ).toBe( '' );
		} );

		it( 'should have #isImageSelected', () => {
			expect( view.isImageSelected ).toBe( false );
		} );

		it( 'should have #isEnabled', () => {
			expect( view.isEnabled ).toBe( true );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );
	} );

	describe( 'template', () => {
		it( 'should create element from the template', () => {
			expect( view.element.tagName ).toBe( 'FORM' );
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-image-insert-url' ) ).toBe( true );

			const childNodes = view.element.childNodes;

			expect( childNodes[ 0 ] ).toBe( view.urlInputView.element );
			expect( childNodes[ 1 ].tagName ).toBe( 'DIV' );
			expect( childNodes[ 1 ].classList.contains( 'ck' ) ).toBe( true );
			expect( childNodes[ 1 ].classList.contains( 'ck-image-insert-url__action-row' ) ).toBe( true );
		} );

		it( 'should use dedicated views', () => {
			expect( view.template.children[ 0 ] ).toBe( view.urlInputView );
			expect( view.template.children[ 1 ].children[ 0 ] ).toBe( view.insertButtonView );
			expect( view.template.children[ 1 ].children[ 1 ] ).toBe( view.cancelButtonView );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = vi.spyOn( view.keystrokes, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the url input', () => {
			const spy = vi.spyOn( view.urlInputView, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( '#urlInputView', () => {
		it( 'should be an instance of the LabeledFieldView', () => {
			expect( view.urlInputView ).toBeInstanceOf( LabeledFieldView );
		} );

		it( 'should accept text', () => {
			expect( view.urlInputView.fieldView ).toBeInstanceOf( InputTextView );
		} );

		it( 'should bind label to #isImageSelected', () => {
			view.isImageSelected = false;

			expect( view.urlInputView.label ).toBe( 'Insert image via URL' );

			view.isImageSelected = true;

			expect( view.urlInputView.label ).toBe( 'Update image URL' );
		} );

		it( 'should bind isEnabled to #isEnabled', () => {
			view.isEnabled = false;

			expect( view.urlInputView.isEnabled ).toBe( false );

			view.isEnabled = true;

			expect( view.urlInputView.isEnabled ).toBe( true );
		} );

		it( 'should set placeholder', () => {
			expect( view.urlInputView.placeholder ).toBe( 'https://example.com/image.png' );
			expect( view.urlInputView.fieldView.placeholder ).toBe( 'https://example.com/image.png' );
		} );

		it( 'should bind value to #imageURLInputValue', () => {
			view.imageURLInputValue = 'abc';

			expect( view.urlInputView.fieldView.value ).toBe( 'abc' );

			view.imageURLInputValue = null;

			expect( view.urlInputView.fieldView.value ).toBe( '' );
		} );

		it( 'should be bound with #imageURLInputValue', () => {
			view.urlInputView.fieldView.element.value = 'abc';
			view.urlInputView.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).toBe( 'abc' );

			view.urlInputView.fieldView.element.value = 'xyz';
			view.urlInputView.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).toBe( 'xyz' );
		} );

		it( 'should trim input value', () => {
			view.urlInputView.fieldView.element.value = '   ';
			view.urlInputView.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).toBe( '' );

			view.urlInputView.fieldView.element.value = '   test   ';
			view.urlInputView.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).toBe( 'test' );
		} );
	} );
} );
