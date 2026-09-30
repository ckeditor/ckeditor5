/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/errorattribution/getsubnodes
 */

/**
 * @internal
 */
export function getSubNodes( head: unknown, excludedProperties: Set<unknown> = new Set() ): Set<unknown> {
	const nodes = [ head ];

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
			}
		}
	}

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

		// Excludes singletons shared across editor instances, so that an error thrown in one editor is not
		// attributed to every other editor reachable through the same singleton. Set by `TooltipManager`.
		// The name predates this module; it is kept as is because the flag goes away together with the
		// search this file performs.
		// More in https://github.com/ckeditor/ckeditor5/issues/12292.
		( node as any )._watchdogExcluded ||

		// Skip native DOM objects, e.g. Window, nodes, events, etc.
		node instanceof EventTarget ||
		node instanceof Event
	);
}
