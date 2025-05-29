/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import generateLicenseKey from '../_utils/generatelicensekey.js';

describe( 'generateLicenseKey util', () => {
	describe( 'generateLicenseKey()', () => {
		it( 'should generate a license key with custom properties', () => {
			const { licenseKey } = generateLicenseKey( {
				licensedHosts: [ 'example.com' ],
				licenseType: 'trial',
				usageEndpoint: 'https://example.com/usage',
				distributionChannel: 'cdn',
				whiteLabel: true
			} );

			const decodedPayload = JSON.parse( atob( licenseKey.split( '.' )[ 1 ] ) );

			expect( decodedPayload.licensedHosts ).to.deep.equal( [ 'example.com' ] );
			expect( decodedPayload.licenseType ).to.equal( 'trial' );
			expect( decodedPayload.usageEndpoint ).to.equal( 'https://example.com/usage' );
			expect( decodedPayload.distributionChannel ).to.equal( 'cdn' );
			expect( decodedPayload.whiteLabel ).to.be.true;
		} );

		it( 'should generate a license key without header and tail', () => {
			const { licenseKey } = generateLicenseKey( {
				skipHeader: true,
				skipTail: true
			} );

			expect( licenseKey.startsWith( 'foo.' ) ).to.be.false;
			expect( licenseKey.endsWith( '.bar' ) ).to.be.false;
		} );

		it( 'should generate a license key with custom VC', () => {
			const { licenseKey } = generateLicenseKey( {
				customVc: 'abc123'
			} );

			const decodedPayload = JSON.parse( atob( licenseKey.split( '.' )[ 1 ] ) );

			expect( decodedPayload.vc ).to.equal( 'abc123' );
		} );

		it( 'should generate a license key with custom expiration date', () => {
			const { licenseKey } = generateLicenseKey( {
				isExpired: true
			} );

			const decodedPayload = JSON.parse( atob( licenseKey.split( '.' )[ 1 ] ) );

			expect( decodedPayload.exp ).to.be.below( Date.now() / 1000 );
		} );

		it( 'should generate a license key with custom jti', () => {
			const { licenseKey } = generateLicenseKey( {
				jtiExist: false
			} );

			const decodedPayload = JSON.parse( atob( licenseKey.split( '.' )[ 1 ] ) );

			expect( decodedPayload.jti ).to.be.undefined;
		} );
	} );
} );
