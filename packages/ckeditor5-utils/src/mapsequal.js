/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Checks whether given {Map}s are equal, that is has same size and same key-value pairs.
 *
 * @memberOf utils
 * @returns {Boolean} `true` if given maps are equal, `false` otherwise.
 */
export default function mapsEqual( mapA, mapB ) {
	if ( mapA.size != mapB.size ) {
		return false;
	}

	for ( let attr of mapA.entries() ) {
		let valA = JSON.stringify( attr[ 1 ] );
		let valB = JSON.stringify( mapB.get( attr[ 0 ] ) );

		if ( valA !== valB ) {
			return false;
		}
	}

	return true;
}
