/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env commonjs, browser */

'use strict';

import Token from '../../src/token/token';

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
		it( 'should throw error when no tokenUrl provided', () => {
			expect( () => new Token() ).to.throw( '`tokenUrl` must be provided' );
		} );

		it( 'should set a init token value', () => {
			const token = new Token( 'http://token-endpoint', { initValue: 'initValue', autoRefresh: false } );

			expect( token.value ).to.equal( 'initValue' );
		} );

		it( 'should fire `change:value` event if the value of the token has changed', done => {
			const token = new Token( 'http://token-endpoint', { autoRefresh: false } );

			token.on( 'change:value', ( event, name, newValue ) => {
				expect( newValue ).to.equal( 'token-value' );

				done();
			} );

			token.init();

			requests[ 0 ].respond( 200, '', 'token-value' );
		} );
	} );

	describe( 'init()', () => {
		it( 'should get a token value from endpoint', done => {
			const token = new Token( 'http://token-endpoint', { autoRefresh: false } );

			token.init()
				.then( () => {
					expect( token.value ).to.equal( 'token-value' );

					done();
				} );

			requests[ 0 ].respond( 200, '', 'token-value' );
		} );

		it( 'should start token refresh every 1 hour', done => {
			const clock = sinon.useFakeTimers( { toFake: [ 'setInterval' ] } );

			const token = new Token( 'http://token-endpoint', { initValue: 'initValue' } );

			token.init()
				.then( () => {
					clock.tick( 3600000 );
					clock.tick( 3600000 );
					clock.tick( 3600000 );
					clock.tick( 3600000 );
					clock.tick( 3600000 );

					expect( requests.length ).to.equal( 5 );

					clock.restore();

					done();
				} );
		} );
	} );

	describe( '_refreshToken()', () => {
		it( 'should get a token from the specified address', done => {
			const token = new Token( 'http://token-endpoint', { initValue: 'initValue', autoRefresh: false } );

			token._refreshToken()
				.then( newToken => {
					expect( newToken.value ).to.equal( 'token-value' );

					done();
				} );

			requests[ 0 ].respond( 200, '', 'token-value' );
		} );

		it( 'should throw error when cannot download new token ', done => {
			const token = new Token( 'http://token-endpoint', { initValue: 'initValue', autoRefresh: false } );

			token._refreshToken()
				.catch( error => {
					expect( error ).to.equal( 'Cannot download new token!' );

					done();
				} );

			requests[ 0 ].respond( 401 );
		} );

		it( 'should throw error when response is aborted', done => {
			const token = new Token( 'http://token-endpoint', { initValue: 'initValue', autoRefresh: false } );

			token._refreshToken()
				.catch( error => {
					expect( error ).to.equal( 'Abort' );

					done();
				} );

			requests[ 0 ].abort();
		} );

		it( 'should throw error event when network error occurs', done => {
			const token = new Token( 'http://token-endpoint', { initValue: 'initValue', autoRefresh: false } );

			token._refreshToken()
				.catch( error => {
					expect( error ).to.equal( 'Network Error' );

					done();
				} );

			requests[ 0 ].error();
		} );
	} );

	describe( '_startRefreshing()', () => {
		it( 'should start refreshing', () => {
			const clock = sinon.useFakeTimers( { toFake: [ 'setInterval' ] } );

			const token = new Token( 'http://token-endpoint', { initValue: 'initValue', autoRefresh: false } );

			token._startRefreshing();

			clock.tick( 3600000 );
			clock.tick( 3600000 );
			clock.tick( 3600000 );
			clock.tick( 3600000 );
			clock.tick( 3600000 );

			expect( requests.length ).to.equal( 5 );

			clock.restore();
		} );
	} );

	describe( '_stopRefreshing()', () => {
		it( 'should stop refreshing', done => {
			const clock = sinon.useFakeTimers( { toFake: [ 'setInterval', 'clearInterval' ] } );

			const token = new Token( 'http://token-endpoint', { initValue: 'initValue' } );

			token.init()
				.then( () => {
					clock.tick( 3600000 );
					clock.tick( 3600000 );
					clock.tick( 3600000 );

					token._stopRefreshing();

					clock.tick( 3600000 );
					clock.tick( 3600000 );

					expect( requests.length ).to.equal( 3 );

					clock.restore();

					done();
				} );
		} );
	} );

	describe( 'static create()', () => {
		it( 'should return a initialized token', done => {
			Token.create( 'http://token-endpoint', { autoRefresh: false } )
				.then( token => {
					expect( token.value ).to.equal( 'token-value' );

					done();
				} );

			requests[ 0 ].respond( 200, '', 'token-value' );
		} );
	} );
} );
