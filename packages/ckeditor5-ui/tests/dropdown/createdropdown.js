/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, dropdown */

import utilsTestUtils from 'ckeditor5-utils/tests/_utils/utils';
import createDropdown from 'ckeditor5-ui/src/dropdown/createdropdown';
import Model from 'ckeditor5-ui/src/model';
import DropdownView from 'ckeditor5-ui/src/dropdown/dropdownview';
import DropdownPanelView from 'ckeditor5-ui/src/dropdown/dropdownpanelview';
import ButtonView from 'ckeditor5-ui/src/button/buttonview';

const assertBinding = utilsTestUtils.assertBinding;

describe( 'createDropdown', () => {
	it( 'accepts model', () => {
		const modelDef = {
			label: 'foo',
			isOn: false,
			isEnabled: true,
			withText: false
		};

		const model = new Model( modelDef );
		const view = createDropdown( model );

		assertBinding( view.buttonView,
			modelDef,
			[
				[ model, { label: 'bar', isOn: true, isEnabled: false, withText: true } ]
			],
			{ label: 'bar', isOn: true, isEnabled: false, withText: true }
		);
	} );

	it( 'accepts locale', () => {
		const locale = {};
		const view = createDropdown( new Model(), locale );

		expect( view.locale ).to.equal( locale );
		expect( view.buttonView.locale ).to.equal( locale );
		expect( view.panelView.locale ).to.equal( locale );
	} );

	it( 'returns view', () => {
		const view = createDropdown( new Model() );

		expect( view ).to.be.instanceOf( DropdownView );
	} );

	it( 'creates dropdown#buttonView out of ButtonView', () => {
		const view = createDropdown( new Model() );

		expect( view.buttonView ).to.be.instanceOf( ButtonView );
	} );

	it( 'creates dropdown#panelView out of DropdownPanelView', () => {
		const view = createDropdown( new Model() );

		expect( view.panelView ).to.be.instanceOf( DropdownPanelView );
	} );
} );

