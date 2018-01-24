/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import utilsTestUtils from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

import Model from '../../../src/model';

import ButtonView from '../../../src/button/buttonview';
import DropdownView from '../../../src/dropdown/dropdownview';
import DropdownPanelView from '../../../src/dropdown/dropdownpanelview';
import createButtonForDropdown from '../../../src/dropdown/helpers/createbuttonfordropdown';
import createDropdownView from '../../../src/dropdown/helpers/createdropdownview';

const assertBinding = utilsTestUtils.assertBinding;

describe( 'createDropdownView()', () => {
	let dropdownView, buttonView, model, locale;

	beforeEach( () => {
		locale = { t() {} };
		model = new Model();
		buttonView = createButtonForDropdown( model, locale );
		dropdownView = createDropdownView( model, buttonView, locale );
	} );

	it( 'accepts locale', () => {
		expect( dropdownView.locale ).to.equal( locale );
		expect( dropdownView.panelView.locale ).to.equal( locale );
	} );

	it( 'returns view', () => {
		model = new Model();
		buttonView = new ButtonView();
		dropdownView = createDropdownView( model, buttonView, locale );

		expect( dropdownView ).to.be.instanceOf( DropdownView );
	} );

	it( 'creates dropdown#panelView out of DropdownPanelView', () => {
		model = new Model();
		buttonView = new ButtonView();
		dropdownView = createDropdownView( model, buttonView, locale );

		expect( dropdownView.panelView ).to.be.instanceOf( DropdownPanelView );
	} );

	it( 'creates dropdown#buttonView out of buttonView', () => {
		model = new Model();
		buttonView = new ButtonView();
		dropdownView = createDropdownView( model, buttonView, locale );

		expect( dropdownView.buttonView ).to.equal( buttonView );
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
		buttonView = new ButtonView();
		createDropdownView( model, buttonView, locale );

		assertBinding( buttonView,
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
		buttonView = new ButtonView();
		dropdownView = createDropdownView( model, buttonView, locale );

		dropdownView.isOpen = false;
		expect( buttonView.isOn ).to.be.false;

		model.isOn = true;
		expect( buttonView.isOn ).to.be.true;

		dropdownView.isOpen = true;
		expect( buttonView.isOn ).to.be.true;

		model.isOn = false;
		expect( buttonView.isOn ).to.be.true;
	} );

	it( 'binds dropdown#isEnabled to the model', () => {
		const modelDef = {
			label: 'foo',
			isEnabled: true,
			withText: false,
			tooltip: false
		};

		model = new Model( modelDef );
		buttonView = new ButtonView();
		dropdownView = createDropdownView( model, buttonView, locale );

		assertBinding( dropdownView,
			{ isEnabled: true },
			[
				[ model, { isEnabled: false } ]
			],
			{ isEnabled: false }
		);
	} );
} );
