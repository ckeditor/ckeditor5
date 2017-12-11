/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import RemoveDelta from '../../../src/model/delta/removedelta';

describe( 'RemoveDelta', () => {
	it( 'should provide proper className', () => {
		expect( RemoveDelta.className ).to.equal( 'engine.model.delta.RemoveDelta' );
	} );
} );
