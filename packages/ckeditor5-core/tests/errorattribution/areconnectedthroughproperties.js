/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';

import { areConnectedThroughProperties } from '../../src/errorattribution/areconnectedthroughproperties.js';

// This function and the `getSubNodes()` it walks with exist for as long as error attribution has to search
// object graphs. The cases below cover the paths that attribution itself never reaches — the rest is
// exercised through `resolveErrorSource()`.
describe( 'areConnectedThroughProperties()', () => {
	it( 'should return true for one and the same object', () => {
		const shared = { foo: 'bar' };

		expect( areConnectedThroughProperties( shared, shared ) ).toBe( true );
	} );

	it( 'should return false for the same primitive, which cannot connect anything', () => {
		expect( areConnectedThroughProperties( 'foo', 'foo' ) ).toBe( false );
		expect( areConnectedThroughProperties( null, null ) ).toBe( false );
	} );

	it( 'should return true for two objects holding the same object', () => {
		const shared = {};

		expect( areConnectedThroughProperties( { shared }, { shared } ) ).toBe( true );
	} );

	it( 'should return false for two objects that share nothing', () => {
		expect( areConnectedThroughProperties( { foo: {} }, { bar: {} } ) ).toBe( false );
	} );

	// The protobuf library shares this one property between editors, so a value found under it must not
	// count as a connection.
	it( 'should not connect two objects through a `defaultValue` property', () => {
		const shared = {};

		expect( areConnectedThroughProperties( { defaultValue: shared }, { defaultValue: shared } ) ).toBe( false );
	} );

	it( 'should still connect through another property holding the same object', () => {
		const shared = {};

		expect( areConnectedThroughProperties(
			{ defaultValue: shared, other: shared },
			{ defaultValue: shared, other: shared }
		) ).toBe( true );
	} );

	it( 'should respect the excluded nodes', () => {
		const shared = {};

		expect( areConnectedThroughProperties( { shared }, { shared }, new Set( [ shared ] ) ) ).toBe( false );
	} );
} );
