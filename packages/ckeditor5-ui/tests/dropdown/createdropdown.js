/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import utilsTestUtils from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import createDropdown from '../../src/dropdown/createdropdown';
import Model from '../../src/model';
import DropdownView from '../../src/dropdown/dropdownview';
import DropdownPanelView from '../../src/dropdown/dropdownpanelview';
import ButtonView from '../../src/button/buttonview';

const assertBinding = utilsTestUtils.assertBinding;

describe( 'createDropdown', () => {
	it( 'accepts model', () => {
		const modelDef = {
			label: 'foo',
			isOn: false,
			isEnabled: true,
			withText: false,
			tooltip: false
		};

		const model = new Model( modelDef );
		const view = createDropdown( model );

		assertBinding( view.buttonView,
			modelDef,
			[
				[ model, { label: 'bar', isOn: true, isEnabled: false, withText: true, tooltip: true } ]
			],
			{ label: 'bar', isOn: true, isEnabled: false, withText: true, tooltip: true }
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

