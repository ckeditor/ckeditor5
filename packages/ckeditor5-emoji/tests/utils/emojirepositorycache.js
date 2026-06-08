/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { EmojiRepositoryCache } from '../../src/utils/emojirepositorycache.js';

const URL_V16 = 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json';
const URL_V15 = 'https://cdn.ckeditor.com/ckeditor5/data/emoji/15/en.json';

const RAW_EMOJI = [
	{ annotation: 'neutral face', emoji: '😐️', group: 0, order: 1, version: 15 },
	{ annotation: 'unamused face', emoji: '😒', group: 0, order: 2, version: 15 }
];

describe( 'EmojiRepositoryCache', () => {
	testUtils.createSinonSandbox();

	let cache, fetchStub;

	beforeEach( () => {
		cache = new EmojiRepositoryCache();
		cache.clear();

		fetchStub = testUtils.sinon.stub( window, 'fetch' );
	} );

	describe( 'fetch()', () => {
		it( 'should return transformed data on a successful response', async () => {
			stubFetchSuccess( RAW_EMOJI );

			const transform = testUtils.sinon.spy( raw => raw.map( item => ( { ...item, transformed: true } ) ) );

			const result = await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform } );

			expect( result ).to.have.length( 2 );
			expect( result[ 0 ] ).to.have.property( 'transformed', true );
			expect( result[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
		} );

		it( 'should call `transform` with the raw CDN data', async () => {
			stubFetchSuccess( RAW_EMOJI );

			const transform = testUtils.sinon.spy( raw => raw );

			await cache.fetch( { url: URL_V16, cacheKeys: [], transform } );

			sinon.assert.calledOnce( transform );
			sinon.assert.calledWithMatch( transform, RAW_EMOJI );
		} );

		it( 'should use `force-cache` when sending the request', async () => {
			stubFetchSuccess( RAW_EMOJI );

			await cache.fetch( { url: URL_V16, cacheKeys: [], transform: identity } );

			expect( fetchStub.firstCall.args[ 1 ] ).to.have.property( 'cache', 'force-cache' );
		} );

		it( 'should return `[]` on a non-OK HTTP response', async () => {
			fetchStub.resolves( new Response( null, { status: 500 } ) );

			const result = await cache.fetch( { url: URL_V16, cacheKeys: [], transform: identity } );

			expect( result ).to.deep.equal( [] );
		} );

		it( 'should return `[]` on a network error', async () => {
			fetchStub.rejects( new TypeError( 'Network error' ) );

			const result = await cache.fetch( { url: URL_V16, cacheKeys: [], transform: identity } );

			expect( result ).to.deep.equal( [] );
		} );

		describe( 'request deduplication', () => {
			it( 'should issue only one HTTP request for the same url + cacheKeys combination', async () => {
				stubFetchSuccess( RAW_EMOJI );

				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );
				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

				sinon.assert.calledOnce( fetchStub );
			} );

			it( 'should issue separate HTTP requests for different URLs', async () => {
				stubFetchSuccess( RAW_EMOJI );

				await cache.fetch( { url: URL_V16, cacheKeys: [], transform: identity } );
				await cache.fetch( { url: URL_V15, cacheKeys: [], transform: identity } );

				sinon.assert.calledTwice( fetchStub );
			} );

			it( 'should issue separate HTTP requests for the same URL with different cacheKeys', async () => {
				stubFetchSuccess( RAW_EMOJI );

				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );
				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:b' ], transform: identity } );

				sinon.assert.calledTwice( fetchStub );
			} );

			it( 'should deduplicate concurrent requests for the same url + cacheKeys combination', async () => {
				let resolveFirst;
				fetchStub.returns( new Promise( resolve => {
					resolveFirst = resolve;
				} ) );

				const p1 = cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );
				const p2 = cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

				resolveFirst( new Response( JSON.stringify( RAW_EMOJI ) ) );

				await Promise.all( [ p1, p2 ] );

				sinon.assert.calledOnce( fetchStub );
			} );
		} );

		describe( 'transform deduplication', () => {
			it( 'should call `transform` only once for the same url + cacheKeys combination', async () => {
				stubFetchSuccess( RAW_EMOJI );

				const transform = testUtils.sinon.spy( identity );

				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform } );
				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform } );

				sinon.assert.calledOnce( transform );
			} );

			it( 'should call `transform` separately for different cacheKeys on the same URL', async () => {
				stubFetchSuccess( RAW_EMOJI );

				const transformA = testUtils.sinon.spy( identity );
				const transformB = testUtils.sinon.spy( identity );

				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: transformA } );
				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:b' ], transform: transformB } );

				sinon.assert.calledOnce( transformA );
				sinon.assert.calledOnce( transformB );
			} );

			it( 'should return independently transformed results for different cacheKeys', async () => {
				stubFetchSuccess( RAW_EMOJI );

				const resultA = await cache.fetch( {
					url: URL_V16,
					cacheKeys: [ 'useCustomFont:false' ],
					transform: raw => raw.map( item => ( { ...item, variant: 'A' } ) )
				} );

				const resultB = await cache.fetch( {
					url: URL_V16,
					cacheKeys: [ 'useCustomFont:true' ],
					transform: raw => raw.map( item => ( { ...item, variant: 'B' } ) )
				} );

				expect( resultA[ 0 ] ).to.have.property( 'variant', 'A' );
				expect( resultB[ 0 ] ).to.have.property( 'variant', 'B' );
			} );
		} );

		describe( 'retry after failure', () => {
			it( 'should allow retrying after a network error', async () => {
				fetchStub.onFirstCall().rejects( new TypeError( 'Network error' ) );
				fetchStub.onSecondCall().resolves( new Response( JSON.stringify( RAW_EMOJI ) ) );

				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );
				const result = await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

				sinon.assert.calledTwice( fetchStub );
				expect( result ).to.have.length( 2 );
			} );

			it( 'should NOT retry after a non-OK HTTP response (entry kept as [])', async () => {
				fetchStub.resolves( new Response( null, { status: 500 } ) );

				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );
				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

				sinon.assert.calledOnce( fetchStub );
			} );
		} );
	} );

	describe( 'getSync()', () => {
		it( 'should return `null` before `fetch()` is called', () => {
			const result = cache.getSync( { url: URL_V16, cacheKeys: [ 'k:a' ] } );

			expect( result ).to.be.null;
		} );

		it( 'should return `null` while `fetch()` is still in flight', () => {
			fetchStub.returns( new Promise( () => {} ) );

			cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

			const result = cache.getSync( { url: URL_V16, cacheKeys: [ 'k:a' ] } );

			expect( result ).to.be.null;
		} );

		it( 'should return the transformed array after `fetch()` resolves', async () => {
			stubFetchSuccess( RAW_EMOJI );

			await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

			const result = cache.getSync( { url: URL_V16, cacheKeys: [ 'k:a' ] } );

			expect( result ).to.have.length( 2 );
			expect( result[ 0 ] ).to.have.property( 'annotation', 'neutral face' );
		} );

		it( 'should return `[]` after `fetch()` resolves with an empty result', async () => {
			fetchStub.resolves( new Response( JSON.stringify( [] ) ) );

			await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

			expect( cache.getSync( { url: URL_V16, cacheKeys: [ 'k:a' ] } ) ).to.deep.equal( [] );
		} );

		it( 'should return `null` for a different cacheKeys combination', async () => {
			stubFetchSuccess( RAW_EMOJI );

			await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

			const result = cache.getSync( { url: URL_V16, cacheKeys: [ 'k:b' ] } );

			expect( result ).to.be.null;
		} );

		it( 'should return `null` for a different URL', async () => {
			stubFetchSuccess( RAW_EMOJI );

			await cache.fetch( { url: URL_V16, cacheKeys: [], transform: identity } );

			const result = cache.getSync( { url: URL_V15, cacheKeys: [] } );

			expect( result ).to.be.null;
		} );
	} );

	describe( 'clear()', () => {
		it( 'should make getSync() return `null` after clearing', async () => {
			stubFetchSuccess( RAW_EMOJI );

			await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

			cache.clear();

			expect( cache.getSync( { url: URL_V16, cacheKeys: [ 'k:a' ] } ) ).to.be.null;
		} );

		it( 'should cause a new HTTP request after clearing', async () => {
			stubFetchSuccess( RAW_EMOJI );

			await cache.fetch( { url: URL_V16, cacheKeys: [], transform: identity } );

			cache.clear();

			await cache.fetch( { url: URL_V16, cacheKeys: [], transform: identity } );

			sinon.assert.calledTwice( fetchStub );
		} );

		it( 'should cause `transform` to be called again after clearing', async () => {
			stubFetchSuccess( RAW_EMOJI );

			const transform = testUtils.sinon.spy( identity );

			await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform } );

			cache.clear();

			await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform } );

			sinon.assert.calledTwice( transform );
		} );
	} );

	function stubFetchSuccess( data ) {
		fetchStub.callsFake( () => Promise.resolve( new Response( JSON.stringify( data ) ) ) );
	}

	function identity( raw ) {
		return raw;
	}
} );
