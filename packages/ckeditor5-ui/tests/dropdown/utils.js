/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import utilsTestUtils from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

import Model from '../../src/model';

import ButtonView from '../../src/button/buttonview';
import DropdownView from '../../src/dropdown/dropdownview';
import DropdownPanelView from '../../src/dropdown/dropdownpanelview';
import SplitButtonView from '../../src/button/splitbuttonview';
import { createDropdown, createSplitButtonDropdown } from '../../src/dropdown/utils';

const assertBinding = utilsTestUtils.assertBinding;

describe( 'utils', () => {
	let locale;

	beforeEach( () => {
		locale = { t() {} };
	} );

	describe( 'createDropdown()', () => {
		let dropdownView, model;

		beforeEach( () => {
			model = new Model();
			dropdownView = createDropdown( model, locale );
		} );

		it( 'accepts locale', () => {
			expect( dropdownView.locale ).to.equal( locale );
			expect( dropdownView.panelView.locale ).to.equal( locale );
		} );

		it( 'returns view', () => {
			expect( dropdownView ).to.be.instanceOf( DropdownView );
		} );

		it( 'creates dropdown#panelView out of DropdownPanelView', () => {
			expect( dropdownView.panelView ).to.be.instanceOf( DropdownPanelView );
		} );

		it( 'creates dropdown#buttonView out of ButtonView', () => {
			expect( dropdownView.buttonView ).to.be.instanceOf( ButtonView );
		} );

		it( 'binds button attributes to the model', () => {
			const modelDef = {
				label: 'foo',
				isOn: false,
				isEnabled: true,
				withText: false,
				tooltip: false
			};

			model = new Model( modelDef );
			dropdownView = createDropdown( model, locale );

			assertBinding( dropdownView.buttonView,
				modelDef,
				[
					[ model, { label: 'bar', isEnabled: false, isOn: true, withText: true, tooltip: true } ]
				],
				{ label: 'bar', isEnabled: false, isOn: true, withText: true, tooltip: true }
			);
		} );

		it( 'binds button#isOn do dropdown #isOpen and model #isOn', () => {
			const modelDef = {
				label: 'foo',
				isOn: false,
				isEnabled: true,
				withText: false,
				tooltip: false
			};

			model = new Model( modelDef );
			dropdownView = createDropdown( model, locale );

			dropdownView.isOpen = false;
			expect( dropdownView.buttonView.isOn ).to.be.false;

			model.isOn = true;
			expect( dropdownView.buttonView.isOn ).to.be.true;

			dropdownView.isOpen = true;
			expect( dropdownView.buttonView.isOn ).to.be.true;

			model.isOn = false;
			expect( dropdownView.buttonView.isOn ).to.be.true;
		} );

		it( 'binds dropdown#isEnabled to the model', () => {
			const modelDef = {
				label: 'foo',
				isEnabled: true,
				withText: false,
				tooltip: false
			};

			model = new Model( modelDef );
			dropdownView = createDropdown( model, locale );

			assertBinding( dropdownView,
				{ isEnabled: true },
				[
					[ model, { isEnabled: false } ]
				],
				{ isEnabled: false }
			);
		} );

		describe( '#buttonView', () => {
			it( 'accepts locale', () => {
				expect( dropdownView.buttonView.locale ).to.equal( locale );
			} );

			it( 'is a ButtonView instance', () => {
				expect( dropdownView.buttonView ).to.be.instanceof( ButtonView );
			} );

			it( 'delegates "execute" to "select" event', () => {
				const spy = sinon.spy();

				dropdownView.buttonView.on( 'select', spy );

				dropdownView.buttonView.fire( 'execute' );

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'createSplitButtonDropdown()', () => {
		let dropdownView, model;

		beforeEach( () => {
			model = new Model();
			dropdownView = createSplitButtonDropdown( model, locale );
		} );

		it( 'accepts locale', () => {
			expect( dropdownView.locale ).to.equal( locale );
			expect( dropdownView.panelView.locale ).to.equal( locale );
		} );

		it( 'returns view', () => {
			expect( dropdownView ).to.be.instanceOf( DropdownView );
		} );

		it( 'creates dropdown#panelView out of DropdownPanelView', () => {
			expect( dropdownView.panelView ).to.be.instanceOf( DropdownPanelView );
		} );

		it( 'creates dropdown#buttonView out of SplitButtonView', () => {
			expect( dropdownView.buttonView ).to.be.instanceOf( SplitButtonView );
		} );

		it( 'binds button attributes to the model', () => {
			const modelDef = {
				label: 'foo',
				isOn: false,
				isEnabled: true,
				withText: false,
				tooltip: false
			};

			model = new Model( modelDef );
			dropdownView = createDropdown( model, locale );

			assertBinding( dropdownView.buttonView,
				modelDef,
				[
					[ model, { label: 'bar', isEnabled: false, isOn: true, withText: true, tooltip: true } ]
				],
				{ label: 'bar', isEnabled: false, isOn: true, withText: true, tooltip: true }
			);
		} );

		it( 'binds button#isOn do dropdown #isOpen and model #isOn', () => {
			const modelDef = {
				label: 'foo',
				isOn: false,
				isEnabled: true,
				withText: false,
				tooltip: false
			};

			model = new Model( modelDef );
			dropdownView = createDropdown( model, locale );

			dropdownView.isOpen = false;
			expect( dropdownView.buttonView.isOn ).to.be.false;

			model.isOn = true;
			expect( dropdownView.buttonView.isOn ).to.be.true;

			dropdownView.isOpen = true;
			expect( dropdownView.buttonView.isOn ).to.be.true;

			model.isOn = false;
			expect( dropdownView.buttonView.isOn ).to.be.true;
		} );

		it( 'binds dropdown#isEnabled to the model', () => {
			const modelDef = {
				label: 'foo',
				isEnabled: true,
				withText: false,
				tooltip: false
			};

			model = new Model( modelDef );
			dropdownView = createDropdown( model, locale );

			assertBinding( dropdownView,
				{ isEnabled: true },
				[
					[ model, { isEnabled: false } ]
				],
				{ isEnabled: false }
			);
		} );

		describe( '#buttonView', () => {
			it( 'accepts locale', () => {
				expect( dropdownView.buttonView.locale ).to.equal( locale );
			} );

			it( 'returns SplitButtonView instance', () => {
				expect( dropdownView.buttonView ).to.be.instanceof( SplitButtonView );
			} );
		} );
	} );
} );
