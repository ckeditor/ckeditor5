/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model';

import ButtonView from '../../../src/button/buttonview';

import createButtonForDropdown from '../../../src/dropdown/helpers/createbuttonfordropdown';

describe( 'createButtonForDropdown()', () => {
	let buttonView, locale;

	beforeEach( () => {
		locale = { t() {} };
		buttonView = createButtonForDropdown( new Model(), locale );
	} );

	it( 'accepts locale', () => {
		expect( buttonView.locale ).to.equal( locale );
	} );

	it( 'returns ButtonView instance', () => {
		expect( buttonView ).to.be.instanceof( ButtonView );
	} );

	it( 'delegates "execute" to "select" event', () => {
		const spy = sinon.spy();

		buttonView.on( 'select', spy );

		buttonView.fire( 'execute' );

		sinon.assert.calledOnce( spy );
	} );
} );
