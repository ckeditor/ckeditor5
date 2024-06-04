/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import verifyLicense from '../src/verifylicense.js';

describe( 'utils', () => {
	describe( 'verify', () => {
		describe( 'should return `VALID`', () => {
			it( 'when date is later than the release date', () => {
				// new, future
				// eslint-disable-next-line max-len
				const string = 'dG9vZWFzZXRtcHNsaXVyb3JsbWlkbXRvb2Vhc2V0bXBzbGl1cm9ybG1pZG10b29lYXNldG1wc2xpdXJvcmxtaWRtLU1qQTBOREEyTVRJPQ==';

				expect( verifyLicense( string ) ).to.be.equal( 'VALID' );
			} );

			it( 'when old token format is given', () => {
				// old
				// eslint-disable-next-line max-len
				const string = 'YWZvb2JkcnphYXJhZWJvb290em9wbWJvbHJ1c21sZnJlYmFzdG1paXN1cm1tZmllenJhb2F0YmFvcmxvb3B6aWJvYWRiZWZzYXJ0bW9ibG8=';

				expect( verifyLicense( string ) ).to.be.equal( 'VALID' );
			} );

			it( 'when old token format is given with a special sign', () => {
				const string = 'LWRsZ2h2bWxvdWhnbXZsa3ZkaGdzZGhtdmxrc2htZ3Nma2xnaGxtcDk4N212Z3V3OTU4NHc5bWdtdw==';

				expect( verifyLicense( string ) ).to.be.equal( 'VALID' );
			} );

			it( 'when old token is splitted', () => {
				// eslint-disable-next-line max-len
				const string = 'ZXNybGl1aG1jbGlldWdtbHdpZWgvIUAjNW1nbGNlXVtcd2l1Z2NsZWpnbWNsc2lkZmdjbHNpZGZoZ2xjc2Rnc25jZGZnaGNubHMtd3A5bWN5dDlwaGdtcGM5d2g4dGc3Y3doODdvaGddW10hQCMhdG5jN293NTg0aGdjbzhud2U4Z2Nodw==';

				expect( verifyLicense( string ) ).to.be.equal( 'VALID' );
			} );
		} );

		describe( 'should return `INVALID`', () => {
			it( 'when token is empty', () => {
				expect( verifyLicense( '' ) ).to.be.equal( 'INVALID' );
			} );

			it( 'when token is not passed', () => {
				expect( verifyLicense( ) ).to.be.equal( 'INVALID' );
			} );

			describe( 'new', () => {
				it( 'first too short', () => {
					expect( verifyLicense( 'Wm05dlltRnktTWpBeU5UQXhNREU9' ) ).to.be.equal( 'INVALID' );
				} );

				it( 'first too long', () => {
					// eslint-disable-next-line max-len
					const string = 'YzNSbGJTQmxjbkp2Y2pvZ2JtVjBPanBGVWxKZlFreFBRMHRGUkY5Q1dWOURURWxGVGxSemRHVnRJR1Z5Y205eU9pQnVaWFE2T2tWU1VsOUNURTlEUzBWRVgwSlpYME5NU1VWT1ZITjBaVzBnWlhKeWIzSTZJRzVsZERvNlJWSlNYMEpNVDBOTFJVUmZRbGxmUTB4SlJVNVVjM1JsYlNCbGNuSnZjam9nYm1WME9qcEZVbEpmUWt4UFEwdEZSRjlDV1Y5RFRFbEZUbFJ6ZEdWdElHVnljbTl5T2lCdVpYUTZPa1ZTVWw5Q1RFOURTMFZFWDBKWlgwTk1TVVZPVkhOMFpXMGdaWEp5YjNJNklHNWxkRG82UlZKU1gwSk1UME5MUlVSZlFsbGZRMHhKUlU1VS1NakF5TlRBeE1ERT0=';

					expect( verifyLicense( string ) ).to.be.equal( 'INVALID' );
				} );

				it( 'first wrong format', () => {
					const string = 'ZGx1Z2hjbXNsaXVkZ2NobXN8IjolRVdFVnwifCJEVnxERyJXJSUkXkVSVHxWIll8UkRUIkJTfFIlQiItTWpBeU16RXlNekU9';

					expect( verifyLicense( string ) ).to.be.equal( 'INVALID' );
				} );

				it( 'when date is invalid', () => {
					// invalid = shorten than expected

					const string = 'enN6YXJ0YWxhYWZsaWViYnRvcnVpb3Jvb3BzYmVkYW9tcm1iZm9vbS1NVGs1TnpFeA==';

					expect( verifyLicense( string ) ).to.be.equal( 'INVALID' );
				} );

				it( 'wrong second part format', () => {
					const string = 'Ylc5MGIyeDBiMkZ5YzJsbGMybHNjR1Z0Y20xa2RXMXZkRzlzZEc5aGNuTnBaWE09LVptOXZZbUZ5WW1FPQ==';

					expect( verifyLicense( string ) ).to.be.equal( 'INVALID' );
				} );

				it( 'when wrong string passed', () => {
					// # instead of second part
					const string = 'Ylc5MGIyeDBiMkZ5YzJsbGMybHNjR1Z0Y20xa2RXMXZkRzlzZEc5aGNuTnBaWE09LSM=';

					expect( verifyLicense( string ) ).to.be.equal( 'INVALID' );
				} );

				it( 'when date is earlier than the release date', () => {
					// new, past
					// eslint-disable-next-line max-len
					const string = 'Y0dWc1lYVmxhWE4wYlc5a2MyMXBiRzEwY205eWIzQmxiR0YxWldsemRHMXZaSE50YVd4dGRISnZjbTlrYzJGa2MyRmtjMkU9LU1UazRNREF4TURFPQ==';

					expect( verifyLicense( string ) ).to.be.equal( 'INVALID' );
				} );
			} );

			describe( 'old', () => {
				it( 'when date is missing', () => {
					const string = 'dG1wb3Rhc2llc3VlbHJtZHJvbWlsbw==';

					expect( verifyLicense( string ) ).to.be.equal( 'INVALID' );
				} );
			} );

			it( 'when passed variable is invalid', () => {
				// invalid
				const string = 'foobarbaz';

				expect( verifyLicense( string ) ).to.be.equal( 'INVALID' );
			} );
		} );
	} );
} );
