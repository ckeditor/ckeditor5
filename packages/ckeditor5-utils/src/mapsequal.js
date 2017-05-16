/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/mapsequal
 */

/**
 * Checks whether given {Map}s are equal, that is has same size and same key-value pairs.
 *
 * @returns {Boolean} `true` if given maps are equal, `false` otherwise.
 */
export default function mapsEqual( mapA, mapB ) {
	if ( mapA.size != mapB.size ) {
		return false;
	}

	for ( const attr of mapA.entries() ) {
		const valA = JSON.stringify( attr[ 1 ] );
		const valB = JSON.stringify( mapB.get( attr[ 0 ] ) );

		if ( valA !== valB ) {
			return false;
		}
	}

	return true;
}
