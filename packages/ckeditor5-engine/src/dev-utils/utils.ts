/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * Note: This package is used only internally for debugging purposes and should not be used
 * in other environments. It uses a few special methods not existing in the default
 * building process. That is also why there are no tests for this file.
 *
 * @module engine/dev-utils/utils
 */

/* globals console */

/**
 * Helper function, converts a map to the 'key1="value1" key2="value1"' format.
 *
 * @param map Map to convert.
 * @returns Converted map.
 */
export function convertMapToTags( map: Iterable<[ string, unknown ]> ): string {
	let string = '';

	for ( const entry of map ) {
		string += ` ${ entry[ 0 ] }=${ JSON.stringify( entry[ 1 ] ) }`;
	}

	return string;
}

/**
 * Helper function, converts a map to the `{"key1":"value1","key2":"value2"}` format.
 *
 * @param map Map to convert.
 * @returns Converted map.
 */
export function convertMapToStringifiedObject( map: Iterable<[ string, unknown ]> ): string {
	const obj: any = {};

	for ( const entry of map ) {
		obj[ entry[ 0 ] ] = entry[ 1 ];
	}

	return JSON.stringify( obj );
}

const treeDump = Symbol( '_treeDump' );
const maxTreeDumpLength = 20;

/**
 * Helper function that stores the `document` state for a given `version`.
 */
export function dumpTrees( document: any, version: any ): void {
	console.log( document, version );

	let string = '';

	for ( const root of document.roots ) {
		string += root.printTree() + '\n';
	}

	document[ treeDump ][ version ] = string.substr( 0, string.length - 1 ); // Remove the last "\n".

	const overflow = document[ treeDump ].length - maxTreeDumpLength;

	if ( overflow > 0 ) {
		document[ treeDump ][ overflow - 1 ] = null;
	}
}

/**
 * Helper function that initializes document dumping.
 */
export function initDocumentDumping( document: any ): void {
	document[ treeDump ] = [];
}

/**
 * Helper function that logs document for the given version.
 */
export function logDocument( document: any, version: any ): void {
	console.log( '--------------------' );

	if ( document[ treeDump ][ version ] ) {
		console.log( document[ treeDump ][ version ] );
	} else {
		console.log( 'Tree log unavailable for given version: ' + version );
	}
}
