/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Inserts node to the parent at given index.
 *
 * @method utils.dom.insertAt
 * @param {Element} parentElement Parent element.
 * @param {Number} index Insertions index.
 * @param {Node} nodeToInsert Node to insert.
 */
export default function insertAt( parentElement, index, nodeToInsert ) {
	parentElement.insertBefore( nodeToInsert, parentElement.childNodes[ index ] || null );
}
