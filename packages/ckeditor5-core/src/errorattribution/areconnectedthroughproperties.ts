/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/errorattribution/areconnectedthroughproperties
 */

import { getSubNodes } from './getsubnodes.js';

/**
 * Traverses both structures to find out whether there is a reference that is shared between both structures.
 *
 * @internal
 */
export function areConnectedThroughProperties(
	target1: unknown,
	target2: unknown,
	excludedNodes: Set<unknown> = new Set()
): boolean {
	if ( target1 === target2 && isObject( target1 ) ) {
		return true;
	}

	const subNodes1 = getSubNodes( target1, excludedNodes );
	const subNodes2 = getSubNodes( target2, excludedNodes );

	for ( const node of subNodes1 ) {
		if ( subNodes2.has( node ) ) {
			return true;
		}
	}

	return false;
}

function isObject( structure: unknown ): boolean {
	return typeof structure === 'object' && structure !== null;
}
