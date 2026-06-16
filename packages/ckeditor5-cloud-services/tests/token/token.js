/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Token } from '../../src/token/token.js';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

describe( 'Token', () => {
	let requests;

	function createFakeXHRServer() {
		const requests = [];
		class FakeXMLHttpRequest {
			constructor() {
				this.aborted = false;
				this.listeners = new Map();
				this.upload = new FakeXMLHttpRequestUpload();
				requests.push( this );
			}
			open( method, url ) {
				this.method = method;
				this.url = url;
			}
			send() {}
			abort() {
				this.aborted = true;
				this.dispatchEvent( 'abort' );
			}
			addEventListener( event, callback ) {
				const callbacks = this.listeners.get( event ) || [];
				callbacks.push( callback );
				this.listeners.set( event, callbacks );
			}
			respond( status, headers, body ) {
				this.status = status;
				this.response = body;
				this.dispatchEvent( 'load' );
			}
			error() { this.dispatchEvent( 'error' ); }
			dispatchEvent( event, data ) {
				for ( const callback of this.listeners.get( event ) || [] ) {
					callback( data );
				}
			}
		}
		class FakeXMLHttpRequestUpload {
			constructor() { this.listeners = new Map(); }
			addEventListener( event, callback ) {
				const callbacks = this.listeners.get( event ) || [];
				callbacks.push( callback );
				this.listeners.set( event, callbacks );
			}
			dispatchEvent( event, data ) {
				for ( const callback of this.listeners.get( event ) || [] ) {
					callback( data );
				}
			}
		}
		vi.stubGlobal( 'XMLHttpRequest', FakeXMLHttpRequest );
		return { requests };
	}

	let fakeXHR;

	beforeEach( () => {
		fakeXHR = createFakeXHRServer();
		requests = fakeXHR.requests;
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	} );

	describe( 'constructor()', () => {
		it( 'should throw an error when no tokenUrl provided', () => {
			expect( () => new Token() ).toThrow( 'token-missing-token-url' );
		} );

		it( 'should throw an error if the token passed in options is not a string', () => {
			expect( () => new Token( 'http://token-endpoint', { initValue: 123456 } ) ).toThrow( 'token-not-in-jwt-format' );
		} );

		it( 'should throw an error if the token passed in options is wrapped in additional quotes', () => {
			const tokenInitValue = getTestTokenValue();

			expect( () => new Token( 'http://token-endpoint', { initValue: `"${ tokenInitValue }"` } ) )
				.toThrow( 'token-not-in-jwt-format' );
		} );

		it( 'should throw an error if the token passed in options is not a valid JWT token', () => {
			expect( () => new Token( 'http://token-endpoint', { initValue: 'token' } ) ).toThrow( 'token-not-in-jwt-format' );
		} );

		it( 'should set token value if the token passed in options is valid', () => {
			const tokenInitValue = getTestTokenValue();
			const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue } );

			expect( token.value ).toBe( tokenInitValue );

			token.destroy();
		} );

		it( 'should fire `change:value` event if the value of the token has changed', () => {
			const tokenValue = getTestTokenValue();
			const token = new Token( 'http://token-endpoint', { autoRefresh: false } );

			return new Promise( resolve => {
				token.on( 'change:value', ( event, name, newValue ) => {
					expect( newValue ).toBe( tokenValue );

					resolve();
				} );

				token.init();

				requests[ 0 ].respond( 200, '', tokenValue );

				token.destroy();
			} );
		} );

		it( 'should accept the callback in the constructor', () => {
			expect( () => {
				// eslint-disable-next-line
				const token = new Token( () => Promise.resolve( 'token' ) );
			} ).not.toThrow();
		} );
	} );

	describe( 'init()', () => {
		it( 'should get a token value from the endpoint', () => {
			const tokenValue = getTestTokenValue();
			const token = new Token( 'http://token-endpoint', { autoRefresh: false } );

			const promise = token.init()
				.then( () => {
					expect( token.value ).toBe( tokenValue );

					token.destroy();
				} );

			requests[ 0 ].respond( 200, '', tokenValue );

			return promise;
		} );

		it( 'should get a token from the refreshToken function when is provided', () => {
			const tokenValue = getTestTokenValue();
			const token = new Token( () => Promise.resolve( tokenValue ), { autoRefresh: false } );

			return token.init()
				.then( () => {
					expect( token.value ).toBe( tokenValue );

					token.destroy();
				} );
		} );

		it( 'should not refresh token if autoRefresh is disabled in options', async () => {
			vi.useFakeTimers();
			const tokenInitValue = getTestTokenValue();

			const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue, autoRefresh: false } );

			await token.init();

			await vi.advanceTimersByTimeAsync( 3600000 );

			expect( requests ).toHaveLength( 0 );

			vi.useRealTimers();

			token.destroy();
		} );

		it( 'should refresh token with the time specified in token `exp` payload property', async () => {
			vi.useFakeTimers();
			const tokenInitValue = getTestTokenValue();

			const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue } );

			await token.init();

			await vi.advanceTimersByTimeAsync( 1800000 );
			requests[ 0 ].respond( 200, '', getTestTokenValue( 1500 ) );

			await vi.advanceTimersByTimeAsync( 750000 );
			requests[ 1 ].respond( 200, '', getTestTokenValue( 900 ) );

			await vi.advanceTimersByTimeAsync( 450000 );
			requests[ 2 ].respond( 200, '', getTestTokenValue( 450 ) );

			await vi.advanceTimersByTimeAsync( 225000 );
			requests[ 3 ].respond( 200, '', getTestTokenValue( 20 ) );

			await vi.advanceTimersByTimeAsync( 10000 );
			requests[ 4 ].respond( 200, '', getTestTokenValue( 20 ) );

			expect( requests.length ).toBe( 5 );

			token.destroy();

			vi.useRealTimers();
		} );

		it( 'should refresh the token with the default time if getting token expiration time failed', async () => {
			vi.useFakeTimers();
			const tokenValue = 'header.test.signature';

			const token = new Token( 'http://token-endpoint', { initValue: tokenValue } );

			await token.init();

			await vi.advanceTimersByTimeAsync( 3600000 );
			requests[ 0 ].respond( 200, '', tokenValue );

			await vi.advanceTimersByTimeAsync( 3600000 );
			requests[ 1 ].respond( 200, '', tokenValue );

			expect( requests.length ).toBe( 2 );

			token.destroy();

			vi.useRealTimers();
		} );

		it( 'should refresh the token with the default time if the token payload does not contain `exp` property', async () => {
			vi.useFakeTimers();
			const tokenValue = `header.${ btoa( JSON.stringify( {} ) ) }.signature`;

			const token = new Token( 'http://token-endpoint', { initValue: tokenValue } );

			await token.init();

			await vi.advanceTimersByTimeAsync( 3600000 );
			requests[ 0 ].respond( 200, '', tokenValue );

			await vi.advanceTimersByTimeAsync( 3600000 );
			requests[ 1 ].respond( 200, '', tokenValue );

			await vi.advanceTimersByTimeAsync( 3600000 );
			requests[ 2 ].respond( 200, '', tokenValue );

			expect( requests.length ).toBe( 3 );

			token.destroy();

			vi.useRealTimers();
		} );

		it( 'should warn when token expiration time exceeds 32-bit integer range', () => {
			const consoleStub = vi.spyOn( console, 'warn' ).mockReturnValue( undefined );
			const tokenValue = `header.${ btoa( JSON.stringify( { exp: 2147483648 } ) ) }.signature`;
			const token = new Token( 'http://token-endpoint', { initValue: tokenValue } );

			token.init();

			expect( consoleStub ).toHaveBeenCalledWith(
				'Token expiration time exceeds 32-bit integer range. This might cause unpredictable token refresh timing. ' +
				'Token expiration time should always be provided in seconds.',
				expect.objectContaining( { tokenExpireTime: 2147483648 } )
			);

			token.destroy();
		} );
	} );

	describe( 'destroy', () => {
		beforeEach( () => {
			vi.useFakeTimers();
		} );

		afterEach( () => {
			vi.useRealTimers();
		} );

		it( 'should stop refreshing the token', async () => {
			const tokenInitValue = getTestTokenValue();

			const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue } );

			await token.init();

			await vi.advanceTimersByTimeAsync( 1800000 );
			requests[ 0 ].respond( 200, '', getTestTokenValue( 1500 ) );
			await vi.advanceTimersByTimeAsync( 100 );

			await vi.advanceTimersByTimeAsync( 750000 );
			requests[ 1 ].respond( 200, '', getTestTokenValue( 900 ) );
			await vi.advanceTimersByTimeAsync( 100 );

			token.destroy();

			await vi.advanceTimersByTimeAsync( 3600000 );
			await vi.advanceTimersByTimeAsync( 3600000 );
			await vi.advanceTimersByTimeAsync( 3600000 );

			expect( requests.length ).toBe( 2 );
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/17462.
		it( 'should stop refreshing the token when editor destroyed before token request rejects', async () => {
			const consoleWarnStub = vi.spyOn( console, 'warn' ).mockReturnValue( undefined );

			const token = new Token( 'http://token-endpoint', { autoRefresh: true } );
			const registerRefreshTokenTimeoutSpy = vi.spyOn( token, '_registerRefreshTokenTimeout' );

			const initPromise = token.init();

			// Editor is destroyed before the token request is resolved.
			token.destroy();

			// Simulate token fetching error.
			requests[ 0 ].error();

			try {
				await initPromise;
				throw new Error( 'Promise should be rejected' );
			} catch ( error ) {
				expect( error.message ).toMatch( /Network Error/ );
			}

			expect( registerRefreshTokenTimeoutSpy ).toHaveBeenCalledOnce();
			expect( consoleWarnStub ).toHaveBeenCalledOnce();
			expect( requests.length ).toBe( 1 );

			await vi.advanceTimersByTimeAsync( 10 * 1000 );

			expect( registerRefreshTokenTimeoutSpy ).toHaveBeenCalledOnce();
			expect( consoleWarnStub ).toHaveBeenCalledOnce();
			expect( requests.length ).toBe( 1 );

			await vi.advanceTimersByTimeAsync( 3600000 );
			await vi.advanceTimersByTimeAsync( 3600000 );

			expect( registerRefreshTokenTimeoutSpy ).toHaveBeenCalledOnce();
			expect( consoleWarnStub ).toHaveBeenCalledOnce();
			expect( requests.length ).toBe( 1 );
		} );

		// Related to https://github.com/ckeditor/ckeditor5/issues/17462.
		it( 'should stop refreshing the token when editor destroyed before token request resolves', async () => {
			const token = new Token( 'http://token-endpoint', { autoRefresh: true } );
			const registerRefreshTokenTimeoutSpy = vi.spyOn( token, '_registerRefreshTokenTimeout' );

			const initPromise = token.init();

			// Editor is destroyed before the token request is resolved.
			token.destroy();

			// Simulate token response.
			requests[ 0 ].respond( 200, '', getTestTokenValue( 1500 ) );

			try {
				await initPromise;
			} catch {
				throw new Error( 'Promise should not be rejected' );
			}

			expect( registerRefreshTokenTimeoutSpy ).toHaveBeenCalledOnce();
			expect( requests.length ).toBe( 1 );

			await vi.advanceTimersByTimeAsync( 3600000 );

			expect( registerRefreshTokenTimeoutSpy ).toHaveBeenCalledOnce();
			expect( requests.length ).toBe( 1 );

			await vi.advanceTimersByTimeAsync( 3600000 );

			expect( registerRefreshTokenTimeoutSpy ).toHaveBeenCalledOnce();
			expect( requests.length ).toBe( 1 );
		} );
	} );

	describe( 'refreshToken()', () => {
		it( 'should get a token from the specified address', () => {
			const tokenValue = getTestTokenValue();
			const token = new Token( 'http://token-endpoint', { autoRefresh: false } );

			const promise = token.refreshToken()
				.then( newToken => {
					expect( newToken.value ).toBe( tokenValue );

					token.destroy();
				} );

			requests[ 0 ].respond( 200, '', tokenValue );

			return promise;
		} );

		it( 'should throw an error if the returned token is wrapped in additional quotes', () => {
			vi.spyOn( console, 'warn' ).mockReturnValue( undefined );

			const tokenValue = getTestTokenValue();
			const token = new Token( 'http://token-endpoint', { autoRefresh: false } );

			const promise = token.refreshToken()
				.then( () => {
					throw new Error( 'Promise should be rejected' );
				} )
				.catch( error => {
					expect( error.constructor ).toBe( CKEditorError );
					expect( error.message ).toMatch( /token-not-in-jwt-format/ );
					token.destroy();
				} );

			requests[ 0 ].respond( 200, '', `"${ tokenValue }"` );

			return promise;
		} );

		it( 'should throw an error if the returned token is not a valid JWT token', () => {
			vi.spyOn( console, 'warn' ).mockReturnValue( undefined );

			const token = new Token( 'http://token-endpoint', { autoRefresh: false } );

			const promise = token.refreshToken()
				.then( () => {
					throw new Error( 'Promise should be rejected' );
				} )
				.catch( error => {
					expect( error.constructor ).toBe( CKEditorError );
					expect( error.message ).toMatch( /token-not-in-jwt-format/ );
					token.destroy();
				} );

			requests[ 0 ].respond( 200, '', 'token' );

			return promise;
		} );

		it( 'should get a token from the specified callback function', () => {
			const tokenValue = getTestTokenValue();
			const token = new Token( () => Promise.resolve( tokenValue ), { autoRefresh: false } );

			return token.refreshToken()
				.then( newToken => {
					expect( newToken.value ).toBe( tokenValue );
					token.destroy();
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
				expect( error.constructor ).toBe( CKEditorError );
				expect( error.message ).toMatch( /token-cannot-download-new-token/ );
				token.destroy();
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
				expect( error.message ).toMatch( /Abort/ );
				token.destroy();
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
				expect( error.message ).toMatch( /Network Error/ );
				token.destroy();
			} );
		} );

		it( 'should throw an error when the callback throws an error', () => {
			const tokenInitValue = getTestTokenValue();
			const token = new Token( () => Promise.reject( 'Custom error occurred' ), { initValue: tokenInitValue, autoRefresh: false } );

			token.refreshToken()
				.catch( error => {
					expect( error ).toBe( 'Custom error occurred' );
					token.destroy();
				} );
		} );

		describe( 'refresh failure handling', () => {
			beforeEach( () => {
				vi.useFakeTimers( {
					toFake: [ 'setTimeout', 'clearTimeout' ]
				} );

				vi.spyOn( console, 'warn' ).mockReturnValue( undefined );
			} );

			afterEach( () => {
				vi.useRealTimers();
			} );

			it( 'should log a warning in the console', () => {
				const tokenInitValue = getTestTokenValue();
				const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue, autoRefresh: false } );
				const promise = token.refreshToken();

				requests[ 0 ].error();

				return promise.then( () => {
					throw new Error( 'Promise should fail' );
				}, () => {
					expect( console.warn ).toHaveBeenCalledWith(
						expect.stringContaining( 'token-refresh-failed' ),
						expect.objectContaining( { autoRefresh: false } ),
						expect.anything()
					);
					token.destroy();
				} );
			} );

			it( 'should attempt to periodically refresh the token', async () => {
				const tokenInitValue = getTestTokenValue();
				const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue, autoRefresh: true } );
				const promise = token.refreshToken();

				// The timer-driven refreshToken() calls re-throw after logging+rescheduling.
				// Suppress those unhandled rejections — they are expected in this test.
				const suppressUnhandledRejection = event => event.preventDefault();
				window.addEventListener( 'unhandledrejection', suppressUnhandledRejection );

				requests[ 0 ].error();

				return promise
					.then( async () => {
						throw new Error( 'Promise should fail' );
					} )
					.catch( async err => {
						expect( err.message ).toMatch( /Network Error/ );

						await vi.advanceTimersByTimeAsync( 5000 );
						expect( requests.length ).toBe( 2 );

						requests[ 1 ].error();

						await vi.advanceTimersByTimeAsync( 5000 );
						expect( requests.length ).toBe( 3 );

						requests[ 2 ].error();

						await vi.advanceTimersByTimeAsync( 5000 );
						expect( requests.length ).toBe( 4 );

						token.destroy();
						window.removeEventListener( 'unhandledrejection', suppressUnhandledRejection );
					} );
			} );

			it( 'should restore the regular refresh interval after a successfull refresh', () => {
				const tokenInitValue = getTestTokenValue();
				const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue, autoRefresh: true } );
				const promise = token.refreshToken();

				requests[ 0 ].error();

				return promise
					.then( async () => {
						throw new Error( 'Promise should fail' );
					} )
					.catch( async err => {
						expect( err.message ).toMatch( /Network Error/ );

						await vi.advanceTimersByTimeAsync( 5000 );
						expect( requests.length ).toBe( 2 );

						requests[ 1 ].respond( 200, '', getTestTokenValue( 20 ) );

						await vi.advanceTimersByTimeAsync( 5000 );
						// Switched to 10s interval because refresh was successful.
						expect( requests.length ).toBe( 2 );

						await vi.advanceTimersByTimeAsync( 5000 );
						expect( requests.length ).toBe( 3 );

						requests[ 2 ].respond( 200, '', getTestTokenValue( 20 ) );

						await vi.advanceTimersByTimeAsync( 10000 );
						expect( requests.length ).toBe( 4 );

						token.destroy();
					} );
			} );

			it( 'should not auto-refresh after a failure if options.autoRefresh option is false', () => {
				const tokenInitValue = getTestTokenValue();
				const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue, autoRefresh: false } );
				const promise = token.refreshToken();

				requests[ 0 ].error();

				return promise
					.then( async () => {
						throw new Error( 'Promise should fail' );
					} )
					.catch( async err => {
						expect( err.message ).toMatch( /Network Error/ );

						await vi.advanceTimersByTimeAsync( 5000 );
						expect( requests.length ).toBe( 1 );

						await vi.advanceTimersByTimeAsync( 10000 );
						expect( requests.length ).toBe( 1 );

						token.destroy();
					} );
			} );

			it( 'should clear any queued refresh upon manual refreshToken() call to avoid duplicated refreshes', () => {
				const tokenInitValue = getTestTokenValue();
				const token = new Token( 'http://token-endpoint', { initValue: tokenInitValue, autoRefresh: true } );
				const promise = token.refreshToken();

				// requests[1] is a timer-driven call that re-throws after logging+rescheduling.
				const suppressUnhandledRejection = event => event.preventDefault();
				window.addEventListener( 'unhandledrejection', suppressUnhandledRejection );

				requests[ 0 ].error();

				return promise
					.then( async () => {
						throw new Error( 'Promise should fail' );
					} )
					.catch( async err => {
						expect( err.message ).toMatch( /Network Error/ );

						await vi.advanceTimersByTimeAsync( 5000 );
						expect( requests.length ).toBe( 2 );

						token.refreshToken().catch( () => {} );
						token.refreshToken().catch( () => {} );
						token.refreshToken().catch( () => {} );

						requests[ 1 ].error();
						requests[ 2 ].error();
						requests[ 3 ].error();
						requests[ 4 ].error();

						await vi.advanceTimersByTimeAsync( 5000 );

						expect( requests.length ).toBe( 6 );

						token.destroy();
						window.removeEventListener( 'unhandledrejection', suppressUnhandledRejection );
					} );
			} );
		} );
	} );

	describe( 'static create()', () => {
		it( 'should return an initialized token', () => {
			const tokenValue = getTestTokenValue();

			const promise = Token.create( 'http://token-endpoint', { autoRefresh: false } )
				.then( token => {
					expect( token.value ).toBe( tokenValue );

					token.destroy();
				} );

			requests[ 0 ].respond( 200, '', tokenValue );

			return promise;
		} );

		it( 'should use default options when none passed', () => {
			const tokenValue = getTestTokenValue();

			const promise = Token.create( 'http://token-endpoint' )
				.then( token => {
					expect( token._options ).toEqual( { autoRefresh: true } );

					token.destroy();
				} );

			requests[ 0 ].respond( 200, '', tokenValue );

			return promise;
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
