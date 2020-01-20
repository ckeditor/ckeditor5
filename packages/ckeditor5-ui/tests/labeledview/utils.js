/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	createLabeledInputText,
	createLabeledDropdown
} from '../../src/labeledview/utils';

import LabeledView from '../../src/labeledview/labeledview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import InputTextView from '../../src/inputtext/inputtextview';
import DropdownView from '../../src/dropdown/dropdownview';

describe( 'LabeledView utils', () => {
	let locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = { t: val => val };
	} );

	afterEach( () => {
	} );

	describe( 'createLabeledInputText()', () => {
		let labeledView;

		beforeEach( () => {
			labeledView = new LabeledView( locale, createLabeledInputText );
		} );

		afterEach( () => {
			labeledView.destroy();
		} );

		it( 'should create an InputTextView instance', () => {
			expect( labeledView.view ).to.be.instanceOf( InputTextView );
		} );

		it( 'should pass the Locale to the input', () => {
			expect( labeledView.view.locale ).to.equal( locale );
		} );

		it( 'should set input #id and #ariaDescribedById', () => {
			labeledView.render();

			expect( labeledView.view.id ).to.equal( labeledView.labelView.for );
			expect( labeledView.view.ariaDescribedById ).to.equal( labeledView.statusView.element.id );
		} );

		it( 'should bind input\'s #isReadOnly to LabeledView#isEnabled', () => {
			labeledView.isEnabled = true;
			expect( labeledView.view.isReadOnly ).to.be.false;

			labeledView.isEnabled = false;
			expect( labeledView.view.isReadOnly ).to.be.true;
		} );

		it( 'should bind input\'s #hasError to LabeledView#errorText', () => {
			labeledView.errorText = 'some error';
			expect( labeledView.view.hasError ).to.be.true;

			labeledView.errorText = null;
			expect( labeledView.view.hasError ).to.be.false;
		} );

		it( 'should clean LabeledView#errorText upon input\'s DOM "update" event', () => {
			labeledView.errorText = 'some error';
			labeledView.view.fire( 'input' );
			expect( labeledView.errorText ).to.be.null;
		} );
	} );

	describe( 'createLabeledDropdown', () => {
		let labeledView;

		beforeEach( () => {
			labeledView = new LabeledView( locale, createLabeledDropdown );
		} );

		afterEach( () => {
			labeledView.destroy();
		} );

		it( 'should create a DropdownView', () => {
			expect( labeledView.view ).to.be.instanceOf( DropdownView );
		} );

		it( 'should pass the Locale to the dropdown', () => {
			expect( labeledView.view.locale ).to.equal( locale );
		} );

		it( 'should set dropdown\'s #id and #ariaDescribedById', () => {
			labeledView.render();

			expect( labeledView.view.id ).to.equal( labeledView.labelView.for );
			expect( labeledView.view.ariaDescribedById ).to.equal( labeledView.statusView.element.id );
		} );

		it( 'should bind dropdown\'s #isEnabled to the labeled view', () => {
			labeledView.isEnabled = true;
			expect( labeledView.view.isEnabled ).to.be.true;

			labeledView.isEnabled = false;
			expect( labeledView.view.isEnabled ).to.be.false;
		} );
	} );
} );
