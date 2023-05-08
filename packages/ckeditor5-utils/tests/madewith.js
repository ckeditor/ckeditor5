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
				const string = 'ZEhCMGNuVmtiMjlsYlcxdFpXOXNjbUZwYkdsemN3PT0tTURZeE1qSXdORFE9';

				expect( verify( string ) ).to.be.equal( 'VALID' );
			} );

			it( 'when old licence key is valid', () => {
				// eslint-disable-next-line max-len
				const string = 'bWxyZWx6emlkcmJicmZ1YnNhaW9hYWVhbWFzb29vb2ZtdHJvdG9wYmFlYnRtb3VzbXJhb2Z6b3BsdGZhYW9lYm9zb3Jpcm9sYmltYnpyYWQ=';

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
				const string = 'b2RydHNvbWlzdW1ybGxlb3RlYXBtaS1NVEV4T1RrMw==';

				expect( verify( string ) ).to.be.equal( 'INVALID' );
			} );

			it( 'when date is missing', () => {
				const string = 'bXVtZWxlb21wb3Jpcml0bHNvZHRzYQ==';

				expect( verify( string ) ).to.be.equal( 'INVALID' );
			} );

			it( 'when unable to decode', () => {
				const string = 'dW1vbW9ldG1pcnNybG9wbGRzYWl0ZS0j';

				expect( verify( string ) ).to.be.equal( 'INVALID' );
			} );

			it( 'when wrong string passed', () => {
				// #
				const string = 'dGVtb2l0aXNsbW9vc2FyZXBkbG1ydS1abTl2WW1GeVltRT0=';

				expect( verify( string ) ).to.be.equal( 'INVALID' );
			} );
		} );

		describe( 'should return `EXPIRED`', () => {
			it( 'when date is earlier than the release date', () => {
				// past
				const string = 'dXRyZWlwbHJvb21kbW9zbWVsc2F0aS1NREV3TVRFNU9EQT0=';

				expect( verify( string ) ).to.be.equal( 'EXPIRED' );
			} );
		} );
	} );
} );
