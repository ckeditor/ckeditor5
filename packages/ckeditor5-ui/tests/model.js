/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
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
		expect( car ).toHaveProperty( 'color', 'red' );
		expect( car ).toHaveProperty( 'year', 2015 );

		const spy = vi.fn();

		car.on( 'change:color', spy );
		car.color = 'blue';

		expect( spy ).toHaveBeenCalled();
	} );

	it( 'should add properties on creation', () => {
		const car = new Car( null, {
			prop: 1
		} );

		expect( car ).toHaveProperty( 'prop', 1 );
	} );
} );
