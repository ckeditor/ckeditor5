/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/tomap
 */

import objectToMap from './objecttomap.js';
import isIterable from './isiterable.js';

/**
 * Transforms object or iterable to map. Iterable needs to be in the format acceptable by the `Map` constructor.
 *
 * ```ts
 * map = toMap( { 'foo': 1, 'bar': 2 } );
 * map = toMap( [ [ 'foo', 1 ], [ 'bar', 2 ] ] );
 * map = toMap( anotherMap );
 * ```
 *
 * @param data Object or iterable to transform.
 * @returns Map created from data.
 */
export default function toMap<T>( data: { readonly [ key: string ]: T } | Iterable<readonly [ string, T ]> | null | undefined ):
Map<string, T>
{
	if ( isIterable( data ) ) {
		return new Map( data );
	} else {
		return objectToMap( data );
	}
}
