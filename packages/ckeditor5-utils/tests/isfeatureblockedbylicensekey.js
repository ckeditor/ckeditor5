/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { isFeatureBlockedByLicenseKey } from '../src/isfeatureblockedbylicensekey.js';

describe( 'utils', () => {
	describe( 'isFeatureBlockedByLicenseKey', () => {
		it( 'should return false if license does not provide capability to block a feature', () => {
			expect( isFeatureBlockedByLicenseKey( {}, 'FOO' ) ).toBe( false );
		} );

		it( 'should return false if license does not block any feature', () => {
			expect( isFeatureBlockedByLicenseKey( { removeFeatures: [] }, 'FOO' ) ).toBe( false );
		} );

		it( 'should return false for FOO feature if FOO feature is not blocked', () => {
			expect( isFeatureBlockedByLicenseKey( { removeFeatures: [ 'BAR' ] }, 'FOO' ) ).toBe( false );
		} );

		it( 'should return true for FOO feature if FOO feature is blocked', () => {
			expect( isFeatureBlockedByLicenseKey( { removeFeatures: [ 'FOO', 'BAR' ] }, 'FOO' ) ).toBe( true );
		} );
	} );
} );
