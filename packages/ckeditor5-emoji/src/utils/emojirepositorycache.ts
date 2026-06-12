/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/utils/emojirepositorycache
 */

import type { EmojiCdnResource, EmojiEntry } from '../emojirepository.js';

/**
 * Cache for emoji repository data.
 *
 * @internal
 */
export class EmojiRepositoryCache {
	/**
	 * Fetch-and-transform promises, keyed by composite key.
	 */
	private _cache = new Map<string, InspectablePromise<Array<EmojiEntry>>>();

	/**
	 * Fetches emoji data for `url`, runs it through `transform`, and caches the result.
	 * At most one HTTP request is issued per unique `[url, ...cacheKeys]` combination.
	 * Returns `[]` on network or HTTP failure.
	 *
	 * @param params Fetch parameters.
	 * @param params.url URL of the emoji repository JSON file.
	 * @param params.cacheKeys Extra segments that differentiate results for the same URL.
	 *   The URL itself is always the first segment of the composite key.
	 * @param params.transform Converts raw CDN resources into `EmojiEntry` objects.
	 */
	public async fetch( { url, cacheKeys, transform }: FetchParams ): Promise<Array<EmojiEntry>> {
		const key = compositeKey( url, cacheKeys );

		if ( this._cache.has( key ) ) {
			return this._cache.get( key )!.promise;
		}

		const promise = fetch( url, { cache: 'force-cache' } )
			.then( ( response ): Promise<Array<EmojiCdnResource>> => response.ok ? response.json() : Promise.resolve( [] ) )
			.then( ( raw: Array<EmojiCdnResource> ) => transform( raw ) )
			.catch( () => {
				this._cache.delete( key );
				return [] as Array<EmojiEntry>;
			} );

		this._cache.set( key, createInspectablePromise( promise ) );

		return promise;
	}

	/**
	 * Synchronously returns the already-transformed array for the given `url` + `cacheKeys`,
	 * or `null` if the result is not yet available.
	 */
	public getSync( { url, cacheKeys }: CacheKeyParams ): Array<EmojiEntry> | null {
		const entry = this._cache.get( compositeKey( url, cacheKeys ) );

		if ( !entry || entry.status !== 'fulfilled' ) {
			return null;
		}

		return entry.value;
	}

	/**
	 * Clears the cache.
	 */
	public clear(): void {
		this._cache.clear();
	}
}

type CacheKeyParams = {
	url: string;
	cacheKeys: Array<string>;
};

type FetchParams = CacheKeyParams & {
	transform: ( raw: Array<EmojiCdnResource> ) => Array<EmojiEntry>;
};

/**
 * Creates a composite cache key from a URL and additional key segments.
 */
function compositeKey( url: string, cacheKeys: Array<string> ): string {
	return [ url, ...cacheKeys ].join( '|' );
}

/**
 * Wraps a `Promise` so its settled value is readable synchronously via `status` and `value`.
 */
function createInspectablePromise<R>( promise: Promise<R> ): InspectablePromise<R> {
	const state: InspectablePromise<R> = {
		promise,
		status: 'pending',
		value: undefined
	};

	promise.then( resolved => {
		Object.assign( state, {
			status: 'fulfilled',
			value: resolved
		} );
	} );

	return state;
}

/**
 * A `Promise` wrapper that also exposes the settled status and value synchronously.
 */
type InspectablePromise<T> = { promise: Promise<T> } & (
	| { status: 'pending'; value: undefined }
	| { status: 'fulfilled'; value: T }
);
