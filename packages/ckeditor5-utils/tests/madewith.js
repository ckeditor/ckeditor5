/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import verify from '../src/madewith';

describe( 'utils', () => {
	describe( 'verify', () => {
		describe( 'should return `VALID`', () => {
			it( 'when date is later than the release date', () => {
				// new, future
				// eslint-disable-next-line max-len
				const string = 'dG9vZWFzZXRtcHNsaXVyb3JsbWlkbXRvb2Vhc2V0bXBzbGl1cm9ybG1pZG10b29lYXNldG1wc2xpdXJvcmxtaWRtLU1qQTBOREEyTVRJPQ==';

				expect( verify( string ) ).to.be.equal( 'VALID' );
			} );

			it( 'when old token format is given', () => {
				// old
				// eslint-disable-next-line max-len
				const string = 'YWZvb2JkcnphYXJhZWJvb290em9wbWJvbHJ1c21sZnJlYmFzdG1paXN1cm1tZmllenJhb2F0YmFvcmxvb3B6aWJvYWRiZWZzYXJ0bW9ibG8=';

				expect( verify( string ) ).to.be.equal( 'VALID' );
			} );
		} );

		describe( 'should return `INVALID`', () => {
			describe( 'new', () => {
				it( 'first too short', () => {
					expect( verify( 'Wm05dlltRnktTWpBeU5UQXhNREU9' ) ).to.be.equal( 'INVALID' );
				} );

				it( 'first too long', () => {
					// eslint-disable-next-line max-len
					const string = 'YzNSbGJTQmxjbkp2Y2pvZ2JtVjBPanBGVWxKZlFreFBRMHRGUkY5Q1dWOURURWxGVGxSemRHVnRJR1Z5Y205eU9pQnVaWFE2T2tWU1VsOUNURTlEUzBWRVgwSlpYME5NU1VWT1ZITjBaVzBnWlhKeWIzSTZJRzVsZERvNlJWSlNYMEpNVDBOTFJVUmZRbGxmUTB4SlJVNVVjM1JsYlNCbGNuSnZjam9nYm1WME9qcEZVbEpmUWt4UFEwdEZSRjlDV1Y5RFRFbEZUbFJ6ZEdWdElHVnljbTl5T2lCdVpYUTZPa1ZTVWw5Q1RFOURTMFZFWDBKWlgwTk1TVVZPVkhOMFpXMGdaWEp5YjNJNklHNWxkRG82UlZKU1gwSk1UME5MUlVSZlFsbGZRMHhKUlU1VS1NakF5TlRBeE1ERT0=';
					expect( verify( string ) ).to.be.equal( 'INVALID' );
				} );

				it( 'first wrong format', () => {
					const string = 'YS1NakF5TlRBeE1ERT0=';
					expect( verify( string ) ).to.be.equal( 'INVALID' );
				} );

				it( 'when date is invalid', () => {
					// invalid = shorten than expected

					const string = 'enN6YXJ0YWxhYWZsaWViYnRvcnVpb3Jvb3BzYmVkYW9tcm1iZm9vbS1NVGs1TnpFeA==';

					expect( verify( string ) ).to.be.equal( 'INVALID' );
				} );

				it( 'wrong second part format', () => {
					const string = 'Ylc5MGIyeDBiMkZ5YzJsbGMybHNjR1Z0Y20xa2RXMXZkRzlzZEc5aGNuTnBaWE09LVptOXZZbUZ5WW1FPQ==';

					expect( verify( string ) ).to.be.equal( 'INVALID' );
				} );

				it( 'when wrong string passed', () => {
					// # instead of second part
					const string = 'Ylc5MGIyeDBiMkZ5YzJsbGMybHNjR1Z0Y20xa2RXMXZkRzlzZEc5aGNuTnBaWE09LSM=';

					expect( verify( string ) ).to.be.equal( 'INVALID' );
				} );

				it( 'when date is earlier than the release date', () => {
					// new, past
					// eslint-disable-next-line max-len
					const string = 'Y0dWc1lYVmxhWE4wYlc5a2MyMXBiRzEwY205eWIzQmxiR0YxWldsemRHMXZaSE50YVd4dGRISnZjbTlrYzJGa2MyRmtjMkU9LU1UazRNREF4TURFPQ==';

					expect( verify( string ) ).to.be.equal( 'INVALID' );
				} );
			} );

			describe( 'old', () => {
				it( 'when date is missing', () => {
					const string = 'dG1wb3Rhc2llc3VlbHJtZHJvbWlsbw==';

					expect( verify( string ) ).to.be.equal( 'INVALID' );
				} );
			} );

			it( 'when passed variable is invalid', () => {
				// invalid
				const string = 'foobarbaz';

				expect( verify( string ) ).to.be.equal( 'INVALID' );
			} );
		} );
	} );
} );
