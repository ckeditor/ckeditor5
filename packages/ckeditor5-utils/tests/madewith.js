/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import verify from '../src/madewith';

describe( 'utils', () => {
	describe( 'verify', () => {
		describe( 'should return `VALID`', () => {
			it( 'when date is later than the release date', () => {
				// future
				const string = 'dG9vZWFzZXRtcHNsaXVyb3JsbWlkbS1NakEwTkRBMk1UST0=';

				expect( verify( string ) ).to.be.equal( 'VALID' );
			} );

			it( 'when old licence key is valid', () => {
				// eslint-disable-next-line max-len
				const string = 'YWZvb2JkcnphYXJhZWJvb290em9wbWJvbHJ1c21sZnJlYmFzdG1paXN1cm1tZmllenJhb2F0YmFvcmxvb3B6aWJvYWRiZWZzYXJ0bW9ibG8=';

				expect( verify( string ) ).to.be.equal( 'VALID' );
			} );
		} );

		describe( 'should return `INVALID`', () => {
			it( 'when passed variable is invalid', () => {
				// invalid
				const string = 'foobarbaz';

				expect( verify( string ) ).to.be.equal( 'INVALID' );
			} );

			it( 'when date is invalid', () => {
				// invalid = shorten than expected
				const string = 'bGRtb3RyZWlhZWxzcG9taXRtdXJzby1NVGs1TnpFeA==';

				expect( verify( string ) ).to.be.equal( 'INVALID' );
			} );

			it( 'when date is missing', () => {
				const string = 'dG1wb3Rhc2llc3VlbHJtZHJvbWlsbw==';

				expect( verify( string ) ).to.be.equal( 'INVALID' );
			} );

			it( 'when unable to decode', () => {
				const string = 'bW90b2x0b2Fyc2llc2lscGVtcm1kdS1abTl2WW1GeVltRT0=';

				expect( verify( string ) ).to.be.equal( 'INVALID' );
			} );

			it( 'when wrong string passed', () => {
				// #
				const string = 'YXRtaXNwdWRvbGVzb3RlcmlybW9sbS0j';

				expect( verify( string ) ).to.be.equal( 'INVALID' );
			} );
		} );

		describe( 'should return `EXPIRED`', () => {
			it( 'when date is earlier than the release date', () => {
				// past
				const string = 'cGVsYXVlaXN0bW9kc21pbG10cm9yby1NVGs0TURBeE1ERT0=';

				expect( verify( string ) ).to.be.equal( 'EXPIRED' );
			} );
		} );
	} );
} );
