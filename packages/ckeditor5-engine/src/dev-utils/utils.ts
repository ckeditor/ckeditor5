/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Note: This package is used only internally for debugging purposes and should not be used
 * in other environments. It uses a few special methods not existing in the default
 * building process. That is also why there are no tests for this file.
 *
 * @module engine/dev-utils/utils
 */

// @if CK_DEBUG_TYPING // const { debounce } = require( 'es-toolkit/compat' );

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

// @if CK_DEBUG_TYPING // export const _debouncedLine = debounce( () => {
// @if CK_DEBUG_TYPING // 	console.log(
// @if CK_DEBUG_TYPING // 		'%c───────────────────────────────────────────────────────────────────────────────────────────────────────',
// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: red'
// @if CK_DEBUG_TYPING // 	);
// @if CK_DEBUG_TYPING // }, 300 );

// @if CK_DEBUG_TYPING // export function _buildLogMessage( context, className, message = '', ...rest ) {
// @if CK_DEBUG_TYPING // 	const editor = _findAllEditorInstances().find( editor => (
// @if CK_DEBUG_TYPING // 		_getLogNodes( editor ).includes( context )
// @if CK_DEBUG_TYPING // 	) );
// @if CK_DEBUG_TYPING // 	const editorName = editor && Object.getPrototypeOf( editor ).constructor.name;
// @if CK_DEBUG_TYPING // 	const editorPrefix = editor ? `${ editorName }-${ editor.id.slice( -4 ) } ` : 'UNKNOWN ';
// @if CK_DEBUG_TYPING // 	return [
// @if CK_DEBUG_TYPING // 		`%c${ editorPrefix }%c[${ className }]%c ${ message }`,
// @if CK_DEBUG_TYPING //		'font-weight: normal;',
// @if CK_DEBUG_TYPING //		'font-weight: bold; color: green',
// @if CK_DEBUG_TYPING //		'',
// @if CK_DEBUG_TYPING // 		...rest
// @if CK_DEBUG_TYPING // 	];
// @if CK_DEBUG_TYPING // }

// @if CK_DEBUG_TYPING // function _findAllEditorInstances() {
// @if CK_DEBUG_TYPING // 	const editors = new Set();
// @if CK_DEBUG_TYPING // 	for ( const domEditable of document.querySelectorAll( '.ck.ck-content.ck-editor__editable' ) ) {
// @if CK_DEBUG_TYPING // 		if ( domEditable.ckeditorInstance ) {
// @if CK_DEBUG_TYPING // 			editors.add( domEditable.ckeditorInstance );
// @if CK_DEBUG_TYPING // 		}
// @if CK_DEBUG_TYPING // 	}
// @if CK_DEBUG_TYPING // 	return Array.from( editors );
// @if CK_DEBUG_TYPING // }

// @if CK_DEBUG_TYPING // function _getLogNodes( editor ) {
// @if CK_DEBUG_TYPING // 	return [
// @if CK_DEBUG_TYPING // 		editor.editing.view._renderer,
// @if CK_DEBUG_TYPING // 		editor.editing.view.domConverter,
// @if CK_DEBUG_TYPING // 		...editor.editing.view._observers.values(),
// @if CK_DEBUG_TYPING // 		editor.plugins.get( 'Input' ),
// @if CK_DEBUG_TYPING // 		editor.plugins.get( 'Input' )._typingQueue,
// @if CK_DEBUG_TYPING // 		editor.plugins.get( 'WidgetTypeAround' ),
// @if CK_DEBUG_TYPING // 		editor.commands.get( 'delete' ),
// @if CK_DEBUG_TYPING // 		editor.commands.get( 'deleteForward' )
// @if CK_DEBUG_TYPING // 	];
// @if CK_DEBUG_TYPING // }
