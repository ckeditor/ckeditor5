/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model';

import enableModelIfOneIsEnabled from '../../../src/dropdown/helpers/enablemodelifoneisenabled';

describe( 'enableModelIfOneIsEnabled()', () => {
	it( 'Bind to #isEnabled of each observable  and set it true if any observable #isEnabled is true', () => {
		const model = new Model();
		const observables = [
			new Model( { isEnabled: false } ),
			new Model( { isEnabled: false } ),
			new Model( { isEnabled: false } )
		];
		enableModelIfOneIsEnabled( model, observables );

		expect( model.isEnabled ).to.be.false;

		observables[ 0 ].isEnabled = true;

		expect( model.isEnabled ).to.be.true;

		observables[ 0 ].isEnabled = false;

		expect( model.isEnabled ).to.be.false;

		observables[ 1 ].isEnabled = true;

		expect( model.isEnabled ).to.be.true;
	} );
} );
