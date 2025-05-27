/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module watchdog/utils/getsubnodes
 */

export default function getSubNodes( head: unknown, excludedProperties = new Set() ): Set<unknown> {
	const nodes = [ head ];

	// @if CK_DEBUG_WATCHDOG // const prevNodeMap = new Map();

	// Nodes are stored to prevent infinite looping.
	const subNodes = new Set();
	let nodeIndex = 0;

	while ( nodes.length > nodeIndex ) {
		// Incrementing the iterator is much faster than changing size of the array with Array.prototype.shift().
		const node = nodes[ nodeIndex++ ];

		if ( subNodes.has( node ) || !shouldNodeBeIncluded( node ) || excludedProperties.has( node ) ) {
			continue;
		}

		subNodes.add( node );

		// Handle arrays, maps, sets, custom collections that implements `[ Symbol.iterator ]()`, etc.
		if ( Symbol.iterator in node ) {
			// The custom editor iterators might cause some problems if the editor is crashed.
			try {
				for ( const n of node as Iterable<unknown> ) {
					nodes.push( n );

					// @if CK_DEBUG_WATCHDOG // if ( !prevNodeMap.has( n ) ) {
					// @if CK_DEBUG_WATCHDOG // 	prevNodeMap.set( n, node );
					// @if CK_DEBUG_WATCHDOG // }
				}
			} catch {
				// Do not log errors for broken structures
				// since we are in the error handling process already.
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

	// @if CK_DEBUG_WATCHDOG // return { subNodes, prevNodeMap } as any;

	return subNodes;
}

function shouldNodeBeIncluded( node: unknown ): node is Record<string, unknown> | Iterable<unknown> {
	const type = Object.prototype.toString.call( node );
	const typeOfNode = typeof node;

	return !(
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
		( node as any )._watchdogExcluded ||

		// Skip native DOM objects, e.g. Window, nodes, events, etc.
		node instanceof EventTarget ||
		node instanceof Event
	);
}
