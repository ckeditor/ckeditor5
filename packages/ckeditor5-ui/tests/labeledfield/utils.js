/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
	createLabeledInputText,
	createLabeledInputNumber,
	createLabeledDropdown,
	createLabeledTextarea
} from '../../src/labeledfield/utils.js';

import { LabeledFieldView } from '../../src/labeledfield/labeledfieldview.js';
import { InputTextView } from '../../src/inputtext/inputtextview.js';
import { InputNumberView } from '../../src/inputnumber/inputnumberview.js';
import { DropdownView } from '../../src/dropdown/dropdownview.js';
import { TextareaView } from '@ckeditor/ckeditor5-ui';

describe( 'LabeledFieldView utils', () => {
	let locale;

	beforeEach( () => {
		locale = { t: val => val };
	} );

	describe( 'createLabeledInputText()', () => {
		let labeledInput;

		beforeEach( () => {
			labeledInput = new LabeledFieldView( locale, createLabeledInputText );
		} );

		afterEach( () => {
			labeledInput.destroy();
		} );

		it( 'should create an InputTextView instance', () => {
			expect( labeledInput.fieldView ).toBeInstanceOf( InputTextView );
		} );

		it( 'should pass the Locale to the input', () => {
			expect( labeledInput.fieldView.locale ).toBe( locale );
		} );

		it( 'should set input #id and #ariaDescribedById', () => {
			labeledInput.render();

			expect( labeledInput.fieldView.id ).toBe( labeledInput.labelView.for );
			expect( labeledInput.fieldView.ariaDescribedById ).toBe( labeledInput.statusView.element.id );
		} );

		it( 'should bind input\'s #isReadOnly to labeledInput#isEnabled', () => {
			labeledInput.isEnabled = true;
			expect( labeledInput.fieldView.isReadOnly ).toBe( false );

			labeledInput.isEnabled = false;
			expect( labeledInput.fieldView.isReadOnly ).toBe( true );
		} );

		it( 'should bind input\'s #hasError to labeledInput#errorText', () => {
			labeledInput.errorText = 'some error';
			expect( labeledInput.fieldView.hasError ).toBe( true );

			labeledInput.errorText = null;
			expect( labeledInput.fieldView.hasError ).toBe( false );
		} );

		it( 'should bind labeledInput#isEmpty to input\'s #isEmpty', () => {
			labeledInput.fieldView.isEmpty = true;
			expect( labeledInput.isEmpty ).toBe( true );

			labeledInput.fieldView.isEmpty = false;
			expect( labeledInput.isEmpty ).toBe( false );
		} );

		it( 'should bind labeledInput#isFocused to input\'s #isFocused', () => {
			labeledInput.fieldView.isFocused = true;
			expect( labeledInput.isFocused ).toBe( true );

			labeledInput.fieldView.isFocused = false;
			expect( labeledInput.isFocused ).toBe( false );
		} );

		it( 'should bind labeledInput#placeholder to input\'s #placeholder', () => {
			labeledInput.fieldView.placeholder = null;
			expect( labeledInput.placeholder ).toBeNull();

			labeledInput.fieldView.placeholder = 'foo';
			expect( labeledInput.placeholder ).toBe( 'foo' );
		} );

		it( 'should clean labeledInput#errorText upon input\'s DOM "update" event', () => {
			labeledInput.errorText = 'some error';
			labeledInput.fieldView.fire( 'input' );
			expect( labeledInput.errorText ).toBeNull();
		} );
	} );

	describe( 'createLabeledInputNumber()', () => {
		let labeledInput, locale;

		beforeEach( () => {
			locale = { t: val => val };
			labeledInput = new LabeledFieldView( locale, createLabeledInputNumber );
		} );

		afterEach( () => {
			labeledInput.destroy();
		} );

		it( 'should create an InputNumberView instance', () => {
			expect( labeledInput.fieldView ).toBeInstanceOf( InputNumberView );
		} );

		it( 'should pass the Locale to the input', () => {
			expect( labeledInput.fieldView.locale ).toBe( locale );
		} );

		it( 'should set input #id and #ariaDescribedById', () => {
			labeledInput.render();

			expect( labeledInput.fieldView.id ).toBe( labeledInput.labelView.for );
			expect( labeledInput.fieldView.ariaDescribedById ).toBe( labeledInput.statusView.element.id );
		} );

		it( 'should set #inputMode to "numeric"', () => {
			expect( labeledInput.fieldView.inputMode ).toBe( 'numeric' );
		} );

		it( 'should bind input\'s #isReadOnly to labeledInput#isEnabled', () => {
			labeledInput.isEnabled = true;
			expect( labeledInput.fieldView.isReadOnly ).toBe( false );

			labeledInput.isEnabled = false;
			expect( labeledInput.fieldView.isReadOnly ).toBe( true );
		} );

		it( 'should bind input\'s #hasError to labeledInput#errorText', () => {
			labeledInput.errorText = 'some error';
			expect( labeledInput.fieldView.hasError ).toBe( true );

			labeledInput.errorText = null;
			expect( labeledInput.fieldView.hasError ).toBe( false );
		} );

		it( 'should bind labeledInput#isEmpty to input\'s #isEmpty', () => {
			labeledInput.fieldView.isEmpty = true;
			expect( labeledInput.isEmpty ).toBe( true );

			labeledInput.fieldView.isEmpty = false;
			expect( labeledInput.isEmpty ).toBe( false );
		} );

		it( 'should bind labeledInput#isFocused to input\'s #isFocused', () => {
			labeledInput.fieldView.isFocused = true;
			expect( labeledInput.isFocused ).toBe( true );

			labeledInput.fieldView.isFocused = false;
			expect( labeledInput.isFocused ).toBe( false );
		} );

		it( 'should bind labeledInput#placeholder to input\'s #placeholder', () => {
			labeledInput.fieldView.placeholder = null;
			expect( labeledInput.placeholder ).toBeNull();

			labeledInput.fieldView.placeholder = 'foo';
			expect( labeledInput.placeholder ).toBe( 'foo' );
		} );

		it( 'should clean labeledInput#errorText upon input\'s DOM "update" event', () => {
			labeledInput.errorText = 'some error';
			labeledInput.fieldView.fire( 'input' );
			expect( labeledInput.errorText ).toBeNull();
		} );
	} );

	describe( 'createLabeledTextarea()', () => {
		let labeledTextarea;

		beforeEach( () => {
			labeledTextarea = new LabeledFieldView( locale, createLabeledTextarea );
		} );

		afterEach( () => {
			labeledTextarea.destroy();
		} );

		it( 'should create an TextareaView instance', () => {
			expect( labeledTextarea.fieldView ).toBeInstanceOf( TextareaView );
		} );

		it( 'should pass the Locale to the textarea', () => {
			expect( labeledTextarea.fieldView.locale ).toBe( locale );
		} );

		it( 'should set textarea #id and #ariaDescribedById', () => {
			labeledTextarea.render();

			expect( labeledTextarea.fieldView.id ).toBe( labeledTextarea.labelView.for );
			expect( labeledTextarea.fieldView.ariaDescribedById ).toBe( labeledTextarea.statusView.element.id );
		} );

		it( 'should bind textarea\'s #isReadOnly to labeledTextarea#isEnabled', () => {
			labeledTextarea.isEnabled = true;
			expect( labeledTextarea.fieldView.isReadOnly ).toBe( false );

			labeledTextarea.isEnabled = false;
			expect( labeledTextarea.fieldView.isReadOnly ).toBe( true );
		} );

		it( 'should bind textarea\'s #hasError to labeledTextarea#errorText', () => {
			labeledTextarea.errorText = 'some error';
			expect( labeledTextarea.fieldView.hasError ).toBe( true );

			labeledTextarea.errorText = null;
			expect( labeledTextarea.fieldView.hasError ).toBe( false );
		} );

		it( 'should bind labeledTextarea#isEmpty to textarea\'s #isEmpty', () => {
			labeledTextarea.fieldView.isEmpty = true;
			expect( labeledTextarea.isEmpty ).toBe( true );

			labeledTextarea.fieldView.isEmpty = false;
			expect( labeledTextarea.isEmpty ).toBe( false );
		} );

		it( 'should bind labeledTextarea#isFocused to textarea\'s #isFocused', () => {
			labeledTextarea.fieldView.isFocused = true;
			expect( labeledTextarea.isFocused ).toBe( true );

			labeledTextarea.fieldView.isFocused = false;
			expect( labeledTextarea.isFocused ).toBe( false );
		} );

		it( 'should bind labeledTextarea#placeholder to textarea\'s #placeholder', () => {
			labeledTextarea.fieldView.placeholder = null;
			expect( labeledTextarea.placeholder ).toBeNull();

			labeledTextarea.fieldView.placeholder = 'foo';
			expect( labeledTextarea.placeholder ).toBe( 'foo' );
		} );

		it( 'should clean labeledTextarea#errorText upon textarea\'s DOM "update" event', () => {
			labeledTextarea.errorText = 'some error';
			labeledTextarea.fieldView.fire( 'input' );
			expect( labeledTextarea.errorText ).toBeNull();
		} );
	} );

	describe( 'createLabeledDropdown', () => {
		let labeledDropdown;

		beforeEach( () => {
			labeledDropdown = new LabeledFieldView( locale, createLabeledDropdown );
		} );

		afterEach( () => {
			labeledDropdown.destroy();
		} );

		it( 'should create a DropdownView', () => {
			expect( labeledDropdown.fieldView ).toBeInstanceOf( DropdownView );
		} );

		it( 'should pass the Locale to the dropdown', () => {
			expect( labeledDropdown.fieldView.locale ).toBe( locale );
		} );

		it( 'should set dropdown\'s #id and #ariaDescribedById', () => {
			labeledDropdown.render();

			expect( labeledDropdown.fieldView.id ).toBe( labeledDropdown.labelView.for );
			expect( labeledDropdown.fieldView.ariaDescribedById ).toBe( labeledDropdown.statusView.element.id );
		} );

		it( 'should bind dropdown\'s #isEnabled to the labeled view', () => {
			labeledDropdown.isEnabled = true;
			expect( labeledDropdown.fieldView.isEnabled ).toBe( true );

			labeledDropdown.isEnabled = false;
			expect( labeledDropdown.fieldView.isEnabled ).toBe( false );
		} );
	} );
} );
