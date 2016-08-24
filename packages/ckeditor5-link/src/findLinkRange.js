/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Range from '../engine/model/range.js';
import Position from '../engine/model/position.js';

/**
 * Walk backward and forward from start position node by node as long as they have the same `linkHref` attribute value and return
 * {@link engine.model.Range Range} with founded link.
 *
 * @param {engine.model.Position} position Start position.
 * @param {String} value `linkHref` attribute value.
 * @returns {engine.model.Range} Link range.
 */
export default function findLinkRange( position, value ) {
	return new Range( _findBackwardBound( position, value ), _findForwardBound( position, value ) );
}

// Walk backward node by node as long as they have the same `linkHref` attribute value and return position just before last matched node.
//
// @param {engine.model.Position} position Start position.
// @param {String} value `linkHref` attribute value.
// @returns {engine.model.Position} Position just before last matched node.
function _findBackwardBound( position, value ) {
	// Get node before position. When position is inside text node then start searching from text node.
	let node = position.textNode === null ? position.nodeBefore : position.textNode;

	// When node doesn't match it means we are at the beginning of link.
	if ( !node || node.getAttribute( 'linkHref' ) != value ) {
		return position;
	}

	let lastNode = node;

	while ( node ) {
		// When node doesn't match it means that previous node is the last matches node and we need to return position before it.
		if ( node.getAttribute( 'linkHref' ) != value ) {
			return Position.createBefore( lastNode );
		}

		lastNode = node;
		node = node.previousSibling;
	}

	// We reach the bound.
	return Position.createBefore( lastNode );
}

// Walk forward node by node as long as they have the same `linkHref` attribute value and return position just after last matched node.
//
// @param {engine.model.Position} position Start position.
// @param {String} value `linkHref` attribute value.
// @returns {engine.model.Position} Position just after last matched node.
function _findForwardBound( position, value ) {
	// Get node after position. When position is inside text node then start searching from text node.
	let node = position.textNode === null ? position.nodeAfter : position.textNode;

	// When node doesn't match it means we are at the end of link.
	if ( !node || node.getAttribute( 'linkHref' ) != value ) {
		return position;
	}

	let lastNode = node;

	while ( node ) {
		// When node doesn't match it means that previous node is the last matches node and we need to return position after it.
		if ( node.getAttribute( 'linkHref' ) != value ) {
			return Position.createAfter( lastNode );
		}

		lastNode = node;
		node = node.nextSibling;
	}

	// We reach the bound.
	return Position.createAfter( lastNode );
}
