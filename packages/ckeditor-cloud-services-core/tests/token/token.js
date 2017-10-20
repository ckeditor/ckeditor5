/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env commonjs, browser */

'use strict';

import Token from './../../src/token/token';

describe( 'Token', () => {
	let requests;

	beforeEach( () => {
		requests = [];

		global.xhr = sinon.useFakeXMLHttpRequest();

		global.xhr.onCreate = xhr => {
			requests.push( xhr );
		};
	} );

	afterEach( () => global.xhr.restore() );

	describe( 'constructor()', () => {
		it( 'should set a token value', () => {
			const token = new Token( 'http://token-endpoint', { startAutoRefresh: false } );

			requests[ 0 ].respond( 200, '', 'token-value' );

			expect( token.value ).to.equal( 'token-value' );
		} );

		it( 'should fire `change:value` event if the value of the token has changed', done => {
			const token = new Token( 'http://token-endpoint', { startAutoRefresh: false } );

			token.on( 'change:value', ( event, name, newValue ) => {
				expect( newValue ).to.equal( 'token-value' );

				done();
			} );

			requests[ 0 ].respond( 200, '', 'token-value' );
		} );

		it( 'should start token refresh every 1 hour', done => {
			const clock = sinon.useFakeTimers( { toFake: [ 'setInterval' ] } );

			const token = new Token( 'http://token-endpoint' );

			requests[ 0 ].respond( 200, '', 'token-value' );

			// waiting for the first request
			setTimeout( () => {
				expect( token.value ).to.equal( 'token-value' );

				clock.tick( 3600000 );
				clock.tick( 3600000 );
				clock.tick( 3600000 );
				clock.tick( 3600000 );
				clock.tick( 3600000 );

				expect( requests.length ).to.equal( 6 );

				clock.restore();

				done();
			}, 10 );
		} );
	} );

	describe( 'refreshToken()', () => {
		it( 'should get a token from the specified address', done => {
			const token = new Token( 'http://token-endpoint', { startAutoRefresh: false } );

			token.refreshToken()
				.then( newValue => {
					expect( newValue ).to.equal( 'token-value' );
					expect( token.value ).to.equal( newValue );

					token.stopRefreshing();

					done();
				} );

			requests[ 1 ].respond( 200, '', 'token-value' );
		} );

		it( 'should throw error when cannot download new token ', done => {
			const token = new Token( 'http://token-endpoint', { startAutoRefresh: false } );

			token.refreshToken()
				.catch( error => {
					expect( error ).to.equal( 'Cannot download new token!' );

					done();
				} );

			requests[ 1 ].respond( 401 );
		} );

		it( 'should throw error when response is aborted', done => {
			const token = new Token( 'http://token-endpoint', { startAutoRefresh: false } );

			token.refreshToken()
				.catch( error => {
					expect( error ).to.equal( 'Abort' );

					done();
				} );

			requests[ 1 ].abort();
		} );

		it( 'should throw error event when network error occurs', done => {
			const token = new Token( 'http://token-endpoint', { startAutoRefresh: false } );

			token.refreshToken()
				.catch( error => {
					expect( error ).to.equal( 'Network Error' );

					done();
				} );

			requests[ 1 ].error();
		} );
	} );

	describe( 'startRefreshing()', () => {
		it( 'should start refreshing', done => {
			const clock = sinon.useFakeTimers( { toFake: [ 'setInterval' ] } );

			const token = new Token( 'http://token-endpoint', { startAutoRefresh: false } );

			token.startRefreshing();

			requests[ 0 ].respond( 200, '', 'token-value' );

			// waiting for the first request
			setTimeout( () => {
				expect( token.value ).to.equal( 'token-value' );

				clock.tick( 3600000 );
				clock.tick( 3600000 );
				clock.tick( 3600000 );
				clock.tick( 3600000 );
				clock.tick( 3600000 );

				expect( requests.length ).to.equal( 6 );

				clock.restore();

				done();
			}, 10 );
		} );
	} );

	describe( 'stopRefreshing()', () => {
		it( 'should stop refreshing', done => {
			const clock = sinon.useFakeTimers( { toFake: [ 'setInterval', 'clearInterval' ] } );

			const token = new Token( 'http://token-endpoint' );

			requests[ 0 ].respond( 200, '', 'token-value' );

			// waiting for the first request
			setTimeout( () => {
				expect( token.value ).to.equal( 'token-value' );

				clock.tick( 3600000 );
				clock.tick( 3600000 );
				clock.tick( 3600000 );

				token.stopRefreshing();

				clock.tick( 3600000 );
				clock.tick( 3600000 );

				expect( requests.length ).to.equal( 4 );

				clock.restore();

				done();
			}, 10 );
		} );
	} );
} );
