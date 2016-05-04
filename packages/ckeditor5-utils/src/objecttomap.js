/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Transforms object to map.
 *
 *		const map = objectToMap( { 'foo': 1, 'bar': 2 } );
 *		map.get( 'foo' ); // 1
 *
 * @memberOf utils
 * @param {Object} obj Object to transform.
 * @returns {Map} Map created from object.
 */
export default function( obj ) {
	const map = new Map();

	for ( let key in obj ) {
		map.set( key, obj[ key ] );
	}

	return map;
}
