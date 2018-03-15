/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/dom/insertat
 */

/**
 * Inserts node to the parent at given index.
 *
 * @param {Element} parentElement Parent element.
 * @param {Number} index Insertions index.
 * @param {Node} nodeToInsert Node to insert.
 */
export default function insertAt( parentElement, index, nodeToInsert ) {
	parentElement.insertBefore( nodeToInsert, parentElement.childNodes[ index ] || null );
}
