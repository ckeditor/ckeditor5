/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env commonjs, browser */

import Token from '../../src/token/token';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'Token', () => {
	let requests;

	beforeEach( () => {
		requests = [];

		const xhr = sinon.useFakeXMLHttpRequest();

		xhr.onCreate = request => {
			requests.push( request );
		};
	} );

	afterEach( () => {
		sinon.restore();
	} );

	describe( 'constructor()', () => {
		it( 'should throw an error when no tokenUrl provided', () => {
			expect( () => new Token() ).to.throw(
				CKEditorError,
				'token-missing-token-url'
			);
		} );

		it( 'should throw an error if the token passed in options is not a string', () => {
			expect( () => new Token( 'http://token-endpoint', { initValue: 123456 } ) ).to.throw(
				CKEditorError,
				'token-not-in-jwt-format'
			);
		} );

		it( 'should throw an error if the token passed in options is wrapped in additional quotes', () => {
			const tokenInitValue = getTestTokenValue();

			expect( () => new Token( 'http://token-endpoint', { initValue: `"${ tokenInitValue }"` } ) ).to.throw(
				CKEditorError,
				'token-not-in-jwt-format'
			);
		} );

		it( 'should throw an error if the token passed in options is not a valid JWT token', () => {
			expect( () => new Token( 'http://token-endpoint', { initValue: 'token' } ) ).to.throw(
				CKEditorError,
				'token-not-in-jwt-format'
			);
		} );

		it( 'should set token value if the token passed in options is valid', () => {
			const tokenInitValue = getTestTokenValue();
			const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue } );

			expect( token.value ).to.equal( tokenInitValue );
		} );

		it( 'should fire `change:value` event if the value of the token has changed', done => {
			const tokenValue = getTestTokenValue();
			const token = new Token( 'http://token-endpoint', { autoRefresh: false } );

			token.on( 'change:value', ( event, name, newValue ) => {
				expect( newValue ).to.equal( tokenValue );

				done();
			} );

			token.init();

			requests[ 0 ].respond( 200, '', tokenValue );
		} );

		it( 'should accept the callback in the constructor', () => {
			expect( () => {
				// eslint-disable-next-line
				const token = new Token( () => Promise.resolve( 'token' ) );
			} ).to.not.throw();
		} );
	} );

	describe( 'init()', () => {
		it( 'should get a token value from the endpoint', done => {
			const tokenValue = getTestTokenValue();
			const token = new Token( 'http://token-endpoint', { autoRefresh: false } );

			token.init()
				.then( () => {
					expect( token.value ).to.equal( tokenValue );

					done();
				} );

			requests[ 0 ].respond( 200, '', tokenValue );
		} );

		it( 'should get a token from the refreshToken function when is provided', () => {
			const tokenValue = getTestTokenValue();
			const token = new Token( () => Promise.resolve( tokenValue ), { autoRefresh: false } );

			return token.init()
				.then( () => {
					expect( token.value ).to.equal( tokenValue );
				} );
		} );

		it( 'should not refresh token if autoRefresh is disabled in options', async () => {
			const clock = sinon.useFakeTimers( { toFake: [ 'setTimeout' ] } );
			const tokenInitValue = getTestTokenValue();

			const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue, autoRefresh: false } );

			await token.init();

			await clock.tickAsync( 3600000 );

			expect( requests ).to.be.empty;

			clock.restore();
		} );

		it( 'should refresh token with the time specified in token `exp` payload property', async () => {
			const clock = sinon.useFakeTimers( { toFake: [ 'setTimeout' ] } );
			const tokenInitValue = getTestTokenValue();

			const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue } );

			await token.init();

			await clock.tickAsync( 1800000 );
			requests[ 0 ].respond( 200, '', getTestTokenValue( 1500 ) );

			await clock.tickAsync( 750000 );
			requests[ 1 ].respond( 200, '', getTestTokenValue( 900 ) );

			await clock.tickAsync( 450000 );
			requests[ 2 ].respond( 200, '', getTestTokenValue( 450 ) );

			await clock.tickAsync( 225000 );
			requests[ 3 ].respond( 200, '', getTestTokenValue( 20 ) );

			await clock.tickAsync( 10000 );
			requests[ 4 ].respond( 200, '', getTestTokenValue( 20 ) );

			expect( requests.length ).to.equal( 5 );

			clock.restore();
		} );

		it( 'should refresh the token with the default time if getting token expiration time failed', async () => {
			const clock = sinon.useFakeTimers( { toFake: [ 'setTimeout' ] } );
			const tokenValue = 'header.test.signature';

			const token = new Token( 'http://token-endpoint', { initValue: tokenValue } );

			await token.init();

			await clock.tickAsync( 3600000 );
			requests[ 0 ].respond( 200, '', tokenValue );

			await clock.tickAsync( 3600000 );
			requests[ 1 ].respond( 200, '', tokenValue );

			expect( requests.length ).to.equal( 2 );

			clock.restore();
		} );

		it( 'should refresh the token with the default time if the token payload does not contain `exp` property', async () => {
			const clock = sinon.useFakeTimers( { toFake: [ 'setTimeout' ] } );
			const tokenValue = `header.${ btoa( JSON.stringify( {} ) ) }.signature`;

			const token = new Token( 'http://token-endpoint', { initValue: tokenValue } );

			await token.init();

			await clock.tickAsync( 3600000 );
			requests[ 0 ].respond( 200, '', tokenValue );

			await clock.tickAsync( 3600000 );
			requests[ 1 ].respond( 200, '', tokenValue );

			await clock.tickAsync( 3600000 );
			requests[ 2 ].respond( 200, '', tokenValue );

			expect( requests.length ).to.equal( 3 );

			clock.restore();
		} );
	} );

	describe( 'destroy', () => {
		it( 'should stop refreshing the token', async () => {
			const clock = sinon.useFakeTimers( { toFake: [ 'setTimeout', 'clearTimeout' ] } );
			const tokenInitValue = getTestTokenValue();

			const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue } );

			await token.init();

			await clock.tickAsync( 1800000 );
			requests[ 0 ].respond( 200, '', getTestTokenValue( 1500 ) );
			await clock.tickAsync( 100 );

			await clock.tickAsync( 750000 );
			requests[ 1 ].respond( 200, '', getTestTokenValue( 900 ) );
			await clock.tickAsync( 100 );

			token.destroy();

			await clock.tickAsync( 3600000 );
			await clock.tickAsync( 3600000 );
			await clock.tickAsync( 3600000 );

			expect( requests.length ).to.equal( 2 );

			clock.restore();
		} );
	} );

	describe( 'refreshToken()', () => {
		it( 'should get a token from the specified address', done => {
			const tokenValue = getTestTokenValue();
			const token = new Token( 'http://token-endpoint', { autoRefresh: false } );

			token.refreshToken()
				.then( newToken => {
					expect( newToken.value ).to.equal( tokenValue );

					done();
				} );

			requests[ 0 ].respond( 200, '', tokenValue );
		} );

		it( 'should throw an error if the returned token is wrapped in additional quotes', done => {
			const tokenValue = getTestTokenValue();
			const token = new Token( 'http://token-endpoint', { autoRefresh: false } );

			token.refreshToken()
				.then( () => {
					done( new Error( 'Promise should be rejected' ) );
				} )
				.catch( error => {
					expect( error.constructor ).to.equal( CKEditorError );
					expect( error ).to.match( /token-not-in-jwt-format/ );
					done();
				} );

			requests[ 0 ].respond( 200, '', `"${ tokenValue }"` );
		} );

		it( 'should throw an error if the returned token is not a valid JWT token', done => {
			const token = new Token( 'http://token-endpoint', { autoRefresh: false } );

			token.refreshToken()
				.then( () => {
					done( new Error( 'Promise should be rejected' ) );
				} )
				.catch( error => {
					expect( error.constructor ).to.equal( CKEditorError );
					expect( error ).to.match( /token-not-in-jwt-format/ );
					done();
				} );

			requests[ 0 ].respond( 200, '', 'token' );
		} );

		it( 'should get a token from the specified callback function', () => {
			const tokenValue = getTestTokenValue();
			const token = new Token( () => Promise.resolve( tokenValue ), { autoRefresh: false } );

			return token.refreshToken()
				.then( newToken => {
					expect( newToken.value ).to.equal( tokenValue );
				} );
		} );

		it( 'should throw an error when cannot download a new token', () => {
			const tokenInitValue = getTestTokenValue();
			const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue, autoRefresh: false } );
			const promise = token._refresh();

			requests[ 0 ].respond( 401 );

			return promise.then( () => {
				throw new Error( 'Promise should be rejected' );
			}, error => {
				expect( error.constructor ).to.equal( CKEditorError );
				expect( error ).to.match( /token-cannot-download-new-token/ );
			} );
		} );

		it( 'should throw an error when the response is aborted', () => {
			const tokenInitValue = getTestTokenValue();
			const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue, autoRefresh: false } );
			const promise = token._refresh();

			requests[ 0 ].abort();

			return promise.then( () => {
				throw new Error( 'Promise should be rejected' );
			}, error => {
				expect( error ).to.match( /Abort/ );
			} );
		} );

		it( 'should throw an error when network error occurs', () => {
			const tokenInitValue = getTestTokenValue();
			const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue, autoRefresh: false } );
			const promise = token._refresh();

			requests[ 0 ].error();

			return promise.then( () => {
				throw new Error( 'Promise should be rejected' );
			}, error => {
				expect( error ).to.match( /Network Error/ );
			} );
		} );

		it( 'should throw an error when the callback throws an error', () => {
			const tokenInitValue = getTestTokenValue();
			const token = new Token( () => Promise.reject( 'Custom error occurred' ), { initValue: tokenInitValue, autoRefresh: false } );

			token.refreshToken()
				.catch( error => {
					expect( error ).to.equal( 'Custom error occurred' );
				} );
		} );
	} );

	describe( 'static create()', () => {
		it( 'should return an initialized token', done => {
			const tokenValue = getTestTokenValue();

			Token.create( 'http://token-endpoint', { autoRefresh: false } )
				.then( token => {
					expect( token.value ).to.equal( tokenValue );

					done();
				} );

			requests[ 0 ].respond( 200, '', tokenValue );
		} );

		it( 'should use default options when none passed', done => {
			const tokenValue = getTestTokenValue();

			Token.create( 'http://token-endpoint' )
				.then( token => {
					expect( token._options ).to.eql( { autoRefresh: true } );

					done();
				} );

			requests[ 0 ].respond( 200, '', tokenValue );
		} );
	} );
} );

// Returns valid token for tests with given expiration time offset.
//
// @param {Number} [timeOffset=3600000]
// @returns {String}
function getTestTokenValue( timeOffset = 3600 ) {
	return `header.${ btoa( JSON.stringify( { exp: ( Math.floor( Date.now() / 1000 ) ) + timeOffset } ) ) }.signature`;
}
