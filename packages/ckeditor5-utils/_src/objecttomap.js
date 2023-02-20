/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * This is just a temporary migration file, please ignore it. This will be removed after migration to TypeScript is complete.
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
 * @param {Object} obj Object to transform.
 * @returns {Map} Map created from object.
 */
export default function objectToMap( obj ) {
	const map = new Map();

	for ( const key in obj ) {
		map.set( key, obj[ key ] );
	}

	return map;
}
