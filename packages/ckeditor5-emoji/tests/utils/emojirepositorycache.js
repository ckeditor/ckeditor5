/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmojiRepositoryCache } from '../../src/utils/emojirepositorycache.js';

const URL_V16 = 'https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json';
const URL_V15 = 'https://cdn.ckeditor.com/ckeditor5/data/emoji/15/en.json';

const RAW_EMOJI = [
	{ annotation: 'neutral face', emoji: '😐️', group: 0, order: 1, version: 15 },
	{ annotation: 'unamused face', emoji: '😒', group: 0, order: 2, version: 15 }
];

describe( 'EmojiRepositoryCache', () => {
	let cache, fetchStub;

	beforeEach( () => {
		cache = new EmojiRepositoryCache();
		cache.clear();

		fetchStub = vi.spyOn( window, 'fetch' );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	describe( 'fetch()', () => {
		it( 'should return transformed data on a successful response', async () => {
			stubFetchSuccess( RAW_EMOJI );

			const transform = vi.fn( raw => raw.map( item => ( { ...item, transformed: true } ) ) );

			const result = await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform } );

			expect( result ).toHaveLength( 2 );
			expect( result[ 0 ] ).toHaveProperty( 'transformed', true );
			expect( result[ 0 ] ).toHaveProperty( 'annotation', 'neutral face' );
		} );

		it( 'should call `transform` with the raw CDN data', async () => {
			stubFetchSuccess( RAW_EMOJI );

			const transform = vi.fn( raw => raw );

			await cache.fetch( { url: URL_V16, cacheKeys: [], transform } );

			expect( transform ).toHaveBeenCalledOnce();
			expect( transform ).toHaveBeenCalledWith( RAW_EMOJI );
		} );

		it( 'should use `force-cache` when sending the request', async () => {
			stubFetchSuccess( RAW_EMOJI );

			await cache.fetch( { url: URL_V16, cacheKeys: [], transform: identity } );

			expect( fetchStub.mock.calls[ 0 ][ 1 ] ).toHaveProperty( 'cache', 'force-cache' );
		} );

		it( 'should return `[]` on a non-OK HTTP response', async () => {
			fetchStub.mockResolvedValue( new Response( null, { status: 500 } ) );

			const result = await cache.fetch( { url: URL_V16, cacheKeys: [], transform: identity } );

			expect( result ).toEqual( [] );
		} );

		it( 'should return `[]` on a network error', async () => {
			fetchStub.mockRejectedValue( new TypeError( 'Network error' ) );

			const result = await cache.fetch( { url: URL_V16, cacheKeys: [], transform: identity } );

			expect( result ).toEqual( [] );
		} );

		describe( 'request deduplication', () => {
			it( 'should issue only one HTTP request for the same url + cacheKeys combination', async () => {
				stubFetchSuccess( RAW_EMOJI );

				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );
				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

				expect( fetchStub ).toHaveBeenCalledOnce();
			} );

			it( 'should issue separate HTTP requests for different URLs', async () => {
				stubFetchSuccess( RAW_EMOJI );

				await cache.fetch( { url: URL_V16, cacheKeys: [], transform: identity } );
				await cache.fetch( { url: URL_V15, cacheKeys: [], transform: identity } );

				expect( fetchStub ).toHaveBeenCalledTimes( 2 );
			} );

			it( 'should issue separate HTTP requests for the same URL with different cacheKeys', async () => {
				stubFetchSuccess( RAW_EMOJI );

				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );
				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:b' ], transform: identity } );

				expect( fetchStub ).toHaveBeenCalledTimes( 2 );
			} );

			it( 'should deduplicate concurrent requests for the same url + cacheKeys combination', async () => {
				let resolveFirst;
				fetchStub.mockReturnValue( new Promise( resolve => {
					resolveFirst = resolve;
				} ) );

				const p1 = cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );
				const p2 = cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

				resolveFirst( new Response( JSON.stringify( RAW_EMOJI ) ) );

				await Promise.all( [ p1, p2 ] );

				expect( fetchStub ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'transform deduplication', () => {
			it( 'should call `transform` only once for the same url + cacheKeys combination', async () => {
				stubFetchSuccess( RAW_EMOJI );

				const transform = vi.fn( identity );

				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform } );
				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform } );

				expect( transform ).toHaveBeenCalledOnce();
			} );

			it( 'should call `transform` separately for different cacheKeys on the same URL', async () => {
				stubFetchSuccess( RAW_EMOJI );

				const transformA = vi.fn( identity );
				const transformB = vi.fn( identity );

				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: transformA } );
				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:b' ], transform: transformB } );

				expect( transformA ).toHaveBeenCalledOnce();
				expect( transformB ).toHaveBeenCalledOnce();
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

				expect( resultA[ 0 ] ).toHaveProperty( 'variant', 'A' );
				expect( resultB[ 0 ] ).toHaveProperty( 'variant', 'B' );
			} );
		} );

		describe( 'retry after failure', () => {
			it( 'should allow retrying after a network error', async () => {
				fetchStub
					.mockRejectedValueOnce( new TypeError( 'Network error' ) )
					.mockResolvedValueOnce( new Response( JSON.stringify( RAW_EMOJI ) ) );

				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );
				const result = await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

				expect( fetchStub ).toHaveBeenCalledTimes( 2 );
				expect( result ).toHaveLength( 2 );
			} );

			it( 'should NOT retry after a non-OK HTTP response (entry kept as [])', async () => {
				fetchStub.mockResolvedValue( new Response( null, { status: 500 } ) );

				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );
				await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

				expect( fetchStub ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'getSync()', () => {
		it( 'should return `null` before `fetch()` is called', () => {
			const result = cache.getSync( { url: URL_V16, cacheKeys: [ 'k:a' ] } );

			expect( result ).toBeNull();
		} );

		it( 'should return `null` while `fetch()` is still in flight', () => {
			fetchStub.mockReturnValue( new Promise( () => {} ) );

			cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

			const result = cache.getSync( { url: URL_V16, cacheKeys: [ 'k:a' ] } );

			expect( result ).toBeNull();
		} );

		it( 'should return the transformed array after `fetch()` resolves', async () => {
			stubFetchSuccess( RAW_EMOJI );

			await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

			const result = cache.getSync( { url: URL_V16, cacheKeys: [ 'k:a' ] } );

			expect( result ).toHaveLength( 2 );
			expect( result[ 0 ] ).toHaveProperty( 'annotation', 'neutral face' );
		} );

		it( 'should return `[]` after `fetch()` resolves with an empty result', async () => {
			fetchStub.mockResolvedValue( new Response( JSON.stringify( [] ) ) );

			await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

			expect( cache.getSync( { url: URL_V16, cacheKeys: [ 'k:a' ] } ) ).toEqual( [] );
		} );

		it( 'should return `null` for a different cacheKeys combination', async () => {
			stubFetchSuccess( RAW_EMOJI );

			await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

			const result = cache.getSync( { url: URL_V16, cacheKeys: [ 'k:b' ] } );

			expect( result ).toBeNull();
		} );

		it( 'should return `null` for a different URL', async () => {
			stubFetchSuccess( RAW_EMOJI );

			await cache.fetch( { url: URL_V16, cacheKeys: [], transform: identity } );

			const result = cache.getSync( { url: URL_V15, cacheKeys: [] } );

			expect( result ).toBeNull();
		} );
	} );

	describe( 'clear()', () => {
		it( 'should make getSync() return `null` after clearing', async () => {
			stubFetchSuccess( RAW_EMOJI );

			await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform: identity } );

			cache.clear();

			expect( cache.getSync( { url: URL_V16, cacheKeys: [ 'k:a' ] } ) ).toBeNull();
		} );

		it( 'should cause a new HTTP request after clearing', async () => {
			stubFetchSuccess( RAW_EMOJI );

			await cache.fetch( { url: URL_V16, cacheKeys: [], transform: identity } );

			cache.clear();

			await cache.fetch( { url: URL_V16, cacheKeys: [], transform: identity } );

			expect( fetchStub ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should cause `transform` to be called again after clearing', async () => {
			stubFetchSuccess( RAW_EMOJI );

			const transform = vi.fn( identity );

			await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform } );

			cache.clear();

			await cache.fetch( { url: URL_V16, cacheKeys: [ 'k:a' ], transform } );

			expect( transform ).toHaveBeenCalledTimes( 2 );
		} );
	} );

	function stubFetchSuccess( data ) {
		fetchStub.mockImplementation( () => Promise.resolve( new Response( JSON.stringify( data ) ) ) );
	}

	function identity( raw ) {
		return raw;
	}
} );
