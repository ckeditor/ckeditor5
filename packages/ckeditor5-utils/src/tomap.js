/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import isPlainObject from './lib/lodash/isPlainObject.js';
import objectToMap from './objecttomap.js';

/**
 * Transforms object or iterable to map. Iterable needs to be in the format acceptable by the `Map` constructor.
 *
 *		map = toMap( { 'foo': 1, 'bar': 2 } );
 *		map = toMap( [ [ 'foo', 1 ], [ 'bar', 2 ] ] );
 *		map = toMap( anotherMap );
 *
 * @memberOf utils
 * @param {Object|Iterable} data Object or iterable to transform.
 * @returns {Map} Map created from data.
 */
export default function toMap( data ) {
	if ( isPlainObject( data ) ) {
		return objectToMap( data );
	} else {
		return new Map( data );
	}
}
