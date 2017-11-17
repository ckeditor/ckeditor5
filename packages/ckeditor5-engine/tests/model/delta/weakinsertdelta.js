/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import WeakInsertDelta from '../../../src/model/delta/weakinsertdelta';

describe( 'WeakInsertDelta', () => {
	it( 'should provide proper className', () => {
		expect( WeakInsertDelta.className ).to.equal( 'engine.model.delta.WeakInsertDelta' );
	} );
} );
