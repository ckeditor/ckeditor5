/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { isFeatureAllowedByLicenseKey } from '../src/isfeatureallowedbylicensekey.js';

describe( 'utils', () => {
	describe( 'isFeatureAllowedByLicenseKey', () => {
		it( 'should return false if license does not provide capability to allow a feature', () => {
			expect( isFeatureAllowedByLicenseKey( {}, 'FOO' ) ).to.be.false;
		} );

		it( 'should return false if license does not allow any feature', () => {
			expect( isFeatureAllowedByLicenseKey( { features: [] }, 'FOO' ) ).to.be.false;
		} );

		it( 'should return false for FOO feature if FOO feature is not allowed', () => {
			expect( isFeatureAllowedByLicenseKey( { features: [ 'BAR' ] }, 'FOO' ) ).to.be.false;
		} );

		it( 'should return true for FOO feature if FOO feature is allowed', () => {
			expect( isFeatureAllowedByLicenseKey( { features: [ 'FOO', 'BAR' ] }, 'FOO' ) ).to.be.true;
		} );

		it( 'should return true for FOO feature if "*" wildcard value is allowed', () => {
			expect( isFeatureAllowedByLicenseKey( { features: [ '*' ] }, 'FOO' ) ).to.be.true;
		} );
	} );
} );
