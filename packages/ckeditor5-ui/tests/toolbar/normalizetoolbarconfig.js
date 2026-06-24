/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { normalizeToolbarConfig } from '../../src/toolbar/normalizetoolbarconfig.js';

describe( 'normalizeToolbarConfig()', () => {
	it( 'normalizes the config specified as an Array', () => {
		const items = [ 'foo', 'bar' ];
		const normalized = normalizeToolbarConfig( items );

		expect( normalized ).toBeTypeOf( 'object' );
		expect( normalized ).toEqual(
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

		expect( normalized ).toEqual(
			Object.assign( { removeItems: [] }, cfg )
		);
	} );

	it( 'adds missing items property', () => {
		const cfg = {
			foo: 'bar'
		};

		const normalized = normalizeToolbarConfig( cfg );

		expect( normalized ).toEqual( {
			items: [],
			removeItems: [],
			foo: 'bar'
		} );
		expect( normalized ).not.toBe( cfg ); // Make sure we don't modify an existing obj.
	} );

	it( 'returns an empty config if config is not defined', () => {
		const normalized = normalizeToolbarConfig();

		expect( normalized ).toBeTypeOf( 'object' );
		expect( normalized.items ).toBeInstanceOf( Array );
		expect( normalized.items ).toHaveLength( 0 );
		expect( normalized.removeItems ).toBeInstanceOf( Array );
		expect( normalized.removeItems ).toHaveLength( 0 );
	} );
} );
