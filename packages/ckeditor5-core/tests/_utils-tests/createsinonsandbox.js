/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, afterEach } from 'vitest';

const obj = {
	method() {}
};
const origMethod = obj.method;
let spy;

describe( 'vi.spyOn() / vi.restoreAllMocks()', () => {
	afterEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'creates a spy', () => {
		spy = vi.spyOn( obj, 'method' );

		expect( spy ).toBeTypeOf( 'function' );
		expect( obj.method ).toBe( spy );
	} );

	// This test is needed for the following one.
	it( 'really works', () => {
		spy = vi.spyOn( obj, 'method' );

		expect( obj.method ).toBe( spy );
	} );

	it( 'restores spies after each test', () => {
		obj.method();

		expect( spy ).not.toHaveBeenCalled();
		expect( obj.method ).toBe( origMethod );
	} );
} );
