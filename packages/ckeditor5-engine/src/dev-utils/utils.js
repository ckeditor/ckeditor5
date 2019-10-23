/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/dev-utils/utils
 */

/**
 * Helper function, converts a map to the 'key1="value1" key2="value1"' format.
 *
 * @private
 * @param {Map} map Map to convert.
 * @returns {String} Converted map.
 */
export function convertMapToTags( map ) {
	let string = '';

	for ( const entry of map ) {
		string += ` ${ entry[ 0 ] }=${ JSON.stringify( entry[ 1 ] ) }`;
	}

	return string;
}

/**
 * Helper function, converts a map to the '{"key1":"value1","key2":"value2"}' format.
 *
 * @private
 * @param {Map} map Map to convert.
 * @returns {String} Converted map.
 */
export function convertMapToStringifiedObject( map ) {
	const obj = {};

	for ( const entry of map ) {
		obj[ entry[ 0 ] ] = entry[ 1 ];
	}

	return JSON.stringify( obj );
}
