/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module watchdog/utils/getsubnodes
 */

/* globals EventTarget, Event */

export default function getSubNodes( head, excludedProperties = new Set() ) {
	const nodes = [ head ];

	// @if CK_DEBUG_WATCHDOG // const prevNodeMap = new Map();

	// Nodes are stored to prevent infinite looping.
	const subNodes = new Set();
	let nodeIndex = 0;

	while ( nodes.length > nodeIndex ) {
		// Incrementing the iterator is much faster than changing size of the array with Array.prototype.shift().
		const node = nodes[ nodeIndex++ ];

		if ( subNodes.has( node ) || shouldNodeBeSkipped( node ) || excludedProperties.has( node ) ) {
			continue;
		}

		subNodes.add( node );

		// Handle arrays, maps, sets, custom collections that implements `[ Symbol.iterator ]()`, etc.
		if ( node[ Symbol.iterator ] ) {
			// The custom editor iterators might cause some problems if the editor is crashed.
			try {
				for ( const n of node ) {
					nodes.push( n );

					// @if CK_DEBUG_WATCHDOG // if ( !prevNodeMap.has( n ) ) {
					// @if CK_DEBUG_WATCHDOG // 	prevNodeMap.set( n, node );
					// @if CK_DEBUG_WATCHDOG // }
				}
			} catch ( err ) {
				// Do not log errors for broken structures
				// since we are in the error handling process already.
				// eslint-disable-line no-empty
			}
		} else {
			for ( const key in node ) {
				// We share a reference via the protobuf library within the editors,
				// hence the shared value should be skipped. Although, it's not a perfect
				// solution since new places like that might occur in the future.
				if ( key === 'defaultValue' ) {
					continue;
				}

				nodes.push( node[ key ] );

				// @if CK_DEBUG_WATCHDOG // if ( !prevNodeMap.has( node[ key ] ) ) {
				// @if CK_DEBUG_WATCHDOG // 	prevNodeMap.set( node[ key ], node );
				// @if CK_DEBUG_WATCHDOG // }
			}
		}
	}

	// @if CK_DEBUG_WATCHDOG // return { subNodes, prevNodeMap };

	return subNodes;
}

function shouldNodeBeSkipped( node ) {
	const type = Object.prototype.toString.call( node );
	const typeOfNode = typeof node;

	return (
		typeOfNode === 'number' ||
		typeOfNode === 'boolean' ||
		typeOfNode === 'string' ||
		typeOfNode === 'symbol' ||
		typeOfNode === 'function' ||
		type === '[object Date]' ||
		type === '[object RegExp]' ||
		type === '[object Module]' ||

		node === undefined ||
		node === null ||

		// This flag is meant to exclude singletons shared across editor instances. So when an error is thrown in one editor,
		// the other editors connected through the reference to the same singleton are not restarted. This is a temporary workaround
		// until a better solution is found.
		// More in https://github.com/ckeditor/ckeditor5/issues/12292.
		node._watchdogExcluded === true ||

		// Skip native DOM objects, e.g. Window, nodes, events, etc.
		node instanceof EventTarget ||
		node instanceof Event
	);
}
