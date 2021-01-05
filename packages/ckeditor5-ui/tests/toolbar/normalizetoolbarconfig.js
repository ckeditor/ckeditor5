/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import normalizeToolbarConfig from '../../src/toolbar/normalizetoolbarconfig';

describe( 'normalizeToolbarConfig()', () => {
	it( 'normalizes the config specified as an Array', () => {
		const cfg = [ 'foo', 'bar' ];
		const normalized = normalizeToolbarConfig( cfg );

		expect( normalized ).to.be.an( 'object' );
		expect( normalized.items ).to.deep.equal( cfg );
	} );

	it( 'passes through an already normalized config', () => {
		const cfg = {
			items: [ 'foo', 'bar' ],
			foo: 'bar'
		};
		const normalized = normalizeToolbarConfig( cfg );

		expect( normalized ).to.deep.equal( cfg );
	} );

	it( 'adds missing items property', () => {
		const cfg = {
			foo: 'bar'
		};

		const normalized = normalizeToolbarConfig( cfg );

		expect( normalized ).to.deep.equal( {
			items: [],
			foo: 'bar'
		} );
		expect( normalized ).to.not.equal( cfg ); // Make sure we don't modify an existing obj.
	} );

	it( 'returns an empty config if config is not defined', () => {
		const normalized = normalizeToolbarConfig();

		expect( normalized ).to.be.an( 'object' );
		expect( normalized.items ).to.be.an( 'array' ).of.length( 0 );
	} );
} );
