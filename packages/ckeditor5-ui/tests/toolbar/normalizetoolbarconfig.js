/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import normalizeToolbarConfig from '../../src/toolbar/normalizetoolbarconfig';

describe( 'normalizeToolbarConfig()', () => {
	it( 'normalizes the config specified as an Array', () => {
		const cfg = [ 'foo', 'bar' ];
		const normalized = normalizeToolbarConfig( cfg );

		expect( normalized ).to.be.an( 'object' );
		expect( normalized.items ).to.equal( cfg );
	} );

	it( 'passes through an already normalized config', () => {
		const cfg = {
			items: [ 'foo', 'bar' ],
			foo: 'bar'
		};
		const normalized = normalizeToolbarConfig( cfg );

		expect( normalized ).to.equal( cfg );
		expect( normalized.items ).to.equal( cfg.items );
		expect( normalized.foo ).to.equal( cfg.foo );
	} );
} );
