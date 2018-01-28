/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../src/model';

import bindOneToMany from './../../src/bindings/bindonetomany';

describe( 'bindOneToMany()', () => {
	it( 'binds observable property to collection property using callback', () => {
		const model = new Model();
		const observables = [
			new Model( { property: false } ),
			new Model( { property: false } ),
			new Model( { property: false } )
		];

		bindOneToMany( model, 'property', observables, 'property',
			( ...areEnabled ) => areEnabled.some( property => property )
		);

		expect( model.property ).to.be.false;

		observables[ 0 ].property = true;

		expect( model.property ).to.be.true;

		observables[ 0 ].property = false;

		expect( model.property ).to.be.false;

		observables[ 1 ].property = true;

		expect( model.property ).to.be.true;
	} );
} );
