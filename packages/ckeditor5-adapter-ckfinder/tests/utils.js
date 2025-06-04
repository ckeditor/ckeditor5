/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { getCsrfToken, getCookie, setCookie } from '../src/utils.js';

describe( 'utils', () => {
	beforeEach( () => {
		clearCookie( 'ckCsrfToken' );
	} );

	describe( 'getCsrfToken', () => {
		let token;

		beforeEach( () => {
			token = getCsrfToken();
		} );

		it( 'should be saved in cookie', () => {
			expect( document.cookie.indexOf( `ckCsrfToken=${ token }` ) > -1 ).to.be.true;
		} );

		it( 'should have proper length', () => {
			expect( token.length ).to.equal( 40 );
		} );

		it( 'should produce same token for all cals', () => {
			expect( token ).to.equal( getCsrfToken() );
		} );
	} );

	describe( 'get/set cookie', () => {
		let cookieName, cookieValue;

		beforeEach( () => {
			cookieName = 'test-cookie-name';
			cookieValue = 'test-value' + Math.random();

			clearCookie( cookieName );
		} );

		describe( 'setCookie', () => {
			it( 'should set cookie', () => {
				setCookie( cookieName, cookieValue );
				expect( document.cookie.indexOf( `${ cookieName }=${ cookieValue }` ) > -1 ).to.be.true;
			} );
		} );

		describe( 'getCookie', () => {
			it( 'should get cookie', () => {
				document.cookie = encodeURIComponent( cookieName ) + '=' + encodeURIComponent( cookieValue ) + ';path=/';
				expect( getCookie( cookieName ) ).to.equal( cookieValue );
			} );

			it( 'should return null if cookie is not present', () => {
				expect( getCookie( cookieName ) ).to.be.null;
			} );

			it( 'should return empty cookie', () => {
				document.cookie = encodeURIComponent( cookieName ) + '=;path=/';
				expect( getCookie( cookieName ) ).to.equal( '' );
			} );
		} );
	} );
} );

function clearCookie( name ) {
	document.cookie = `${ name }=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
