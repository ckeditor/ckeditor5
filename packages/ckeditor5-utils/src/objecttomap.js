/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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
