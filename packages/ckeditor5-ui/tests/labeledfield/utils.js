/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	createLabeledInputText,
	createLabeledInputNumber,
	createLabeledDropdown,
	createLabeledTextarea
} from '../../src/labeledfield/utils.js';

import LabeledFieldView from '../../src/labeledfield/labeledfieldview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import InputTextView from '../../src/inputtext/inputtextview.js';
import InputNumberView from '../../src/inputnumber/inputnumberview.js';
import DropdownView from '../../src/dropdown/dropdownview.js';
import { TextareaView } from '@ckeditor/ckeditor5-ui';

describe( 'LabeledFieldView utils', () => {
	let locale;

	testUtils.createSinonSandbox();

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
			expect( labeledInput.fieldView ).to.be.instanceOf( InputTextView );
		} );

		it( 'should pass the Locale to the input', () => {
			expect( labeledInput.fieldView.locale ).to.equal( locale );
		} );

		it( 'should set input #id and #ariaDescribedById', () => {
			labeledInput.render();

			expect( labeledInput.fieldView.id ).to.equal( labeledInput.labelView.for );
			expect( labeledInput.fieldView.ariaDescribedById ).to.equal( labeledInput.statusView.element.id );
		} );

		it( 'should bind input\'s #isReadOnly to labeledInput#isEnabled', () => {
			labeledInput.isEnabled = true;
			expect( labeledInput.fieldView.isReadOnly ).to.be.false;

			labeledInput.isEnabled = false;
			expect( labeledInput.fieldView.isReadOnly ).to.be.true;
		} );

		it( 'should bind input\'s #hasError to labeledInput#errorText', () => {
			labeledInput.errorText = 'some error';
			expect( labeledInput.fieldView.hasError ).to.be.true;

			labeledInput.errorText = null;
			expect( labeledInput.fieldView.hasError ).to.be.false;
		} );

		it( 'should bind labeledInput#isEmpty to input\'s #isEmpty', () => {
			labeledInput.fieldView.isEmpty = true;
			expect( labeledInput.isEmpty ).to.be.true;

			labeledInput.fieldView.isEmpty = false;
			expect( labeledInput.isEmpty ).to.be.false;
		} );

		it( 'should bind labeledInput#isFocused to input\'s #isFocused', () => {
			labeledInput.fieldView.isFocused = true;
			expect( labeledInput.isFocused ).to.be.true;

			labeledInput.fieldView.isFocused = false;
			expect( labeledInput.isFocused ).to.be.false;
		} );

		it( 'should bind labeledInput#placeholder to input\'s #placeholder', () => {
			labeledInput.fieldView.placeholder = null;
			expect( labeledInput.placeholder ).to.be.null;

			labeledInput.fieldView.placeholder = 'foo';
			expect( labeledInput.placeholder ).to.equal( 'foo' );
		} );

		it( 'should clean labeledInput#errorText upon input\'s DOM "update" event', () => {
			labeledInput.errorText = 'some error';
			labeledInput.fieldView.fire( 'input' );
			expect( labeledInput.errorText ).to.be.null;
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
			expect( labeledInput.fieldView ).to.be.instanceOf( InputNumberView );
		} );

		it( 'should pass the Locale to the input', () => {
			expect( labeledInput.fieldView.locale ).to.equal( locale );
		} );

		it( 'should set input #id and #ariaDescribedById', () => {
			labeledInput.render();

			expect( labeledInput.fieldView.id ).to.equal( labeledInput.labelView.for );
			expect( labeledInput.fieldView.ariaDescribedById ).to.equal( labeledInput.statusView.element.id );
		} );

		it( 'should set #inputMode to "numeric"', () => {
			expect( labeledInput.fieldView.inputMode ).to.equal( 'numeric' );
		} );

		it( 'should bind input\'s #isReadOnly to labeledInput#isEnabled', () => {
			labeledInput.isEnabled = true;
			expect( labeledInput.fieldView.isReadOnly ).to.be.false;

			labeledInput.isEnabled = false;
			expect( labeledInput.fieldView.isReadOnly ).to.be.true;
		} );

		it( 'should bind input\'s #hasError to labeledInput#errorText', () => {
			labeledInput.errorText = 'some error';
			expect( labeledInput.fieldView.hasError ).to.be.true;

			labeledInput.errorText = null;
			expect( labeledInput.fieldView.hasError ).to.be.false;
		} );

		it( 'should bind labeledInput#isEmpty to input\'s #isEmpty', () => {
			labeledInput.fieldView.isEmpty = true;
			expect( labeledInput.isEmpty ).to.be.true;

			labeledInput.fieldView.isEmpty = false;
			expect( labeledInput.isEmpty ).to.be.false;
		} );

		it( 'should bind labeledInput#isFocused to input\'s #isFocused', () => {
			labeledInput.fieldView.isFocused = true;
			expect( labeledInput.isFocused ).to.be.true;

			labeledInput.fieldView.isFocused = false;
			expect( labeledInput.isFocused ).to.be.false;
		} );

		it( 'should bind labeledInput#placeholder to input\'s #placeholder', () => {
			labeledInput.fieldView.placeholder = null;
			expect( labeledInput.placeholder ).to.be.null;

			labeledInput.fieldView.placeholder = 'foo';
			expect( labeledInput.placeholder ).to.equal( 'foo' );
		} );

		it( 'should clean labeledInput#errorText upon input\'s DOM "update" event', () => {
			labeledInput.errorText = 'some error';
			labeledInput.fieldView.fire( 'input' );
			expect( labeledInput.errorText ).to.be.null;
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
			expect( labeledTextarea.fieldView ).to.be.instanceOf( TextareaView );
		} );

		it( 'should pass the Locale to the textarea', () => {
			expect( labeledTextarea.fieldView.locale ).to.equal( locale );
		} );

		it( 'should set textarea #id and #ariaDescribedById', () => {
			labeledTextarea.render();

			expect( labeledTextarea.fieldView.id ).to.equal( labeledTextarea.labelView.for );
			expect( labeledTextarea.fieldView.ariaDescribedById ).to.equal( labeledTextarea.statusView.element.id );
		} );

		it( 'should bind textarea\'s #isReadOnly to labeledTextarea#isEnabled', () => {
			labeledTextarea.isEnabled = true;
			expect( labeledTextarea.fieldView.isReadOnly ).to.be.false;

			labeledTextarea.isEnabled = false;
			expect( labeledTextarea.fieldView.isReadOnly ).to.be.true;
		} );

		it( 'should bind textarea\'s #hasError to labeledTextarea#errorText', () => {
			labeledTextarea.errorText = 'some error';
			expect( labeledTextarea.fieldView.hasError ).to.be.true;

			labeledTextarea.errorText = null;
			expect( labeledTextarea.fieldView.hasError ).to.be.false;
		} );

		it( 'should bind labeledTextarea#isEmpty to textarea\'s #isEmpty', () => {
			labeledTextarea.fieldView.isEmpty = true;
			expect( labeledTextarea.isEmpty ).to.be.true;

			labeledTextarea.fieldView.isEmpty = false;
			expect( labeledTextarea.isEmpty ).to.be.false;
		} );

		it( 'should bind labeledTextarea#isFocused to textarea\'s #isFocused', () => {
			labeledTextarea.fieldView.isFocused = true;
			expect( labeledTextarea.isFocused ).to.be.true;

			labeledTextarea.fieldView.isFocused = false;
			expect( labeledTextarea.isFocused ).to.be.false;
		} );

		it( 'should bind labeledTextarea#placeholder to textarea\'s #placeholder', () => {
			labeledTextarea.fieldView.placeholder = null;
			expect( labeledTextarea.placeholder ).to.be.null;

			labeledTextarea.fieldView.placeholder = 'foo';
			expect( labeledTextarea.placeholder ).to.equal( 'foo' );
		} );

		it( 'should clean labeledTextarea#errorText upon textarea\'s DOM "update" event', () => {
			labeledTextarea.errorText = 'some error';
			labeledTextarea.fieldView.fire( 'input' );
			expect( labeledTextarea.errorText ).to.be.null;
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
			expect( labeledDropdown.fieldView ).to.be.instanceOf( DropdownView );
		} );

		it( 'should pass the Locale to the dropdown', () => {
			expect( labeledDropdown.fieldView.locale ).to.equal( locale );
		} );

		it( 'should set dropdown\'s #id and #ariaDescribedById', () => {
			labeledDropdown.render();

			expect( labeledDropdown.fieldView.id ).to.equal( labeledDropdown.labelView.for );
			expect( labeledDropdown.fieldView.ariaDescribedById ).to.equal( labeledDropdown.statusView.element.id );
		} );

		it( 'should bind dropdown\'s #isEnabled to the labeled view', () => {
			labeledDropdown.isEnabled = true;
			expect( labeledDropdown.fieldView.isEnabled ).to.be.true;

			labeledDropdown.isEnabled = false;
			expect( labeledDropdown.fieldView.isEnabled ).to.be.false;
		} );
	} );
} );
