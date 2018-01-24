/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model';
import SplitButtonView from '../../../src/button/splitbuttonview';

import createSplitButtonForDropdown from '../../../src/dropdown/helpers/createsplitbuttonfordropdown';

describe( 'createSplitButtonForDropdown()', () => {
	let buttonView, locale;

	beforeEach( () => {
		locale = { t() {} };
		buttonView = createSplitButtonForDropdown( new Model(), locale );
	} );

	it( 'accepts locale', () => {
		expect( buttonView.locale ).to.equal( locale );
	} );

	it( 'returns SplitButtonView instance', () => {
		expect( buttonView ).to.be.instanceof( SplitButtonView );
	} );
} );
