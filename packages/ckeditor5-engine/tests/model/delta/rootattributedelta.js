/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import RootAttributeDelta from '../../../src/model/delta/rootattributedelta';

describe( 'RootAttributeDelta', () => {
	it( 'should provide proper className', () => {
		expect( RootAttributeDelta.className ).to.equal( 'engine.model.delta.RootAttributeDelta' );
	} );
} );
