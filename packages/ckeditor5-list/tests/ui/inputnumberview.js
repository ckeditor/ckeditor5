/**
 * @license Copyright (c) 2003-2022, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import InputNumberView, { createLabeledInputNumber } from '../../src/ui/inputnumberview';

import { LabeledFieldView, InputView } from '@ckeditor/ckeditor5-ui';

describe( 'InputNumberView', () => {
	let view;

	beforeEach( () => {
		view = new InputNumberView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should extend InputView', () => {
			expect( view ).to.be.instanceOf( InputView );
		} );

		it( 'should create element from template', () => {
			expect( view.element.getAttribute( 'type' ) ).to.equal( 'number' );
			expect( view.element.type ).to.equal( 'number' );
			expect( view.element.classList.contains( 'ck-input-number' ) ).to.be.true;

			expect( view.element.getAttribute( 'min' ) ).to.be.null;
			expect( view.element.getAttribute( 'max' ) ).to.be.null;
			expect( view.element.getAttribute( 'step' ) ).to.be.null;
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'min attribute', () => {
			it( 'should respond to view#min', () => {
				expect( view.element.getAttribute( 'min' ) ).to.be.null;

				view.min = 20;

				expect( view.element.getAttribute( 'min' ) ).to.equal( '20' );
			} );
		} );

		describe( 'max attribute', () => {
			it( 'should respond to view#max', () => {
				expect( view.element.getAttribute( 'max' ) ).to.be.null;

				view.max = 20;

				expect( view.element.getAttribute( 'max' ) ).to.equal( '20' );
			} );
		} );

		describe( 'step attribute', () => {
			it( 'should respond to view#step', () => {
				expect( view.element.getAttribute( 'step' ) ).to.be.null;

				view.step = 20;

				expect( view.element.getAttribute( 'step' ) ).to.equal( '20' );
			} );
		} );
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
