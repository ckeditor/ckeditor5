/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/objecttomap
 */

/**
 * Transforms object to map.
 *
 *		const map = objectToMap( { 'foo': 1, 'bar': 2 } );
 *		map.get( 'foo' ); // 1
 *
 * **Note**: For mixed data (`Object` or `Iterable`) there's a dedicated {@link module:utils/tomap~toMap} function.
 *
 * @param {Object|null} obj Object to transform.
 * @returns {Map} Map created from object.
 */
export default function objectToMap<T>( obj: { readonly [ key: string ]: T } | null | undefined ): Map<string, T> {
	const map = new Map<string, T>();

	for ( const key in obj ) {
		map.set( key, obj[ key ] );
	}

	return map;
}
