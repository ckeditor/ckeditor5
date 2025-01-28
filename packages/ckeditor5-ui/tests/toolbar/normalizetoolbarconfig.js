/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import normalizeToolbarConfig from '../../src/toolbar/normalizetoolbarconfig.js';

describe( 'normalizeToolbarConfig()', () => {
	it( 'normalizes the config specified as an Array', () => {
		const items = [ 'foo', 'bar' ];
		const normalized = normalizeToolbarConfig( items );

		expect( normalized ).to.be.an( 'object' );
		expect( normalized ).to.deep.equal(
			{
				items,
				removeItems: []
			}
		);
	} );

	it( 'passes through an already normalized config', () => {
		const cfg = {
			items: [ 'foo', 'bar' ],
			foo: 'bar'
		};
		const normalized = normalizeToolbarConfig( cfg );

		expect( normalized ).to.deep.equal(
			Object.assign( { removeItems: [] }, cfg )
		);
	} );

	it( 'adds missing items property', () => {
		const cfg = {
			foo: 'bar'
		};

		const normalized = normalizeToolbarConfig( cfg );

		expect( normalized ).to.deep.equal( {
			items: [],
			removeItems: [],
			foo: 'bar'
		} );
		expect( normalized ).to.not.equal( cfg ); // Make sure we don't modify an existing obj.
	} );

	it( 'returns an empty config if config is not defined', () => {
		const normalized = normalizeToolbarConfig();

		expect( normalized ).to.be.an( 'object' );
		expect( normalized.items ).to.be.an( 'array' ).of.length( 0 );
		expect( normalized.removeItems ).to.be.an( 'array' ).of.length( 0 );
	} );
} );
