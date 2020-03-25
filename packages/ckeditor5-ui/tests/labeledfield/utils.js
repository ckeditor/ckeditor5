/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	createLabeledInputText,
	createLabeledDropdown
} from '../../src/labeledfield/utils';

import LabeledFieldView from '../../src/labeledfield/labeledfieldview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import InputTextView from '../../src/inputtext/inputtextview';
import DropdownView from '../../src/dropdown/dropdownview';

describe( 'LabeledFieldView utils', () => {
	let locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = { t: val => val };
	} );

	describe( 'createLabeledInputText()', () => {
		let labeledFieldView;

		beforeEach( () => {
			labeledFieldView = new LabeledFieldView( locale, createLabeledInputText );
		} );

		afterEach( () => {
			labeledFieldView.destroy();
		} );

		it( 'should create an InputTextView instance', () => {
			expect( labeledFieldView.field ).to.be.instanceOf( InputTextView );
		} );

		it( 'should pass the Locale to the input', () => {
			expect( labeledFieldView.field.locale ).to.equal( locale );
		} );

		it( 'should set input #id and #ariaDescribedById', () => {
			labeledFieldView.render();

			expect( labeledFieldView.field.id ).to.equal( labeledFieldView.labelView.for );
			expect( labeledFieldView.field.ariaDescribedById ).to.equal( labeledFieldView.statusView.element.id );
		} );

		it( 'should bind input\'s #isReadOnly to LabeledFieldView#isEnabled', () => {
			labeledFieldView.isEnabled = true;
			expect( labeledFieldView.field.isReadOnly ).to.be.false;

			labeledFieldView.isEnabled = false;
			expect( labeledFieldView.field.isReadOnly ).to.be.true;
		} );

		it( 'should bind input\'s #hasError to LabeledFieldView#errorText', () => {
			labeledFieldView.errorText = 'some error';
			expect( labeledFieldView.field.hasError ).to.be.true;

			labeledFieldView.errorText = null;
			expect( labeledFieldView.field.hasError ).to.be.false;
		} );

		it( 'should clean LabeledFieldView#errorText upon input\'s DOM "update" event', () => {
			labeledFieldView.errorText = 'some error';
			labeledFieldView.field.fire( 'input' );
			expect( labeledFieldView.errorText ).to.be.null;
		} );
	} );

	describe( 'createLabeledDropdown', () => {
		let labeledFieldView;

		beforeEach( () => {
			labeledFieldView = new LabeledFieldView( locale, createLabeledDropdown );
		} );

		afterEach( () => {
			labeledFieldView.destroy();
		} );

		it( 'should create a DropdownView', () => {
			expect( labeledFieldView.field ).to.be.instanceOf( DropdownView );
		} );

		it( 'should pass the Locale to the dropdown', () => {
			expect( labeledFieldView.field.locale ).to.equal( locale );
		} );

		it( 'should set dropdown\'s #id and #ariaDescribedById', () => {
			labeledFieldView.render();

			expect( labeledFieldView.field.id ).to.equal( labeledFieldView.labelView.for );
			expect( labeledFieldView.field.ariaDescribedById ).to.equal( labeledFieldView.statusView.element.id );
		} );

		it( 'should bind dropdown\'s #isEnabled to the labeled view', () => {
			labeledFieldView.isEnabled = true;
			expect( labeledFieldView.field.isEnabled ).to.be.true;

			labeledFieldView.isEnabled = false;
			expect( labeledFieldView.field.isEnabled ).to.be.false;
		} );
	} );
} );
