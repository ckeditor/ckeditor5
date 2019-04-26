/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/tomap
 */

import objectToMap from './objecttomap';
import { isPlainObject } from 'lodash-es';

/**
 * Transforms object or iterable to map. Iterable needs to be in the format acceptable by the `Map` constructor.
 *
 *		map = toMap( { 'foo': 1, 'bar': 2 } );
 *		map = toMap( [ [ 'foo', 1 ], [ 'bar', 2 ] ] );
 *		map = toMap( anotherMap );
 *
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
