/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/findlinkrange
 */

import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

/**
 * Walks backward and forward from the start position, node by node, as long as they have the same `linkHref` attribute value and return
 * a {@link module:engine/model/range~Range Range} with the found link.
 *
 * @param {module:engine/model/position~Position} position The start position.
 * @param {String} value The `linkHref` attribute value.
 * @returns {module:engine/model/range~Range} The link range.
 */
export default function findLinkRange( position, value ) {
	return new Range( _findBound( position, value, true ), _findBound( position, value, false ) );
}

// Walks forward or backward (depends on the `lookBack` flag), node by node, as long as they have the same `linkHref` attribute value
// and returns a position just before or after (depends on the `lookBack` flag) the last matched node.
//
// @param {module:engine/model/position~Position} position The start position.
// @param {String} value The `linkHref` attribute value.
// @param {Boolean} lookBack Whether the walk direction is forward (`false`) or backward (`true`).
// @returns {module:engine/model/position~Position} The position just before the last matched node.
function _findBound( position, value, lookBack ) {
	// Get node before or after position (depends on `lookBack` flag).
	// When position is inside text node then start searching from text node.
	let node = position.textNode || ( lookBack ? position.nodeBefore : position.nodeAfter );

	let lastNode = null;

	while ( node && node.getAttribute( 'linkHref' ) == value ) {
		lastNode = node;
		node = lookBack ? node.previousSibling : node.nextSibling;
	}

	return lastNode ? Position.createAt( lastNode, lookBack ? 'before' : 'after' ) : position;
}
