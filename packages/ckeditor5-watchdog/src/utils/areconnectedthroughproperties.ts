/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module watchdog/utils/areconnectedthroughproperties
 */

import getSubNodes from './getsubnodes.js';

/**
 * Traverses both structures to find out whether there is a reference that is shared between both structures.
 */
export default function areConnectedThroughProperties( target1: unknown, target2: unknown, excludedNodes = new Set() ): boolean {
	if ( target1 === target2 && isObject( target1 ) ) {
		return true;
	}

	// @if CK_DEBUG_WATCHDOG // return checkConnectionBetweenProps( target1, target2, excludedNodes );

	const subNodes1 = getSubNodes( target1, excludedNodes );
	const subNodes2 = getSubNodes( target2, excludedNodes );

	for ( const node of subNodes1 ) {
		if ( subNodes2.has( node ) ) {
			return true;
		}
	}

	return false;
}

/* istanbul ignore next -- @preserve */
// eslint-disable-next-line
function checkConnectionBetweenProps( target1: unknown, target2: unknown, excludedNodes: any ) {
	const { subNodes: subNodes1, prevNodeMap: prevNodeMap1 } = getSubNodes( target1, excludedNodes.subNodes ) as any;
	const { subNodes: subNodes2, prevNodeMap: prevNodeMap2 } = getSubNodes( target2, excludedNodes.subNodes ) as any;

	for ( const sharedNode of subNodes1 ) {
		if ( subNodes2.has( sharedNode ) ) {
			const connection = [];

			connection.push( sharedNode );

			let node = prevNodeMap1.get( sharedNode );

			while ( node && node !== target1 ) {
				connection.push( node );
				node = prevNodeMap1.get( node );
			}

			node = prevNodeMap2.get( sharedNode );

			while ( node && node !== target2 ) {
				connection.unshift( node );
				node = prevNodeMap2.get( node );
			}

			console.log( '--------' );
			console.log( { target1 } );
			console.log( { sharedNode } );
			console.log( { target2 } );
			console.log( { connection } );

			return true;
		}
	}

	return false;
}

function isObject( structure: unknown ): boolean {
	return typeof structure === 'object' && structure !== null;
}
