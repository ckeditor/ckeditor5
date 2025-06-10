/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { UIModel } from '../src/model.js';

let Car, car;

describe( 'UIModel', () => {
	beforeEach( () => {
		Car = class extends UIModel {};

		car = new Car( {
			color: 'red',
			year: 2015
		} );
	} );

	it( 'should set attributes on creation', () => {
		expect( car ).to.have.property( 'color', 'red' );
		expect( car ).to.have.property( 'year', 2015 );

		const spy = sinon.spy();

		car.on( 'change:color', spy );
		car.color = 'blue';

		expect( spy.called ).to.be.true;
	} );

	it( 'should add properties on creation', () => {
		const car = new Car( null, {
			prop: 1
		} );

		expect( car ).to.have.property( 'prop', 1 );
	} );
} );
