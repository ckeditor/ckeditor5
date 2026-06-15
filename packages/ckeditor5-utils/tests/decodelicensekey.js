/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';

import { decodeLicenseKey } from '../src/decodelicensekey.js';

describe( 'utils', () => {
	describe( 'decodeLicenseKey', () => {
		it( 'should return null if license key is not provided', () => {
			expect( decodeLicenseKey() ).toBeNull();
		} );

		it( 'should return null if license key format is not valid', () => {
			expect( decodeLicenseKey( 'GPL' ) ).toBeNull();
		} );

		it( 'should return decoded payload from license key', () => {
			const obj = { foo: 1 };
			const payload = btoa( JSON.stringify( obj ) );

			expect( decodeLicenseKey( `header.${ payload }.signature` ) ).toEqual( obj );
		} );
	} );
} );
